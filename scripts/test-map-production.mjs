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
  await page.goto('https://localwar.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.locator('.province-hit').first().waitFor({ timeout: 30000 });
  await page.getByText('게스트 탐험가', { exact: true }).waitFor({ timeout: 30000 });
  assert.equal(await page.locator('.province-hit').count(), 17);
  assert.equal(await page.locator('.province-island.lifted').count(), 0);
  await page.screenshot({ path: 'docs/previews/production-home.png', fullPage: true });
  const size = (selector) =>
    page.locator(selector).evaluate((g) => g.getBoundingClientRect().height);
  const initial = await size('.national-board');
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await page.waitForTimeout(650);
  assert.equal(await page.getByLabel('지도 배율').textContent(), '120%');
  assert.ok((await size('.national-board')) > initial * 1.18);
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await page.getByRole('button', { name: '충청북도 시군 지도 펼치기', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.locator('.county-hit').first().waitFor();
  await page.waitForTimeout(1000);
  const county = await size('.county-board');
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await page.waitForTimeout(650);
  assert.ok((await size('.county-board')) > county * 1.18);
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).click();
  assert.equal(await page.locator('.quiz-pick').count(), 16);
  await page.getByRole('button', { name: '전국 지도', exact: true }).click();
  for (const name of ['서귀포시', '충주시', '종로구']) {
    await page.getByRole('button', { name: '지역 목록', exact: true }).click();
    await page.getByRole('textbox', { name: '지역 검색' }).fill(name);
    await page
      .locator('.province-list')
      .getByRole('button', { name: new RegExp('^' + name) })
      .click();
    const image = page.locator('.challenge-art img');
    await image.evaluate((img) => img.decode());
    assert.ok((await image.getAttribute('src')).startsWith('/photos/'));
    assert.ok((await image.evaluate((img) => img.naturalWidth)) >= 1200);
    assert.ok(
      (await page.locator('.regional-photo-credit').getAttribute('href')).startsWith('https://'),
    );
    await page.getByRole('button', { name: '전국 지도', exact: true }).click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  assert.equal(await page.getByLabel('지도 배율').textContent(), '120%');
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      production: 'passed',
      nationalZoom: true,
      countyZoom: true,
      officialPhotoBanners: 3,
      mobileControls: true,
      consoleErrors: errors.length,
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
