import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { createApp } from "../app.mjs";

const profile = (name, city = "seoul") => ({
  nickname: name,
  city,
  bio: "A little piece of my week.",
  lookingFor: "A thoughtful pen pal.",
  interests: ["photography"],
  languages: ["ko", "en"],
  avatar: "dove",
});
async function fixture(options = {}) {
  let now = Date.parse("2026-09-24T00:00:00Z");
  const ctx = createApp({
      filename: ":memory:",
      mode: "test",
      clock: () => now,
      ...options,
    }),
    api = request(ctx.app);
  const users = [];
  for (const [i, name] of ["Sunje", "Emma", "Stranger"].entries()) {
    const r = await api
      .post("/auth/register")
      .send({
        email: `person${i}@example.com`,
        password: "test-only-secret-123",
        adult: true,
        profile: profile(name, i === 1 ? "seattle" : "seoul"),
      });
    assert.equal(r.status, 201);
    users.push(r.body);
  }
  const as = (u, method, path) =>
    api[method](path).set("Authorization", `Bearer ${u.token}`);
  const [a, b, c] = users;
  const r = await as(a, "post", "/requests").send({ recipient: b.profile.id });
  assert.equal(r.status, 201);
  assert.equal(
    (
      await as(b, "post", `/requests/${r.body.id}/respond`).send({
        accept: true,
      })
    ).status,
    200,
  );
  return { ...ctx, api, as, a, b, c, advance: (ms) => (now += ms) };
}
async function photo(f, u = f.a) {
  const raw = await sharp({
    create: { width: 24, height: 24, channels: 3, background: "#A3BBC7" },
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { Artist: "private author" } } })
    .toBuffer();
  const r = await f
    .as(u, "post", "/photos")
    .send({ data: raw.toString("base64") });
  assert.equal(r.status, 201);
  return r.body.id;
}
const payload = (f, photos = []) => ({
  recipient: f.b.profile.id,
  body: "This is a private photo letter.",
  photos,
  paper: "ivory",
  stamp: "bird",
  key: randomUUID(),
});

test("real accounts: connect, upload, locked envelope and photo, arrival, reply, immutable send", async () => {
  const f = await fixture(),
    p = await photo(f),
    data = payload(f, [p]);
  const sent = await f.as(f.a, "post", "/letters").send(data);
  assert.equal(sent.status, 201);
  const id = sent.body.id;
  assert.equal(sent.body.arrives - sent.body.sent, 24 * 60 * 60 * 1000);
  const list = (await f.as(f.b, "get", "/letters")).body;
  assert.equal(list.letters.length, 1);
  assert.equal(JSON.stringify(list).includes(data.body), false);
  assert.equal(JSON.stringify(list).includes(p), false);
  assert.equal((await f.as(f.b, "get", `/letters/${id}`)).status, 423);
  assert.equal((await f.as(f.b, "get", `/photos/${p}`)).status, 423);
  assert.equal((await f.as(f.c, "get", `/letters/${id}`)).status, 404);
  assert.equal((await f.as(f.c, "get", `/photos/${p}`)).status, 404);
  const senderPhoto = await f.as(f.a, "get", `/photos/${p}`);
  assert.equal(senderPhoto.status, 200);
  assert.equal((await sharp(senderPhoto.body).metadata()).exif, undefined);
  const duplicate = await f.as(f.a, "post", "/letters").send(data);
  assert.equal(duplicate.body.id, id);
  assert.equal(
    (await f.as(f.a, "post", "/letters").send({ ...data, body: "changed" }))
      .status,
    409,
  );
  assert.equal(
    (await f.as(f.a, "put", `/letters/${id}`).send({ body: "changed" })).status,
    404,
  );
  f.advance(86400000 - 1);
  assert.equal((await f.as(f.b, "get", `/letters/${id}`)).status, 423);
  f.advance(1);
  const received = await f.as(f.b, "get", `/letters/${id}`);
  assert.equal(received.status, 200);
  assert.equal(received.body.body, data.body);
  assert.equal((await f.as(f.b, "get", `/photos/${p}`)).status, 200);
  const reply = await f
    .as(f.b, "post", "/letters")
    .send({
      ...payload(f),
      recipient: f.a.profile.id,
      body: "Thank you for the photo.",
    });
  assert.equal(reply.status, 201);
  await f.tick();
  await f.tick();
  assert.equal(
    f.db.prepare("SELECT count(*) n FROM events WHERE kind='arrived'").get().n,
    1,
  );
  f.db.close();
});
test("draft ownership, photo ownership, profile privacy, logout", async () => {
  const f = await fixture(),
    p = await photo(f),
    data = payload(f, [p]);
  delete data.recipient;
  assert.equal(
    (await f.as(f.a, "put", `/drafts/${f.b.profile.id}`).send(data)).status,
    200,
  );
  assert.equal((await f.as(f.a, "get", "/drafts")).body[0].body, data.body);
  assert.equal((await f.as(f.b, "get", "/drafts")).body.length, 0);
  assert.equal(
    (
      await f
        .as(f.b, "post", "/letters")
        .send({ ...payload(f, [p]), recipient: f.a.profile.id })
    ).status,
    400,
  );
  const profiles = (await f.as(f.c, "get", "/profiles")).body;
  assert.equal(profiles.length, 2);
  assert.equal("email" in profiles[0], false);
  assert.equal("password" in profiles[0], false);
  assert.equal((await f.as(f.a, "post", "/auth/logout")).status, 200);
  assert.equal((await f.as(f.a, "get", "/me")).status, 401);
  f.db.close();
});
test("block cancels pending delivery, rejects new letters, and unblock does not resurrect it", async () => {
  const f = await fixture(),
    p = await photo(f);
  const sent = await f.as(f.a, "post", "/letters").send(payload(f, [p]));
  assert.equal(
    (await f.as(f.b, "post", "/blocks").send({ target: f.a.profile.id }))
      .status,
    200,
  );
  assert.equal(
    (await f.as(f.a, "post", "/letters").send(payload(f))).status,
    403,
  );
  f.advance(86400000);
  await f.tick();
  assert.equal((await f.as(f.b, "get", "/letters")).body.letters.length, 0);
  await f.as(f.b, "delete", `/blocks/${f.a.profile.id}`);
  assert.equal(
    (await f.as(f.b, "get", `/letters/${sent.body.id}`)).status,
    404,
  );
  assert.equal((await f.as(f.b, "get", `/photos/${p}`)).status, 404);
  f.db.close();
});
test("deletion requires password and removes shared letters, blobs, sessions, tokens", async () => {
  const f = await fixture(),
    p = await photo(f);
  await f.as(f.a, "post", "/letters").send(payload(f, [p]));
  assert.equal(
    (await f.as(f.a, "delete", "/me").send({ password: "wrong" })).status,
    401,
  );
  assert.equal(
    (
      await f
        .as(f.a, "delete", "/me")
        .send({ password: "test-only-secret-123" })
    ).status,
    200,
  );
  assert.equal((await f.as(f.a, "get", "/me")).status, 401);
  assert.equal((await f.as(f.b, "get", "/letters")).body.letters.length, 0);
  assert.equal(f.db.prepare("SELECT count(*) n FROM photos").get().n, 0);
  f.db.close();
});
test("production duration guard and server-only staging acceleration", async () => {
  assert.throws(
    () =>
      createApp({
        filename: ":memory:",
        mode: "production",
        deliverySeconds: 60,
      }),
    /24/,
  );
  const f = await fixture({ deliverySeconds: 1 });
  const r = await f
    .as(f.a, "post", "/letters")
    .send({ ...payload(f), arrives: 0, deliverySeconds: 0 });
  assert.equal(r.body.arrives - r.body.sent, 1000);
  f.advance(1000);
  assert.equal((await f.as(f.b, "get", `/letters/${r.body.id}`)).status, 200);
  f.db.close();
});
test("push deduplication and photo sanitation; no body in payload", async () => {
  const calls = [];
  const f = await fixture({
    pushEnabled: true,
    pushFetch: async (url, options) => {
      calls.push(JSON.parse(options.body));
      return {
        json: async () => ({ data: { status: "ok", id: randomUUID() } }),
      };
    },
  });
  await f
    .as(f.b, "put", "/devices")
    .send({ token: "ExpoPushToken[testToken]" });
  await f.as(f.b, "put", "/me/notifications").send({ enabled: true });
  await f.as(f.a, "post", "/letters").send(payload(f));
  f.advance(86400000);
  await f.tick();
  await f.tick();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].data.kind, "arrived");
  assert.equal(JSON.stringify(calls).includes("private photo"), false);
  f.db.close();
});
test("malformed image and excessive text rejected, adult gate enforced", async () => {
  const f = await fixture();
  assert.equal(
    (
      await f
        .as(f.a, "post", "/photos")
        .send({ data: Buffer.from("not a photo").toString("base64") })
    ).status,
    400,
  );
  assert.equal(
    (
      await f
        .as(f.a, "post", "/letters")
        .send({ ...payload(f), body: "x".repeat(10001) })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.api
        .post("/auth/register")
        .send({
          email: "minor@example.com",
          password: "test-only-secret-123",
          adult: false,
          profile: profile("Minor"),
        })
    ).status,
    400,
  );
  f.db.close();
});

test('photo upload retry is idempotent and profile intent persists', async () => {
  const f = await fixture();
  const data = (await sharp({create:{width:8,height:8,channels:3,background:'#123456'}}).jpeg().toBuffer()).toString('base64');
  const key = randomUUID();
  const first = await f.as(f.a, 'post', '/photos').send({data,key});
  const retry = await f.as(f.a, 'post', '/photos').send({data,key});
  assert.equal(first.status,201);
  assert.equal(retry.body.id,first.body.id);
  assert.equal(f.db.prepare('SELECT count(*) n FROM photos').get().n,1);
  const changed = (await sharp({create:{width:8,height:8,channels:3,background:'#ffffff'}}).jpeg().toBuffer()).toString('base64');
  assert.equal((await f.as(f.a,'post','/photos').send({data:changed,key})).status,409);
  const updated = await f.as(f.a,'put','/me').send({...profile('Sunje'),mbti:'ENFP',purpose:'travel',travelCity:'Paris'});
  assert.equal(updated.status,200);
  const me = await f.as(f.a,'get','/me');
  assert.equal(me.body.mbti || me.body.profile?.mbti,'ENFP');
  f.db.close();
});

test('device logout revokes only owned current token; avatar cache key changes', async () => {
 const f=await fixture();
 const t1='ExpoPushToken[one]',t2='ExpoPushToken[two]',t3='ExpoPushToken[three]';
 for(const [u,token] of [[f.a,t1],[f.a,t2],[f.b,t3]]) assert.equal((await f.as(u,'put','/devices').send({token})).status,200);
 assert.equal((await f.as(f.a,'delete','/devices').send({token:t1})).status,200);
 assert.equal(f.db.prepare('SELECT count(*) n FROM devices WHERE user=?').get(f.a.profile.id).n,1);
 await f.as(f.a,'delete','/devices').send({token:t3});
 assert.ok(f.db.prepare('SELECT token FROM devices WHERE token=?').get(t3));
 assert.equal((await f.as(f.a,'delete','/devices').send({})).status,400);
 let previous;
 for(const color of ['#123456','#abcdef']){
 const data=(await sharp({create:{width:10,height:10,channels:3,background:color}}).jpeg().toBuffer()).toString('base64');
 assert.equal((await f.as(f.a,'put','/me/avatar').send({data})).status,200);
 const me=(await f.as(f.a,'get','/me')).body;
 const version=me.profile?.avatarVersion || me.avatarVersion;
 assert.ok(version);assert.notEqual(version,previous);previous=version;
 }
 f.db.close();
});

test('only sender can withdraw pending request; cancellation preserves quota and suppresses stale push', async () => {
  const pushed = [];
  const f = await fixture({ pushEnabled: true, pushFetch: async (_url, options) => { pushed.push(JSON.parse(options.body)); return { json: async () => ({ data: { status: 'ok', id: 'test-ticket' } }) }; } });
  try {
    await f.as(f.c, 'put', '/devices').send({ token: 'ExpoPushToken[cancelled]' });
    await f.as(f.c, 'put', '/me/notifications').send({ enabled: true });
    const request = await f.as(f.a, 'post', '/requests').send({ recipient: f.c.profile.id });
    assert.equal(request.status, 201);
    assert.equal((await f.as(f.c, 'delete', `/requests/${request.body.id}`)).status, 404);
    assert.equal((await f.as(f.b, 'delete', `/requests/${request.body.id}`)).status, 404);
    assert.equal((await f.as(f.a, 'delete', `/requests/${request.body.id}`)).status, 200);
    assert.equal((await f.as(f.c, 'post', `/requests/${request.body.id}/respond`).send({ accept: true })).status, 404);
    assert.equal(f.db.prepare('SELECT count(*) n FROM requests WHERE sender=?').get(f.a.profile.id).n, 2);
    await f.tick(); assert.deepEqual(pushed, []);
    for (let i = 0; i < 3; i++) {
      const r = await f.as(f.a, 'post', '/requests').send({ recipient: f.c.profile.id });
      assert.equal(r.status, 201); await f.as(f.a, 'delete', `/requests/${r.body.id}`);
    }
    assert.equal((await f.as(f.a, 'post', '/requests').send({ recipient: f.c.profile.id })).status, 429);
    const accepted = f.db.prepare("SELECT id FROM requests WHERE status='accepted'").get().id;
    assert.equal((await f.as(f.a, 'delete', `/requests/${accepted}`)).status, 404);
  } finally { f.db.close(); }
});
