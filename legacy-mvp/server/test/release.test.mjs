import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../app.mjs';
import { backupDatabase } from '../backup.mjs';
import { checkRelease } from '../../scripts/release-check.mjs';
import { spawnSync } from 'node:child_process';
import origin from '../../mobile/release-origin.cjs';

test('device builds reject unsafe API origins and accept a configured HTTPS origin', () => {
  const invalid = ['https://localhost', 'https://api.localhost', 'https://172.16.0.1', 'https://[::1]', 'https://api.example.com.', 'https://api.example.invalid', 'http://api.luvbird.com', 'https://user:password@api.luvbird.com', 'https://api.luvbird.com/path', 'https://api.luvbird.com?token=secret'];
  for (const value of invalid) {
    assert.equal(origin.isReleaseOrigin(value), false, value);
    assert.equal(checkRelease({ EXPO_PUBLIC_API_URL: value })[0].ok, false, value);
  }
  // This only validates syntax; it does not claim the example app domain is deployed.
  assert.equal(origin.isReleaseOrigin('https://api.luvbird.com'), true);
  const configPath = new URL('../../mobile/app.config.js', import.meta.url).pathname;
  const env = { ...process.env, APP_VARIANT: 'production', EXPO_PROJECT_ID: '12345678-1234-1234-1234-123456789abc' };
  const rejected = spawnSync(process.execPath, [configPath], { env: { ...env, EXPO_PUBLIC_API_URL: invalid[4] }, encoding: 'utf8' });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /deployed HTTPS API/);
  const accepted = spawnSync(process.execPath, [configPath], { env: { ...env, EXPO_PUBLIC_API_URL: 'https://api.luvbird.com' }, encoding: 'utf8' });
  assert.equal(accepted.status, 0, accepted.stderr);
});

test('backup preserves account and media, restores into the app, and never overwrites an existing backup', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'luvbird-backup-test-'));
  const source = join(dir, 'source.sqlite'), destination = join(dir, 'backup.sqlite');
  const first = createApp({ filename: source, mode: 'test' }); let restored;
  try {
    const result = await request(first.app).post('/auth/register').send({ email: 'backup@example.com', password: 'backup-test-password', adult: true, profile: { nickname: 'Backup', city: 'seoul', bio: 'Restore my story', lookingFor: '', interests: [], languages: ['ko'], avatar: 'dove' } });
    assert.equal(result.status, 201);
    first.db.prepare('INSERT INTO avatars VALUES(?,?)').run(result.body.profile.id, Buffer.from('test-media-bytes'));
    await backupDatabase(source, destination);
    const bytes = await readFile(destination);
    await assert.rejects(() => backupDatabase(source, destination), /EEXIST/);
    assert.deepEqual(await readFile(destination), bytes);
    await assert.rejects(() => backupDatabase(source, source), /different path/);
    restored = createApp({ filename: destination, mode: 'test' });
    const login = await request(restored.app).post('/auth/login').send({ email: 'backup@example.com', password: 'backup-test-password' });
    assert.equal(login.status, 200); assert.equal(login.body.profile.bio, 'Restore my story');
    assert.equal(Buffer.from(restored.db.prepare('SELECT bytes FROM avatars').get().bytes).toString(), 'test-media-bytes');
  } finally { first.db.close(); restored?.db.close(); await rm(dir, { recursive: true }); }
});

test('trusted proxy rate limits separate clients while readiness survives user traffic limits', async () => {
  const ctx = createApp({ filename: ':memory:', mode: 'test', trustProxyHops: 1 });
  try {
    const api = request(ctx.app);
    for (let i=0; i<180; i++) assert.equal((await api.get('/health').set('X-Forwarded-For', '198.51.100.10')).status, 200);
    assert.equal((await api.get('/health').set('X-Forwarded-For', '198.51.100.10')).status, 429);
    assert.equal((await api.get('/health').set('X-Forwarded-For', '198.51.100.11')).status, 200);
    assert.equal((await api.get('/ready').set('X-Forwarded-For', '198.51.100.10')).status, 200);
  } finally { ctx.db.close(); }
});

test('release checks reject absent and placeholder configuration without exposing secrets', () => {
  assert.ok(checkRelease({}).every(c => !c.ok));
  const env = { EXPO_PUBLIC_API_URL: 'https://api.example.invalid', EXPO_PROJECT_ID: 'not-a-project', RESEND_API_KEY: 'secret-test-value', EMAIL_FROM: 'Test <send@example.com>', SUPPORT_EMAIL: 'support@example.com' };
  const checks = checkRelease(env);
  assert.equal(checks[0].ok, false); assert.equal(checks[1].ok, false);
  assert.equal(JSON.stringify(checks).includes(env.RESEND_API_KEY), false);
});
