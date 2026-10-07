import origin from '../mobile/release-origin.cjs';
// Read-only deployment probe; accepts no credentials and creates no users.
const base = process.argv[2];
try {
  const url = new URL(base);
  if (!origin.isReleaseOrigin(base)) throw new Error('Supply the deployed HTTPS API origin only');
  for (const route of ['/ready', '/health']) {
    const response = await fetch(new URL(route, url), { signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
    const body = await response.json();
    if (body.ok !== true) throw new Error(`${route}: not ready`);
    if (route === '/health' && (body.mode !== 'production' || body.deliverySeconds !== 86400 || !body.emailAvailable || !body.emailVerificationRequired)) throw new Error('Production settings are incomplete');
    console.log(`PASS ${route}`);
  }
  console.log('API configuration verified. This does not verify inbox delivery or physical devices.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
