import { chromium } from '@playwright/test';
import { browserExecutable } from './browser-options.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
process.loadEnvFile('.env.local');
const project = 'test-e27db';
const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const require = createRequire(import.meta.url);
const auth = require('C:/Users/na/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js');
const account = auth.getGlobalDefaultAccount();
assert.equal(account.user.email, 'jejuailabs@gmail.com');
const admin = await auth.getAccessToken(account.tokens.refresh_token, [
  'https://www.googleapis.com/auth/cloud-platform',
]);
const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
const users = [],
  sessions = [],
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('response', async (r) => {
  if (r.url().includes('identitytoolkit.googleapis.com/v1/accounts:signUp') && r.ok()) {
    const u = await r.json();
    if (u.idToken) users.push(u);
  }
  if (
    (r.url().endsWith('/localwarStartSession') || r.url().endsWith('/localwarStartDaily')) &&
    r.ok()
  ) {
    const body = await r.json();
    if (body.result?.sessionId) sessions.push(body.result.sessionId);
  }
});
try {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://localwar.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.getByText('게스트 탐험가', { exact: true }).waitFor({ timeout: 30000 });
  const login = page.getByRole('button', { name: 'Google 로그인', exact: true });
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await page.getByRole('button', { name: '데일리 30문제 시작', exact: true }).click();
  await page.locator('.answer-options button').first().waitFor({ timeout: 30000 });
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /^보기 1:/ }).click();
    await page.getByRole('button', { name: '다음 지역 이야기로', exact: true }).click();
    await page.locator('.answer-options button').first().waitFor();
  }
  const menu = page.getByRole('navigation', { name: '게임 메뉴' });
  for (const name of ['전국 지도', '데일리 퀴즈', '나의 원정', '탐험 도감', '플레이 가이드']) {
    assert.ok(await menu.getByRole('button', { name, exact: true }).isEnabled());
    await menu.getByRole('button', { name, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: '퀴즈 화면 전환' });
    await dialog.waitFor();
    assert.ok((await dialog.textContent()).includes('제한 시간은 계속 흐릅니다'));
    await dialog.getByRole('button', { name: '메뉴로 이동', exact: true }).click();
    if (name !== '데일리 퀴즈')
      await menu.getByRole('button', { name: '데일리 퀴즈', exact: true }).click();
    else
      await page.getByRole('button', { name: '진행 중인 데일리 이어 하기', exact: true }).click();
    await page.locator('.answer-options button').first().waitFor({ timeout: 30000 });
  }
  assert.ok(await login.isEnabled());
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: 'docs/previews/mobile-navigation-fixed.png', fullPage: true });
  await login.click();
  const dialog = page.getByRole('dialog', { name: '퀴즈 화면 전환' });
  await dialog.waitFor();
  const popupEvent = page.waitForEvent('popup', { timeout: 20000 });
  await dialog.getByRole('button', { name: '로그인 계속하기', exact: true }).click();
  const popup = await popupEvent;
  await popup.waitForURL((url) => url.hostname === 'accounts.google.com', {
    timeout: 30000,
    waitUntil: 'domcontentloaded',
  });
  const googleLoginOpened = new URL(popup.url()).hostname === 'accounts.google.com';
  await popup.close();
  await page
    .getByRole('status')
    .filter({ hasText: '로그인을 취소했어요.' })
    .waitFor({ timeout: 20000 });
  assert.ok(await page.getByRole('button', { name: 'Google 로그인', exact: true }).isEnabled());
  const applicationErrors = errors.filter(
    (message) => !message.includes('Cross-Origin-Opener-Policy'),
  );
  assert.deepEqual(applicationErrors, []);
  console.log(
    JSON.stringify({
      production: 'passed',
      mobileMenus: 5,
      dailyResume: true,
      loginEnabledDuringQuiz: true,
      googleLoginOpened,
      loginCancelRecovers: true,
      consoleErrors: applicationErrors.length,
    }),
  );
} finally {
  await browser.close();
  for (const id of sessions) {
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/localwarSessions/${id}`;
    const data = await (
      await fetch(url, { headers: { Authorization: `Bearer ${admin.access_token}` } })
    ).json();
    if (users.some((u) => u.localId === data.fields?.uid?.stringValue))
      await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin.access_token}` },
      });
  }
  for (const user of users) {
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/localwarProfiles/${user.localId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${admin.access_token}` } },
    );
    await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: user.idToken }),
    });
  }
  console.log(JSON.stringify({ productionTestData: 'cleaned' }));
}
