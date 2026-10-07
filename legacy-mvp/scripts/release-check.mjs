// Read-only checks. Never prints credentials or sends email.
import { pathToFileURL } from 'node:url';
import origin from '../mobile/release-origin.cjs';
export function checkRelease(env = process.env) {
  const checks = [];
  const add = (name, ok, hint) => checks.push({ name, ok: !!ok, ...(ok ? {} : { hint }) });
  add('Public HTTPS API URL', origin.isReleaseOrigin(env.EXPO_PUBLIC_API_URL), 'Set EXPO_PUBLIC_API_URL to the real deployed API origin.');
  add('Expo project', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.EXPO_PROJECT_ID || ''), 'Link the app to its actual Expo/EAS project.');
  add('Transactional email key', !!env.RESEND_API_KEY?.trim(), 'Configure RESEND_API_KEY on the server; never in the mobile build.');
  add('Sender address configured (domain verification is separate)', /[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/.test(env.EMAIL_FROM || '') && !/example\./.test(env.EMAIL_FROM), 'Use an address on your verified sending domain.');
  add('Operating contact', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SUPPORT_EMAIL || '') && !/example\./.test(env.SUPPORT_EMAIL), 'Confirm the public support address and responsible operator.');
  return checks;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const checks = checkRelease();
  for (const c of checks) console.log(`${c.ok ? 'PASS' : 'MISSING'}: ${c.name}${c.hint ? ' — '+c.hint : ''}`);
  console.log('Separate gates: live email delivery, billing choice, Apple signing/TestFlight, device push, backup restore, privacy/support review.');
  process.exitCode = checks.every(c => c.ok) ? 0 : 1;
}
