import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createHash } from 'node:crypto';
import { createApp } from '../app.mjs';
import { createEmailSender } from '../account.mjs';
const registration = email => ({ email, password: 'original-password-123', adult: true, profile: { nickname: 'Owner', city: 'seoul', bio: '', lookingFor: '', interests: [], languages: ['ko'], avatar: 'dove' } });
async function setup(t, options = {}) {
  let now = 1800000000000; const mail = [];
  const ctx = createApp({ filename: ':memory:', mode: 'test', clock: () => now, sendEmail: async m => mail.push(m), ...options });
  t.after(() => ctx.db.close()); const api = request(ctx.app);
  const r = await api.post('/auth/register').send(registration('owner@example.com')); assert.equal(r.status, 201);
  const user = r.body;
  return { ...ctx, api, user, as: (method, path) => api[method](path).set('Authorization', `Bearer ${user.token}`), mail, advance: ms => now += ms };
}
test('reset hides account existence, stores only hashes, revokes all sessions and devices, and rejects reuse', async t => {
  const f = await setup(t);
  const unknown = await f.api.post('/auth/password/request').send({ email: 'absent@example.com' });
  const known = await f.api.post('/auth/password/request').send({ email: 'OWNER@example.com', lang: 'ja' });
  assert.equal(known.status, 202); assert.deepEqual(unknown.body, known.body); assert.equal(f.mail.length, 0);
  await f.tick(); assert.equal(f.mail.length, 1); assert.equal(f.mail[0].lang, 'ja'); const token = f.mail[0].token;
  assert.equal(f.db.prepare('SELECT digest FROM account_tokens').get().digest, createHash('sha256').update(token).digest('hex'));
  const second = await f.api.post('/auth/login').send(registration('owner@example.com'));
  f.db.prepare('INSERT INTO devices VALUES(?,?)').run('test-push', f.user.profile.id);
  assert.equal((await f.api.post('/auth/password/reset').send({ token, password: 'replacement-password-123' })).status, 200);
  assert.equal((await f.as('get', '/me')).status, 401);
  assert.equal((await f.api.get('/me').set('Authorization', `Bearer ${second.body.token}`)).status, 401);
  assert.equal(f.db.prepare('SELECT count(*) n FROM devices').get().n, 0);
  assert.equal((await f.api.post('/auth/password/reset').send({ token, password: 'another-password-123' })).status, 400);
  assert.equal((await f.api.post('/auth/login').send(registration('owner@example.com'))).status, 401);
  assert.equal((await f.api.post('/auth/login').send({ email: 'owner@example.com', password: 'replacement-password-123' })).status, 200);
});
test('expired and wrong-purpose codes fail; resend cooldown and concurrent consumption work', async t => {
  const f = await setup(t);
  await f.as('post', '/auth/email/request').send({}); await f.tick();
  assert.equal((await f.api.post('/auth/password/reset').send({ token: f.mail[0].token, password: 'replacement-password-123' })).status, 400);
  await f.api.post('/auth/password/request').send({ email: 'owner@example.com' }); await f.tick();
  await f.api.post('/auth/password/request').send({ email: 'owner@example.com' }); await f.tick(); assert.equal(f.mail.length, 2);
  const expired = f.mail[1].token; f.advance(15 * 60000);
  assert.equal((await f.api.post('/auth/password/reset').send({ token: expired, password: 'replacement-password-123' })).status, 400);
  await f.api.post('/auth/password/request').send({ email: 'owner@example.com' }); await f.tick();
  const results = await Promise.all([1, 2].map(n => f.api.post('/auth/password/reset').send({ token: f.mail.at(-1).token, password: `replacement-password-${n}` })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
});
test('verification binds codes to the signed-in account and optionally gates social actions', async t => {
  const f = await setup(t, { requireEmailVerification: true });
  assert.equal((await f.as('post', '/requests').send({})).status, 403);
  assert.deepEqual((await f.as('get', '/me/account')).body, { verified: false, emailAvailable: true });
  await f.as('post', '/auth/email/request').send({ lang: 'en' }); await f.tick(); const token = f.mail[0].token;
  assert.equal((await f.api.post('/auth/email/verify').send({ token })).status, 401);
  const other = await f.api.post('/auth/register').send(registration('other@example.com'));
  assert.equal((await f.api.post('/auth/email/verify').set('Authorization', `Bearer ${other.body.token}`).send({ token })).status, 400);
  assert.equal((await f.as('post', '/auth/email/verify').send({ token })).status, 200);
  assert.equal((await f.as('post', '/auth/email/verify').send({ token })).status, 400);
  assert.equal((await f.as('get', '/me/account')).body.verified, true);
  assert.equal((await f.as('post', '/requests').send({ recipient: other.body.profile.id })).status, 201);
  assert.equal(JSON.stringify((await f.as('get', '/profiles')).body).includes('owner@example.com'), false);
});
test('missing mail configuration fails explicitly and delivery retries leave no usable failed code', async t => {
  const disabled = await setup(t, { sendEmail: null });
  assert.equal((await disabled.api.post('/auth/password/request').send({ email: 'owner@example.com' })).status, 503);
  let attempts = 0; const f = await setup(t, { sendEmail: async () => { attempts++; throw new Error('provider down'); } });
  await f.api.post('/auth/password/request').send({ email: 'owner@example.com' });
  for (let i = 0; i < 4; i++) { await f.tick(); f.advance(60000); }
  assert.equal(attempts, 3); assert.equal(f.db.prepare('SELECT count(*) n FROM account_tokens').get().n, 0);
  assert.throws(() => createApp({ filename: ':memory:', requireEmailVerification: true }), /configured mail sender/);
});
test('mail adapter calls documented provider endpoint and propagates rejection', async () => {
  let sent; const sender = createEmailSender({ apiKey: 'test-key', from: 'sender@example.com', fetcher: async (url, options) => { sent = { url, ...options }; return { ok: true }; } });
  await sender({ to: 'owner@example.com', purpose: 'reset', token: 'test-code', lang: 'ko' });
  assert.equal(sent.url, 'https://api.resend.com/emails'); assert.deepEqual(JSON.parse(sent.body).to, ['owner@example.com']);
  assert.match(JSON.parse(sent.body).text, /test-code/); assert.equal(JSON.parse(sent.body).text.includes('test-key'), false);
  const failing = createEmailSender({ apiKey: 'test-key', from: 'sender@example.com', fetcher: async () => ({ ok: false }) });
  await assert.rejects(() => failing({ to: 'owner@example.com', purpose: 'verify', token: 'test-code', lang: 'ja' }));
});
