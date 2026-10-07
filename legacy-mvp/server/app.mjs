import { installOperations } from "./operations.mjs";
import express from "express";
import { installAccount } from "./account.mjs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { DatabaseSync } from "node:sqlite";
import {
  randomUUID,
  randomBytes,
  createHash,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { z } from "zod";

const derive = promisify(scrypt);
const hash = (s) => createHash("sha256").update(s).digest("hex");
const DAY = 86400000;
const DAILY_REQUESTS = 3;
const ACTIVE_PALS = 3;
const DAILY_LETTERS = 3;
const PROFILE_PAGE = 100;
const PURPOSES = ["friendship", "romance", "language", "letters", "travel"];
export const cities = {
  seoul: { name: "Seoul", country: "KR", lat: 37.5665, lon: 126.978 },
  busan: { name: "Busan", country: "KR", lat: 35.1796, lon: 129.0756 },
  newyork: { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  seattle: { name: "Seattle", country: "US", lat: 47.6062, lon: -122.3321 },
  sanfrancisco: {
    name: "San Francisco",
    country: "US",
    lat: 37.7749,
    lon: -122.4194,
  },
  losangeles: {
    name: "Los Angeles",
    country: "US",
    lat: 34.0522,
    lon: -118.2437,
  },
  london: { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  tokyo: { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
};
const profileSchema = z.object({
  mbti: z.string().regex(/^(|[IE][NS][TF][JP])$/).default(""),
  purpose: z.enum(["friendship", "romance", "language", "letters", "travel"]).default("letters"),
  travelCity: z.string().trim().max(60).default(""),
  nickname: z.string().trim().min(2).max(30),
  city: z.enum(Object.keys(cities)),
  bio: z.string().trim().max(500),
  lookingFor: z.string().trim().max(160),
  interests: z.array(z.string().trim().min(1).max(24)).max(8),
  languages: z
    .array(z.enum(["ko", "en", "ja", "es", "fr", "de"]))
    .min(1)
    .max(6),
  avatar: z.enum(["dove", "flower", "moon", "sea"]),
});
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
});
const photoSchema = z.object({ data: z.string().max(11200000) });
const letterSchema = z.object({
  recipient: z.uuid(),
  body: z.string().trim().min(1).max(10000),
  photos: z.array(z.uuid()).max(3),
  paper: z.enum(["ivory", "sky", "rose"]),
  stamp: z.enum(["bird", "moon", "flower"]),
  key: z.uuid(),
});
function fail(status, code) {
  throw Object.assign(new Error(code), { status });
}

export function createApp({
  filename = "data/luvbird.sqlite",
  mode = "development",
  deliverySeconds = 86400,
  clock = Date.now,
  pushEnabled = false,
  pushFetch = fetch,
  sendEmail = null,
  requireEmailVerification = false,
  trustProxyHops = 0,
  operationsToken = null,
  devWebOrigins = [],
} = {}) {
  if (!["development", "staging", "production", "test"].includes(mode))
    throw new Error("Invalid APP_ENV");
  if (mode === "production" && deliverySeconds !== 86400)
    throw new Error("Production delivery must equal 24 hours");
  if (!Number.isFinite(deliverySeconds) || deliverySeconds < 1)
    throw new Error("Invalid delivery duration");
  if (requireEmailVerification && !sendEmail) throw new Error("Email verification requires a configured mail sender");
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,profile TEXT NOT NULL,created INTEGER NOT NULL,notify INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user TEXT REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,sender TEXT REFERENCES users(id) ON DELETE CASCADE,recipient TEXT REFERENCES users(id) ON DELETE CASCADE,status TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS requests_pair ON requests(sender,recipient,status);
    CREATE TABLE IF NOT EXISTS blocks(owner TEXT REFERENCES users(id) ON DELETE CASCADE,target TEXT REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(owner,target));
    CREATE TABLE IF NOT EXISTS letters(id TEXT PRIMARY KEY,sender TEXT REFERENCES users(id) ON DELETE CASCADE,recipient TEXT REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL,paper TEXT NOT NULL,stamp TEXT NOT NULL,sent INTEGER NOT NULL,arrives INTEGER NOT NULL,origin TEXT NOT NULL,destination TEXT NOT NULL,idem TEXT NOT NULL,digest TEXT NOT NULL,cancelled INTEGER DEFAULT 0,UNIQUE(sender,idem));
    CREATE INDEX IF NOT EXISTS letters_delivery ON letters(arrives,cancelled);
    CREATE TABLE IF NOT EXISTS photos(id TEXT PRIMARY KEY,owner TEXT REFERENCES users(id) ON DELETE CASCADE,letter TEXT REFERENCES letters(id) ON DELETE CASCADE,bytes BLOB NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS photo_uploads(owner TEXT REFERENCES users(id) ON DELETE CASCADE,key TEXT,digest TEXT,photo TEXT REFERENCES photos(id) ON DELETE CASCADE,PRIMARY KEY(owner,key));
    CREATE TABLE IF NOT EXISTS avatars(owner TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS drafts(owner TEXT REFERENCES users(id) ON DELETE CASCADE,recipient TEXT REFERENCES users(id) ON DELETE CASCADE,data TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(owner,recipient));
    CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,reporter TEXT REFERENCES users(id) ON DELETE SET NULL,target TEXT REFERENCES users(id) ON DELETE SET NULL,reason TEXT NOT NULL,created INTEGER NOT NULL,status TEXT DEFAULT 'open');
    CREATE TABLE IF NOT EXISTS devices(token TEXT PRIMARY KEY,user TEXT REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,user TEXT REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL,ref TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS deliveries(event TEXT REFERENCES events(id) ON DELETE CASCADE,token TEXT,status TEXT NOT NULL,ticket TEXT,updated INTEGER NOT NULL,PRIMARY KEY(event,token));
    PRAGMA user_version=1;
  `);
  const get = (s, ...a) => db.prepare(s).get(...a),
    all = (s, ...a) => db.prepare(s).all(...a),
    run = (s, ...a) => db.prepare(s).run(...a);
  function tx(fn) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  const blocked = (a, b) =>
    !!get("SELECT 1 FROM suspensions WHERE user IN (?,?)", a, b) ||
    !!get(
      "SELECT 1 FROM blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)",
      a,
      b,
      b,
      a,
    );
  const connected = (a, b) =>
    !!get(
      "SELECT 1 FROM requests WHERE status='accepted' AND ((sender=? AND recipient=?) OR (sender=? AND recipient=?))",
      a,
      b,
      b,
      a,
    );
  const publicProfile = (id) => {
    const u = get("SELECT id,profile FROM users WHERE id=?", id);
    if (!u) fail(404, "not_found");
    return {
      id: u.id,
      ...JSON.parse(u.profile),
      hasPhoto: !!get("SELECT owner FROM avatars WHERE owner=?", id),
      avatarVersion: (() => { const a = get("SELECT bytes FROM avatars WHERE owner=?", id); return a ? hash(Buffer.from(a.bytes)).slice(0, 16) : null; })(),
    };
  };
  const event = (user, kind, ref) =>
    run(
      "INSERT OR IGNORE INTO events VALUES(?,?,?,?,?)",
      `${kind}:${ref}:${user}`,
      user,
      kind,
      ref,
      clock(),
    );
  const createSession = (user) => {
    const token = randomBytes(32).toString("base64url");
    run(
      "INSERT INTO sessions VALUES(?,?,?)",
      hash(token),
      user,
      clock() + 30 * DAY,
    );
    return token;
  };
  function envelope(row) {
    return {
      id: row.id,
      sender: publicProfile(row.sender),
      recipient: publicProfile(row.recipient),
      sent: row.sent,
      arrives: row.arrives,
      origin: JSON.parse(row.origin),
      destination: JSON.parse(row.destination),
      arrived: clock() >= row.arrives,
    };
  }
  function visibleLetter(id, user, content = false) {
    const l = get("SELECT * FROM letters WHERE id=?", id);
    if (
      !l ||
      ![l.sender, l.recipient].includes(user) ||
      l.cancelled ||
      blocked(l.sender, l.recipient)
    )
      fail(404, "not_found");
    if (content && user !== l.sender && clock() < l.arrives)
      fail(423, "letter_in_flight");
    return l;
  }
  async function cleanPhoto(data) {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) fail(400, "invalid_photo");
    const raw = Buffer.from(data, "base64");
    if (raw.length > 8 * 1024 * 1024) fail(413, "photo_too_large");
    try {
      return await sharp(raw, { limitInputPixels: 25000000, animated: false })
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch {
      fail(400, "invalid_photo");
    }
  }
  const app = express();
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 2) throw new Error("Invalid trusted proxy hop count");
  if (trustProxyHops) app.set("trust proxy", trustProxyHops);
  app.disable("x-powered-by");
  app.use(helmet());
  // Local Expo web can serve as the second test client. Production never enables this.
  if (mode === "development" && devWebOrigins.length) {
    app.use((req, res, next) => {
      const origin = req.get("Origin");
      if (!origin || !devWebOrigins.includes(origin)) return next();
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
  }
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/ready", (_req, res) => {
    try {
      get("SELECT 1");
      res.json({ ok: true });
    } catch { res.status(503).json({ ok: false }); }
  });
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "12mb" }));
  installOperations({ app, db, token: operationsToken, clock });
  app.get("/health", (_, res) =>
    res.json({ ok: true, mode, serverTime: clock(), deliverySeconds, emailVerificationRequired: requireEmailVerification, emailAvailable: !!sendEmail }),
  );
  const authLimiter = rateLimit({
    windowMs: 15 * 60000,
    limit: mode === "test" ? 100 : 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const account = installAccount({ app, db, clock, authLimiter, sendEmail });
  app.post("/auth/register", authLimiter, async (req, res) => {
    const c = credentials.parse(req.body);
    if (req.body.adult !== true) fail(400, "adults_only");
    const p = profileSchema.parse(req.body.profile);
    const salt = randomBytes(16).toString("hex");
    const derived = await derive(c.password, salt, 64);
    const id = randomUUID();
    try {
      run(
        "INSERT INTO users(id,email,password,profile,created) VALUES(?,?,?,?,?)",
        id,
        c.email,
        `${salt}:${derived.toString("hex")}`,
        JSON.stringify(p),
        clock(),
      );
    } catch (e) {
      if (e.code?.includes("SQLITE")) fail(409, "account_unavailable");
      throw e;
    }
    res
      .status(201)
      .json({ token: createSession(id), profile: publicProfile(id) });
  });
  app.post("/auth/login", authLimiter, async (req, res) => {
    const c = credentials.parse(req.body),
      u = get("SELECT * FROM users WHERE email=?", c.email);
    const [salt, expected] = (
      u?.password || `${"0".repeat(32)}:${"0".repeat(128)}`
    ).split(":");
    const actual = await derive(c.password, salt, 64);
    if (!u || !timingSafeEqual(actual, Buffer.from(expected, "hex")) ||
        get("SELECT password FROM users WHERE id=?", u.id)?.password !== u.password)
      fail(401, "invalid_credentials");
    if (get("SELECT 1 FROM suspensions WHERE user=?", u.id)) fail(403, "account_suspended");
    res.json({ token: createSession(u.id), profile: publicProfile(u.id) });
  });
  app.use((req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    const s =
      token &&
      get(
        "SELECT * FROM sessions WHERE token=? AND expires>?",
        hash(token),
        clock(),
      );
    if (!s) return res.status(401).json({ error: "unauthorized" });
    if (get("SELECT 1 FROM suspensions WHERE user=?", s.user)) return res.status(403).json({ error: "account_suspended" });
    req.user = s.user;
    req.session = hash(token);
    next();
  });
  account.privateRoutes();
  app.use((req, res, next) => {
    if (requireEmailVerification && req.method === "POST" &&
        (req.path === "/requests" || req.path === "/letters" || /^\/requests\/[^/]+\/respond$/.test(req.path)) &&
        !account.verified(req.user)) return res.status(403).json({ error: "email_verification_required" });
    next();
  });
  app.post("/auth/logout", (req, res) => {
    run("DELETE FROM sessions WHERE token=?", req.session);
    res.json({ ok: true });
  });
  app.get("/me", (req, res) =>
    res.json({
      profile: publicProfile(req.user),
      notify: !!get("SELECT notify FROM users WHERE id=?", req.user).notify,
    }),
  );
  app.put("/me", (req, res) => {
    run(
      "UPDATE users SET profile=? WHERE id=?",
      JSON.stringify(profileSchema.parse(req.body)),
      req.user,
    );
    res.json(publicProfile(req.user));
  });
  app.put("/me/notifications", (req, res) => {
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
    run("UPDATE users SET notify=? WHERE id=?", +enabled, req.user);
    res.json({ ok: true });
  });
  app.put("/me/avatar", async (req, res) => {
    const { data } = photoSchema.parse(req.body);
    const bytes = await cleanPhoto(data);
    run(
      "INSERT INTO avatars VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET bytes=excluded.bytes",
      req.user,
      bytes,
    );
    res.json({ ok: true });
  });
  app.get("/profiles/:id/avatar", (req, res) => {
    if (blocked(req.user, req.params.id)) fail(404, "not_found");
    const p = get("SELECT bytes FROM avatars WHERE owner=?", req.params.id);
    if (!p) fail(404, "not_found");
    res.type("jpeg").send(Buffer.from(p.bytes));
  });
  app.delete("/me", async (req, res) => {
    const { password } = z
        .object({ password: z.string().max(128) })
        .parse(req.body),
      u = get("SELECT password FROM users WHERE id=?", req.user);
    const [salt, h] = u.password.split(":");
    if (
      !timingSafeEqual(await derive(password, salt, 64), Buffer.from(h, "hex"))
    )
      fail(401, "invalid_credentials");
    tx(() => {
      run(
        "DELETE FROM deliveries WHERE token IN (SELECT token FROM devices WHERE user=?)",
        req.user,
      );
      run("DELETE FROM users WHERE id=?", req.user);
    });
    res.json({ ok: true });
  });
  app.get("/profiles", (req, res) => {
    const country = String(req.query.country || "");
    const language = String(req.query.language || "");
    const interest = String(req.query.interest || "").trim().toLowerCase().slice(0, 24);
    const purpose = String(req.query.purpose || "");
    if (purpose && !PURPOSES.includes(purpose)) fail(400, "invalid_input");
    const linked = new Set(
      all(
        "SELECT sender, recipient FROM requests WHERE status IN ('pending','accepted') AND (sender=? OR recipient=?)",
        req.user,
        req.user,
      ).flatMap((r) => [r.sender, r.recipient]),
    );
    linked.delete(req.user);
    const matches = [];
    for (const u of all(
      "SELECT id FROM users WHERE id<>? ORDER BY created DESC",
      req.user,
    )) {
      if (blocked(req.user, u.id) || linked.has(u.id)) continue;
      const p = publicProfile(u.id);
      if (country && cities[p.city]?.country !== country) continue;
      if (language && !p.languages.includes(language)) continue;
      if (purpose && (p.purpose || "letters") !== purpose) continue;
      if (
        interest &&
        !p.interests.some((s) => s.toLowerCase().includes(interest))
      )
        continue;
      matches.push(p);
      if (matches.length === PROFILE_PAGE) break;
    }
    res.json(matches);
  });
  app.get("/profiles/:id", (req, res) => {
    if (blocked(req.user, req.params.id)) fail(404, "not_found");
    res.json(publicProfile(req.params.id));
  });
  app.get("/requests", (req, res) =>
    res.json(
      all(
        "SELECT * FROM requests WHERE sender=? OR recipient=? ORDER BY created DESC",
        req.user,
        req.user,
      )
        .filter((r) => !blocked(r.sender, r.recipient))
        .map((r) => ({
          ...r,
          sender: publicProfile(r.sender),
          recipient: publicProfile(r.recipient),
        })),
    ),
  );
  app.post("/requests", (req, res) => {
    const { recipient } = z.object({ recipient: z.uuid() }).parse(req.body);
    publicProfile(recipient);
    if (recipient === req.user || blocked(req.user, recipient))
      fail(400, "cannot_connect");
    const id = tx(() => {
      if (
        get(
          "SELECT count(*) n FROM requests WHERE sender=? AND created>?",
          req.user,
          clock() - DAY,
        ).n >= DAILY_REQUESTS
      )
        fail(429, "daily_request_limit");
      if (
        get(
          "SELECT 1 FROM requests WHERE status IN ('pending','accepted') AND ((sender=? AND recipient=?) OR (sender=? AND recipient=?))",
          req.user,
          recipient,
          recipient,
          req.user,
        )
      )
        fail(409, "request_exists");
      const id = randomUUID();
      run(
        "INSERT INTO requests VALUES(?,?,?,?,?)",
        id,
        req.user,
        recipient,
        "pending",
        clock(),
      );
      event(recipient, "request", id);
      return id;
    });
    res.status(201).json({ id });
  });
  app.delete("/requests/:id", (req, res) => {
    const changed = run("UPDATE requests SET status='cancelled' WHERE id=? AND sender=? AND status='pending'", req.params.id, req.user);
    if (!changed.changes) fail(404, "not_found");
    res.json({ ok: true });
  });
  app.post("/requests/:id/respond", (req, res) => {
    const { accept } = z.object({ accept: z.boolean() }).parse(req.body);
    tx(() => {
      const r = get(
        "SELECT * FROM requests WHERE id=? AND recipient=? AND status='pending'",
        req.params.id,
        req.user,
      );
      if (!r || blocked(r.sender, r.recipient)) fail(404, "not_found");
      if (accept)
        for (const id of [r.sender, r.recipient])
          if (
            get(
              "SELECT count(*) n FROM requests WHERE status='accepted' AND (sender=? OR recipient=?)",
              id,
              id,
            ).n >= ACTIVE_PALS
          )
            fail(409, "penpal_limit");
      run(
        "UPDATE requests SET status=? WHERE id=?",
        accept ? "accepted" : "declined",
        r.id,
      );
      if (accept) event(r.sender, "accepted", r.id);
    });
    res.json({ ok: true });
  });
  app.get("/blocks", (req, res) =>
    res.json(
      all("SELECT target FROM blocks WHERE owner=?", req.user).map((r) =>
        publicProfile(r.target),
      ),
    ),
  );
  app.post("/blocks", (req, res) => {
    const { target } = z.object({ target: z.uuid() }).parse(req.body);
    if (target === req.user) fail(400, "invalid_target");
    publicProfile(target);
    tx(() => {
      run("INSERT OR IGNORE INTO blocks VALUES(?,?)", req.user, target);
      run(
        "UPDATE requests SET status='blocked' WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?)",
        req.user,
        target,
        target,
        req.user,
      );
      run(
        "UPDATE letters SET cancelled=1 WHERE arrives>? AND ((sender=? AND recipient=?) OR (sender=? AND recipient=?))",
        clock(),
        req.user,
        target,
        target,
        req.user,
      );
    });
    res.json({ ok: true });
  });
  app.delete("/blocks/:id", (req, res) => {
    run(
      "DELETE FROM blocks WHERE owner=? AND target=?",
      req.user,
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.post("/reports", (req, res) => {
    const p = z
      .object({ target: z.uuid(), reason: z.string().trim().min(5).max(1000) })
      .parse(req.body);
    publicProfile(p.target);
    if (
      get(
        "SELECT count(*) n FROM reports WHERE reporter=? AND created>?",
        req.user,
        clock() - DAY,
      ).n >= 10
    )
      fail(429, "report_limit");
    run(
      "INSERT INTO reports(id,reporter,target,reason,created) VALUES(?,?,?,?,?)",
      randomUUID(),
      req.user,
      p.target,
      p.reason,
      clock(),
    );
    res.status(201).json({ ok: true });
  });
  app.post("/photos", async (req, res) => {
    const { data, key } = photoSchema.extend({ key: z.uuid().optional() }).parse(req.body);
    const digest = hash(data);
    const bytes = await cleanPhoto(data);
    const id = tx(() => {
      const prior = key && get("SELECT * FROM photo_uploads WHERE owner=? AND key=?", req.user, key);
      if (prior) {
        if (prior.digest !== digest) fail(409, "idempotency_conflict");
        return prior.photo;
      }
      if (
        get(
          "SELECT count(*) n FROM photos WHERE owner=? AND letter IS NULL",
          req.user,
        ).n >= 30
      )
        fail(429, "photo_limit");
      const id = randomUUID();
      run(
        "INSERT INTO photos VALUES(?,?,?,?,?)",
        id,
        req.user,
        null,
        bytes,
        clock(),
      );
      if (key) run("INSERT INTO photo_uploads VALUES(?,?,?,?)", req.user, key, digest, id);
      return id;
    });
    res.status(201).json({ id });
  });
  app.delete("/photos/:id", (req, res) => {
    run(
      "DELETE FROM photos WHERE id=? AND owner=? AND letter IS NULL",
      req.params.id,
      req.user,
    );
    res.json({ ok: true });
  });
  app.get("/photos/:id", (req, res) => {
    const p = get("SELECT * FROM photos WHERE id=?", req.params.id);
    if (!p) fail(404, "not_found");
    if (p.letter) visibleLetter(p.letter, req.user, true);
    else if (p.owner !== req.user) fail(404, "not_found");
    res.type("jpeg").send(Buffer.from(p.bytes));
  });
  app.get("/drafts", (req, res) =>
    res.json(
      all(
        "SELECT recipient,data,updated FROM drafts WHERE owner=? ORDER BY updated DESC",
        req.user,
      )
        .filter((d) => !blocked(req.user, d.recipient))
        .map((d) => ({
          ...JSON.parse(d.data),
          recipient: d.recipient,
          updated: d.updated,
        })),
    ),
  );
  app.put("/drafts/:id", (req, res) => {
    if (!connected(req.user, req.params.id) || blocked(req.user, req.params.id))
      fail(403, "not_connected");
    const p = letterSchema
      .omit({ recipient: true })
      .extend({ body: z.string().max(10000) })
      .parse(req.body);
    for (const id of p.photos)
      if (
        !get(
          "SELECT 1 FROM photos WHERE id=? AND owner=? AND letter IS NULL",
          id,
          req.user,
        )
      )
        fail(400, "invalid_photo");
    tx(() => {
      for (const id of p.photos)
        run("UPDATE photos SET created=? WHERE id=?", clock(), id);
      run(
        "INSERT INTO drafts VALUES(?,?,?,?) ON CONFLICT(owner,recipient) DO UPDATE SET data=excluded.data,updated=excluded.updated",
        req.user,
        req.params.id,
        JSON.stringify(p),
        clock(),
      );
    });
    res.json({ ok: true });
  });
  app.delete("/drafts/:id", (req, res) => {
    run(
      "DELETE FROM drafts WHERE owner=? AND recipient=?",
      req.user,
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.post("/letters", (req, res) => {
    const p = letterSchema.parse(req.body),
      digest = hash(JSON.stringify(p));
    const l = tx(() => {
      const old = get(
        "SELECT * FROM letters WHERE sender=? AND idem=?",
        req.user,
        p.key,
      );
      if (old) {
        if (old.digest !== digest) fail(409, "idempotency_conflict");
        return old;
      }
      if (!connected(req.user, p.recipient) || blocked(req.user, p.recipient))
        fail(403, "not_connected");
      if (
        get(
          "SELECT 1 FROM letters WHERE sender=? AND recipient=? AND cancelled=0 AND arrives>?",
          req.user,
          p.recipient,
          clock(),
        )
      )
        fail(409, "letter_already_traveling");
      if (
        get(
          "SELECT count(*) n FROM letters WHERE sender=? AND sent>?",
          req.user,
          clock() - DAY,
        ).n >= DAILY_LETTERS
      )
        fail(429, "daily_letter_limit");
      if (new Set(p.photos).size !== p.photos.length)
        fail(400, "invalid_photo");
      for (const id of p.photos)
        if (
          !get(
            "SELECT 1 FROM photos WHERE id=? AND owner=? AND letter IS NULL",
            id,
            req.user,
          )
        )
          fail(400, "invalid_photo");
      const id = randomUUID(),
        sent = clock();
      run(
        "INSERT INTO letters(id,sender,recipient,body,paper,stamp,sent,arrives,origin,destination,idem,digest) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        id,
        req.user,
        p.recipient,
        p.body,
        p.paper,
        p.stamp,
        sent,
        sent + deliverySeconds * 1000,
        JSON.stringify(cities[publicProfile(req.user).city]),
        JSON.stringify(cities[publicProfile(p.recipient).city]),
        p.key,
        digest,
      );
      for (const photo of p.photos)
        run("UPDATE photos SET letter=? WHERE id=?", id, photo);
      run(
        "DELETE FROM drafts WHERE owner=? AND recipient=?",
        req.user,
        p.recipient,
      );
      return get("SELECT * FROM letters WHERE id=?", id);
    });
    res.status(201).json(envelope(l));
  });
  app.get("/letters", (req, res) =>
    res.json({
      serverTime: clock(),
      letters: all(
        "SELECT * FROM letters WHERE (sender=? OR recipient=?) AND cancelled=0 ORDER BY sent DESC LIMIT 300",
        req.user,
        req.user,
      )
        .filter((l) => !blocked(l.sender, l.recipient))
        .map(envelope),
    }),
  );
  app.get("/letters/:id", (req, res) => {
    const l = visibleLetter(req.params.id, req.user, true);
    res.json({
      ...envelope(l),
      body: l.body,
      paper: l.paper,
      stamp: l.stamp,
      photos: all("SELECT id FROM photos WHERE letter=?", l.id).map(
        (p) => p.id,
      ),
    });
  });
  app.put("/devices", (req, res) => {
    const { token } = z
      .object({
        token: z
          .string()
          .regex(/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/)
          .max(200),
      })
      .parse(req.body);
    run(
      "INSERT INTO devices VALUES(?,?) ON CONFLICT(token) DO UPDATE SET user=excluded.user",
      token,
      req.user,
    );
    res.json({ ok: true });
  });
  app.delete("/devices", (req, res) => {
    const { token } = z.object({ token: z.string().min(1).max(200) }).parse(req.body);
    run("DELETE FROM devices WHERE user=? AND token=?", req.user, token);
    res.json({ ok: true });
  });
  app.use((err, req, res, next) => {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: "invalid_input" });
    res
      .status(err.status || 500)
      .json({ error: err.status ? err.message : "internal_error" });
  });

  async function tick() {
    await account.tick();
    for (const l of all(
      "SELECT id,recipient,sender FROM letters WHERE arrives<=? AND cancelled=0",
      clock(),
    ))
      if (!blocked(l.sender, l.recipient)) event(l.recipient, "arrived", l.id);
    run("DELETE FROM sessions WHERE expires<=?", clock());
    // Expire abandoned unattached photos after 30 days; drafts older than that are explicitly stale.
    run("DELETE FROM drafts WHERE updated<?", clock() - 30 * DAY);
    run(
      "DELETE FROM photos WHERE letter IS NULL AND created<?",
      clock() - 30 * DAY,
    );
    if (!pushEnabled) return;
    for (const e of all(
      "SELECT e.* FROM events e JOIN users u ON u.id=e.user WHERE u.notify=1 AND e.created>?",
      clock() - DAY,
    )) {
      if (e.kind === "arrived") {
        const l = get("SELECT * FROM letters WHERE id=?", e.ref);
        if (!l || l.cancelled || blocked(l.sender, l.recipient)) continue;
      }
      if (e.kind === "request" || e.kind === "accepted") {
        const r = get("SELECT * FROM requests WHERE id=?", e.ref);
        if (!r || blocked(r.sender, r.recipient) ||
            (e.kind === "request" ? r.status !== "pending" : r.status !== "accepted"))
          continue;
      }
      for (const d of all("SELECT token FROM devices WHERE user=?", e.user)) {
        // Claim before network I/O. Ambiguous network failures are not automatically retried:
        // this favors no duplicate notifications; inbox remains authoritative.
        if (
          !run(
            "INSERT OR IGNORE INTO deliveries VALUES(?,?,'claimed',NULL,?)",
            e.id,
            d.token,
            clock(),
          ).changes
        )
          continue;
        try {
          const response = await pushFetch(
            "https://exp.host/--/api/v2/push/send",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(process.env.EXPO_ACCESS_TOKEN
                  ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
                  : {}),
              },
              body: JSON.stringify({
                to: d.token,
                title: "DearBird by Luvbird",
                body:
                  e.kind === "arrived"
                    ? "Your letter has arrived."
                    : e.kind === "request"
                      ? "A new pen pal would like to connect."
                      : "Your pen pal accepted. Send your first letter.",
                data: { eventId: e.id, kind: e.kind, ref: e.ref },
                sound: "default",
              }),
              signal: AbortSignal.timeout(10000),
            },
          );
          const result = await response.json();
          const ticket = result.data;
          run(
            "UPDATE deliveries SET status=?,ticket=?,updated=? WHERE event=? AND token=?",
            ticket?.status === "ok" ? "ticket" : "failed",
            ticket?.id || null,
            clock(),
            e.id,
            d.token,
          );
          if (ticket?.details?.error === "DeviceNotRegistered")
            run("DELETE FROM devices WHERE token=?", d.token);
        } catch {
          run(
            "UPDATE deliveries SET status='uncertain' WHERE event=? AND token=?",
            e.id,
            d.token,
          );
        }
      }
    }
    for (const d of all(
      "SELECT * FROM deliveries WHERE status='ticket' AND updated<? LIMIT 100",
      clock() - 15 * 60000,
    )) {
      try {
        const response = await pushFetch(
          "https://exp.host/--/api/v2/push/getReceipts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [d.ticket] }),
            signal: AbortSignal.timeout(10000),
          },
        );
        const receipt = (await response.json()).data?.[d.ticket];
        if (receipt) {
          run(
            "UPDATE deliveries SET status=? WHERE event=? AND token=?",
            receipt.status === "ok" ? "delivered" : "failed",
            d.event,
            d.token,
          );
          if (receipt.details?.error === "DeviceNotRegistered")
            run("DELETE FROM devices WHERE token=?", d.token);
        }
      } catch {
        /* next scheduled tick retries receipt lookup only */
      }
    }
  }
  return { app, db, tick };
}
