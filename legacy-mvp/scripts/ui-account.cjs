const { chromium } = require('../server/node_modules/playwright-core');
const chromiumBinary = require(require.resolve('@sparticuz/chromium', { paths: [require('path').resolve('server')] })).default;
const express = require('../server/node_modules/express');
const path = require('path'), fs = require('fs'), assert = require('assert/strict');
(async () => {
  const { createApp } = await import('../server/app.mjs');
  const mail = [];
  const ctx = createApp({ filename: ':memory:', mode: 'test', sendEmail: async message => mail.push(message) });
  const app = express(); app.use(express.static(path.resolve('mobile/dist')));
  app.get('/app/{*path}', (_, res) => res.sendFile(path.resolve('mobile/dist/index.html'))); app.use(ctx.app);
  const server = await new Promise(resolve => { const s = app.listen(4000, '127.0.0.1', () => resolve(s)); });
  let browser, page;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || await chromiumBinary.executablePath(), args: chromiumBinary.args });
    page = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errors = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('dialog', dialog => dialog.accept()); page.setDefaultTimeout(12000);
    await fetch('http://localhost:4000/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'account-ui@example.com', password: 'original-password-123', adult: true, profile: { nickname: 'Tester', city: 'seoul', bio: '', lookingFor: '', interests: [], languages: ['ko'], avatar: 'dove' } }) });
    await page.addInitScript(() => localStorage.setItem('dearbird-onboarding-v1','done'));
    await page.goto('http://localhost:4000');
    await page.getByRole('textbox', { name: '이메일', exact: true }).fill('account-ui@example.com');
    await page.getByRole('button', { name: '비밀번호를 잊으셨나요?', exact: true }).click();
    const resetResponse = page.waitForResponse(r => r.url().endsWith('/auth/password/request') && r.status() === 202);
    await page.getByRole('button', { name: '코드 이메일 요청', exact: true }).click(); await resetResponse;
    await ctx.tick(); assert.equal(mail.length, 1);
    await page.getByRole('textbox', { name: '이메일로 받은 코드', exact: true }).fill(mail[0].token);
    await page.getByRole('textbox', { name: '새 비밀번호 (12자 이상)', exact: true }).fill('replacement-password-123');
    await page.getByRole('textbox', { name: '새 비밀번호 확인', exact: true }).fill('replacement-password-123');
    // Use bundled fonts to make the Korean screenshot readable in Linux Chromium.
    const fontDir = path.resolve('server/node_modules/@fontsource/noto-sans-kr');
    const css = fs.readFileSync(path.join(fontDir, '400.css'), 'utf8').replace(/url\(([^)]+)\)/g, (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, f.replace(/["']/g, ''))).toString('base64')})`);
    await page.addStyleTag({ content: css + '\n* { font-family: "Noto Sans KR", sans-serif !important; }' }); await page.evaluate(() => document.fonts.ready);
    // Do not capture actual temporary codes/passwords in deliverable images.
    await page.getByRole('textbox', { name: '이메일로 받은 코드', exact: true }).fill('');
    await page.screenshot({ path: 'docs/screenshots/09-account-recovery.png' });
    await page.getByRole('textbox', { name: '이메일로 받은 코드', exact: true }).fill(mail[0].token);
    await page.getByRole('button', { name: '비밀번호 재설정', exact: true }).click();
    await page.getByRole('textbox', { name: '이메일로 받은 코드', exact: true }).waitFor({ state: 'hidden' });
    await page.getByRole('textbox', { name: '비밀번호 (12자 이상)', exact: true }).fill('replacement-password-123');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.getByRole('tab', { name: '◉ 내 프로필' }).click();
    await page.getByRole('button', { name: '이메일 인증', exact: true }).click();
    const response = page.waitForResponse(r => r.url().endsWith('/auth/email/request') && r.status() === 202);
    await page.getByRole('button', { name: '코드 이메일 요청', exact: true }).click(); await response;
    await ctx.tick(); assert.equal(mail.length, 2);
    await page.getByRole('textbox', { name: '이메일로 받은 코드', exact: true }).fill(mail[1].token);
    await page.getByRole('dialog').getByRole('button', { name: '이메일 인증', exact: true }).click();
    await page.getByText('이메일 인증 완료', { exact: true }).waitFor(); assert.deepEqual(errors, []);
    fs.writeFileSync('docs/account-ui-verification.json', JSON.stringify({ passed: true, viewport: '390x844', physicalDevice: false, realEmailDelivery: false, checks: ['request reset', 'paste code', 'set password', 'login with new password', 'request verification', 'verify email'], consoleErrors: errors }, null, 2));
    console.log('ACCOUNT_UI_PASS');
  } catch (error) { if (page) { console.log('ACCOUNT_UI_BODY', await page.locator('body').innerText()); await page.screenshot({ path: 'docs/screenshots/account-ui-error.png' }); } throw error; } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); ctx.db.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
