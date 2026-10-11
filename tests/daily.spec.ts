import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../lib/questions';
import { EXTRA_QUESTIONS } from '../lib/question-bank';
const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
test('daily completes 30 questions, resumes without resetting time and supports own region once', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await page.getByRole('button', { name: '지원 정보 저장', exact: true }).click();
  await expect(page.locator('.saved-support')).toContainText('서귀포시');
  const beforeState = await (
    await page.request.post('/api/game', { data: { action: 'state' } })
  ).json();
  const participantsBefore =
    beforeState.standings.find((row: any) => row.regionCode === 'jeju-seogwipo')?.participants || 0;
  const start = page.waitForResponse(
    (r) => r.url().endsWith('/api/game') && r.request().postDataJSON().action === 'daily',
  );
  await page.getByRole('button', { name: '데일리 30문제 시작', exact: true }).click();
  const response = await start;
  const s = await response.json();
  expect(response.ok(), JSON.stringify(s)).toBe(true);
  expect(s.items).toHaveLength(30);
  expect(s.items.every((q: any) => q.choices.length === 0)).toBe(true);
  await expect(page.locator('.question-box h2')).not.toHaveText('다음 문제를 준비하고 있어요.');
  const state = await page.request.post('/api/game', {
    data: { action: 'begin', sessionId: s.sessionId, index: 0 },
  });
  const timing = await state.json();
  await page.reload();
  await expect(page.locator('.question-box h2')).toHaveText(timing.item.prompt);
  const resume = await (
    await page.request.post('/api/game', {
      data: { action: 'begin', sessionId: s.sessionId, index: 0 },
    })
  ).json();
  expect(resume.deadline).toBe(timing.deadline);
  for (let i = 0; i < 30; i++) {
    await expect(page.locator('.answer-options button')).toHaveCount(4);
    await expect(page.locator('.answer-options button').first()).toBeEnabled();
    const prompt = await page.locator('.question-box h2').textContent();
    const source = bank.find((q) => q.prompt === prompt)!;
    expect(source).toBeTruthy();
    const correct = source.choices[source.answerIndex];
    await page
      .getByRole('button', {
        name: new RegExp(`^보기 [1-4]: ${correct.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      .click();
    await expect(page.locator('.answer-feedback')).toContainText('정답!');
    await page
      .getByRole('button', {
        name: i === 29 ? '원정 결과 확인' : '다음 지역 이야기로',
        exact: true,
      })
      .click();
    if (i < 29) await expect(page.locator('.question-box h2')).not.toHaveText(prompt!);
  }
  await expect(page.getByRole('heading', { name: '전국 지식왕!', exact: true })).toBeVisible();
  await expect(page.locator('.daily-metrics')).toContainText('30/30');
  await page.screenshot({ path: 'docs/previews/daily-result.png', fullPage: true });
  const finish = await (
    await page.request.post('/api/game', { data: { action: 'finish', sessionId: s.sessionId } })
  ).json();
  expect(finish.competitive).toBe(true);
  expect(finish.daily.accuracy).toBe(100);
  const status = await (await page.request.post('/api/game', { data: { action: 'state' } })).json();
  expect(status.dailyDone).toBe(true);
  expect(status.standings.find((row: any) => row.regionCode === s.regionCode)?.participants).toBe(
    participantsBefore + 1,
  );
  await page.request.post('/api/game', { data: { action: 'finish', sessionId: s.sessionId } });
  const again = await (await page.request.post('/api/game', { data: { action: 'state' } })).json();
  expect(again.standings.find((row: any) => row.regionCode === s.regionCode)?.participants).toBe(
    participantsBefore + 1,
  );
  const today = await (
    await page.request.post('/api/game', { data: { action: 'daily', level: 4 } })
  ).json();
  expect(today.sessionId).toBe(s.sessionId);
  await page.request.post('/api/game', {
    data: { action: 'preferences', regionCode: 'seoul-jongno', gender: 'female', age: '30s' },
  });
  const pending = await (
    await page.request.post('/api/game', { data: { action: 'state' } })
  ).json();
  expect(pending.preferences.regionCode).toBe('jeju-seogwipo');
  expect(pending.pending.regionCode).toBe('seoul-jongno');
  await page.getByRole('button', { name: '나의 원정', exact: true }).click();
  await expect(page.locator('.journal-list button')).toHaveCount(1);
  await page.locator('.journal-list button').filter({ hasText: '데일리 퀴즈' }).click();
  await expect(page.getByRole('heading', { name: '전국 지식왕!', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '데일리 전장으로', exact: true }).click();
  const training = page.waitForResponse(
    (r) => r.url().endsWith('/api/game') && r.request().postDataJSON().action === 'daily',
  );
  await page.getByRole('button', { name: '지원 반영 없이 연습하기', exact: true }).click();
  const practice = await (await training).json();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  await page.reload();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  const continued = await (
    await page.request.post('/api/game', { data: { action: 'daily', level: 1, practice: true } })
  ).json();
  expect(continued.sessionId).toBe(practice.sessionId);
  expect(continued.competitive).toBe(false);
});
test('only three regional starts count and later expeditions are practice', async ({ request }) => {
  const picks = ['history', 'people', 'food', 'travel'].map((category) => ({ category, level: 1 }));
  for (let i = 0; i < 4; i++) {
    const s = await (
      await request.post('/api/game', {
        data: { action: 'start', regionCode: 'seoul-jongno', picks },
      })
    ).json();
    expect(s.competitive).toBe(i < 3);
  }
  const state = await (await request.post('/api/game', { data: { action: 'state' } })).json();
  expect(state.attackUsed).toBe(3);
});
test('daily lobby fits mobile and optional demographics never block enrollment', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await expect(
    page.getByRole('heading', { name: '오늘은 어느 난이도로?', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'docs/previews/daily-mobile.png', fullPage: true });
});
test('parallel lobby loading waits for one demo identity before saving support', async ({
  page,
}) => {
  let release!: () => void,
    requested!: () => void,
    states = 0;
  const gate = new Promise<void>((r) => (release = r)),
    first = new Promise<void>((r) => (requested = r));
  await page.route('**/api/game', async (route) => {
    if (route.request().postDataJSON().action === 'state' && ++states === 1) {
      requested();
      await gate;
    }
    await route.continue();
  });
  try {
    await page.goto('/');
    await first;
    await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
    await page.waitForTimeout(200);
    expect(states).toBe(1);
    release();
    await page.getByRole('button', { name: '지원 정보 저장', exact: true }).click();
    await expect(page.locator('.saved-support')).toContainText('서귀포시');
    const state = await (
      await page.request.post('/api/game', { data: { action: 'state' } })
    ).json();
    expect(state.preferences.regionCode).toBe('jeju-seogwipo');
  } finally {
    release();
  }
});
test('mobile daily starts and advances at the top of each question', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await page.getByRole('button', { name: '지원 정보 저장', exact: true }).click();
  await expect(page.locator('.saved-support')).toContainText('서귀포시');
  await page.getByRole('button', { name: '데일리 30문제 시작', exact: true }).click();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: /^보기 1:/ }).click();
  await page.getByRole('button', { name: '다음 지역 이야기로', exact: true }).click();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
