import { chromium } from '@playwright/test';
import { browserExecutable } from './browser-options.mjs';
import { QUESTIONS } from '../functions/lib/questions.js';
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
page.on('response', async (r) => {
  if (r.url().includes('identitytoolkit.googleapis.com/v1/accounts:signUp') && r.ok()) {
    const u = await r.json();
    if (u.idToken) users.push(u);
  }
  if (r.url().endsWith('/localwarStartSession') && r.ok()) {
    const body = await r.json();
    if (body.result?.sessionId) sessions.push(body.result.sessionId);
  }
});
try {
  await page.goto('https://localwar.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.locator('.province-hit').first().waitFor({ timeout: 30000 });
  assert.equal(await page.locator('.province-hit').count(), 17);
  await page.getByText('게스트 탐험가', { exact: true }).waitFor({ timeout: 30000 });
  assert.ok((await page.locator('.mode-badge').textContent()).includes('온라인'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/previews/production-home.png', fullPage: true });
  await page.getByRole('button', { name: '서귀포시 탐험하기', exact: true }).click();
  for (const category of ['역사·문화', '인물·이야기', '특산물·음식', '관광·지역상식'])
    await page.getByRole('button', { name: `${category} 1단계 100점`, exact: true }).click();
  const start = page.waitForResponse((r) => r.url().endsWith('/localwarStartSession') && r.ok());
  await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
  const data = (await (await start).json()).result;
  for (let i = 0; i < 4; i++) {
    const q = data.items[i];
    const source = QUESTIONS.find((s) => s.id === q.id);
    const answer = source.choices[source.answerIndex];
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await page
      .locator('.question-box h2')
      .filter({ hasText: q.prompt })
      .waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: new RegExp(`^보기 [1-4]: ${escaped}$`) }).click();
    await page.locator('.answer-feedback.success').waitFor({ timeout: 15000 });
    await page
      .getByRole('button', { name: i === 3 ? '원정 결과 확인' : '다음 지역 이야기로', exact: true })
      .click();
  }
  await page
    .getByRole('heading', { name: '완벽한 원정!', exact: true })
    .waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'docs/previews/production-result.png', fullPage: true });
  await page.getByRole('button', { name: '새로운 지역 탐험', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('게스트 탐험가', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByRole('button', { name: '나의 원정', exact: true }).click();
  await page.locator('.journal-list button').waitFor({ timeout: 15000 });
  assert.equal(await page.locator('.journal-list button').count(), 1);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      production: 'passed',
      url: 'https://localwar.vercel.app',
      firebaseGuest: true,
      questionSource: 'Cloud Functions',
      expedition: '4/4 correct',
      recordAfterReload: true,
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
