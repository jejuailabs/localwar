import { EXTRA_QUESTIONS } from '../functions/lib/question-bank.js';
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
  await page.getByText('게스트 탐험가', { exact: true }).waitFor({ timeout: 30000 });
  assert.ok(
    (await page.locator('.expedition-list .section-title').textContent()).includes('6 REGIONS'),
  );
  for (const name of ['경주시', '전주시', '강릉시']) {
    await page.getByRole('button', { name: '지역 목록', exact: true }).click();
    await page.getByRole('textbox', { name: '지역 검색' }).fill(name);
    await page
      .locator('.province-list')
      .getByRole('button', { name: new RegExp('^' + name) })
      .click();
    assert.equal(await page.locator('.quiz-pick:disabled').count(), 0);
    for (const category of ['역사·문화', '인물·이야기', '특산물·음식', '관광·지역상식'])
      await page.getByRole('button', { name: category + ' 1단계 100점', exact: true }).click();
    const start = page.waitForResponse((r) => r.url().endsWith('/localwarStartSession') && r.ok());
    await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
    const session = (await (await start).json()).result;
    for (let index = 0; index < 4; index++) {
      const item = session.items[index];
      const source = EXTRA_QUESTIONS.find((q) => q.id === item.id);
      assert.ok(source);
      await page.getByRole('heading', { name: item.prompt, exact: true }).waitFor();
      const button = page
        .locator('.answer-options button')
        .filter({ hasText: source.choices[source.answerIndex] });
      assert.equal(await button.count(), 1);
      await button.click();
      await page.locator('.answer-feedback').filter({ hasText: '정답!' }).waitFor();
      await page
        .getByRole('button', {
          name: index === 3 ? '원정 결과 확인' : '다음 지역 이야기로',
          exact: true,
        })
        .click();
    }
    await page.getByRole('heading', { name: '완벽한 원정!', exact: true }).waitFor();
    await page.getByRole('button', { name: '새로운 지역 탐험', exact: true }).click();
  }
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await page.locator('.daily-lobby').waitFor();
  assert.ok((await page.locator('.daily-lobby').textContent()).includes('288문항'));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      production: 'passed',
      playableRegions: 6,
      newRegionsCorrect: '경주·전주·강릉 each4/4',
      bankCount: 288,
      consoleErrors: 0,
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
