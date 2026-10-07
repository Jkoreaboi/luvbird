import { randomBytes, createHash, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
const derive = promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const input = z.object({ token: z.string().trim().regex(/^[A-Za-z0-9_-]{43}$/) });
const language = z.enum(['ko', 'en', 'ja']).default('ko');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

// Requests survive restarts. Only token hashes are stored; raw codes exist during delivery only.
export function installAccount({ app, db, clock, authLimiter, sendEmail }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS verified_emails(user TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,verified INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS account_tokens(user TEXT REFERENCES users(id) ON DELETE CASCADE,purpose TEXT NOT NULL,digest TEXT UNIQUE NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(user,purpose));
    CREATE TABLE IF NOT EXISTS account_mail(user TEXT REFERENCES users(id) ON DELETE CASCADE,purpose TEXT NOT NULL,lang TEXT NOT NULL,created INTEGER NOT NULL,bucket INTEGER NOT NULL,count INTEGER NOT NULL,pending INTEGER NOT NULL,attempts INTEGER NOT NULL,due INTEGER NOT NULL,PRIMARY KEY(user,purpose));
  `);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  function queue(user, purpose, lang) {
    const now = clock(), previous = get('SELECT * FROM account_mail WHERE user=? AND purpose=?', user, purpose);
    if (previous && (now - previous.created < 60000 || (now - previous.bucket < 3600000 && previous.count >= 5))) return;
    const sameBucket = previous && now - previous.bucket < 3600000;
    run('INSERT OR REPLACE INTO account_mail VALUES(?,?,?,?,?,?,1,0,?)', user, purpose, lang, now, sameBucket ? previous.bucket : now, sameBucket ? previous.count + 1 : 1, now);
  }
  const verified = user => !!get('SELECT 1 FROM verified_emails WHERE user=?', user);
  app.post('/auth/password/request', authLimiter, (req, res) => {
    const { email, lang } = z.object({ email: z.email().max(254).transform(v => v.toLowerCase()), lang: language }).parse(req.body);
    if (!sendEmail) fail(503, 'email_unavailable');
    const user = get('SELECT id FROM users WHERE email=?', email);
    if (user) queue(user.id, 'reset', lang);
    // Same response and no remote email call on the request path, including unknown accounts.
    res.status(202).json({ ok: true });
  });
  app.post('/auth/password/reset', authLimiter, async (req, res) => {
    const { token, password } = input.extend({ password: z.string().min(12).max(128) }).parse(req.body);
    const digest = hash(token);
    if (!get("SELECT 1 FROM account_tokens WHERE digest=? AND purpose='reset' AND expires>?", digest, clock())) fail(400, 'invalid_account_token');
    const salt = randomBytes(16).toString('hex');
    const derived = await derive(password, salt, 64);
    db.exec('BEGIN IMMEDIATE');
    try {
      // Recheck after async hashing: only one concurrent request can consume the code.
      const row = get("SELECT * FROM account_tokens WHERE digest=? AND purpose='reset' AND expires>?", digest, clock());
      if (!row) fail(400, 'invalid_account_token');
      run('UPDATE users SET password=? WHERE id=?', `${salt}:${derived.toString('hex')}`, row.user);
      run('DELETE FROM sessions WHERE user=?', row.user);
      run('DELETE FROM deliveries WHERE token IN (SELECT token FROM devices WHERE user=?)', row.user);
      run('DELETE FROM devices WHERE user=?', row.user);
      run('DELETE FROM account_tokens WHERE user=?', row.user);
      run('UPDATE account_mail SET pending=0 WHERE user=?', row.user);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    res.json({ ok: true });
  });
  return {
    verified,
    privateRoutes() {
      app.get('/me/account', (req, res) => res.json({ verified: verified(req.user), emailAvailable: !!sendEmail }));
      app.post('/auth/email/request', authLimiter, (req, res) => {
        const { lang } = z.object({ lang: language }).parse(req.body);
        if (!sendEmail) fail(503, 'email_unavailable');
        if (!verified(req.user)) queue(req.user, 'verify', lang);
        res.status(202).json({ ok: true });
      });
      app.post('/auth/email/verify', authLimiter, (req, res) => {
        const { token } = input.parse(req.body);
        const row = get("SELECT * FROM account_tokens WHERE digest=? AND user=? AND purpose='verify' AND expires>?", hash(token), req.user, clock());
        if (!row) fail(400, 'invalid_account_token');
        db.exec('BEGIN IMMEDIATE');
        try {
          run('INSERT OR REPLACE INTO verified_emails VALUES(?,?)', req.user, clock());
          run("DELETE FROM account_tokens WHERE user=? AND purpose='verify'", req.user);
          run("UPDATE account_mail SET pending=0 WHERE user=? AND purpose='verify'", req.user);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        res.json({ ok: true });
      });
    },
    async tick() {
      run('DELETE FROM account_tokens WHERE expires<=?', clock());
      if (!sendEmail) return;
      for (const job of db.prepare('SELECT m.*,u.email FROM account_mail m JOIN users u ON u.id=m.user WHERE pending=1 AND due<=? AND attempts<3 LIMIT 10').all(clock())) {
        // Claim before awaiting the provider; keep the limiter history after completion.
        run('UPDATE account_mail SET due=?,attempts=attempts+1 WHERE user=? AND purpose=?', clock() + 60000, job.user, job.purpose);
        const token = randomBytes(32).toString('base64url');
        run('INSERT OR REPLACE INTO account_tokens VALUES(?,?,?,?)', job.user, job.purpose, hash(token), clock() + 15 * 60000);
        try {
          await sendEmail({ to: job.email, purpose: job.purpose, lang: job.lang, token });
          run('UPDATE account_mail SET pending=0 WHERE user=? AND purpose=? AND created=?', job.user, job.purpose, job.created);
        } catch {
          // A timeout may have delivered the message. Do not retain a usable uncertain code.
          run('DELETE FROM account_tokens WHERE digest=?', hash(token));
          console.error('Account email delivery failed; retry is limited to three attempts.');
        }
      }
    },
  };
}

// Provider documentation: https://resend.com/docs/api-reference/emails/send-email
export function createEmailSender({ apiKey, from, fetcher = fetch } = {}) {
  if (!apiKey || !from) return null;
  return async ({ to, purpose, token, lang }) => {
    const copy = {
      ko: ['이메일 인증', '비밀번호 재설정', 'DearBird 앱의 해당 화면에 아래 코드를 붙여넣으세요. 15분간 유효하며 한 번만 사용할 수 있습니다. 본인이 요청하지 않았다면 무시하세요.'],
      en: ['Verify your email', 'Reset your password', 'Paste this code into the matching screen in DearBird. It expires in 15 minutes and can be used once. Ignore this email if you did not request it.'],
      ja: ['メールアドレスの確認', 'パスワードの再設定', 'DearBirdの該当画面に以下のコードを貼り付けてください。有効期限は15分で、一度だけ使用できます。心当たりがなければ無視してください。'],
    }[lang];
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `DearBird · ${copy[purpose === 'verify' ? 0 : 1]}`, text: `${copy[2]}\n\n${token}` }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('email_delivery_failed');
  };
}
