import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../lib/questions';
import { CATEGORIES } from '../packages/shared/game';
test('province hover stays on the flat national map until click, then county click opens 16 choices', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.province-hit')).toHaveCount(17);
  await expect(page.locator('.province-island.lifted')).toHaveCount(0);
  expect(
    await page
      .locator('.province-side')
      .evaluateAll((sides) => sides.every((side) => getComputedStyle(side).opacity === '0')),
  ).toBe(true);
  const label = await page
    .locator('text.province-label')
    .filter({ hasText: /^충북$/ })
    .boundingBox();
  expect(label).not.toBeNull();
  await page.mouse.move(label!.x + label!.width / 2, label!.y + label!.height / 2);
  await expect(page.locator('.province-island.lifted')).toHaveCount(1);
  await page.waitForTimeout(900);
  await expect(page.locator('.county-hit')).toHaveCount(0);
  await expect(page.locator('.province-lift-label')).toContainText('클릭하면');
  await page.mouse.click(label!.x + label!.width / 2, label!.y + label!.height / 2);
  await expect(page.locator('.county-hit')).toHaveCount(11);
  await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).hover();
  await expect(page.locator('.county-game-card')).toContainText('충주시');
  await expect(page.locator('.county-hovered')).toHaveCount(1);
  await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).click();
  await expect(page.locator('.quiz-pick')).toHaveCount(16);
  await expect(
    page.getByRole('button', { name: '도전할 퀴즈를 4개 더 골라주세요' }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
test('a complete expedition scores server-side, awards combos and persists after reload', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '서귀포시 탐험하기', exact: true }).click();
  for (const c of CATEGORIES)
    await page.getByRole('button', { name: `${c.label} 1단계 100점`, exact: true }).click();
  const sessionResponse = page.waitForResponse(
    (r) => r.url().endsWith('/api/game') && r.request().postDataJSON().action === 'start',
  );
  await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
  const session = await (await sessionResponse).json();
  for (const q of session.items) {
    expect(q.answerIndex).toBeUndefined();
    expect(q.explanation).toBeUndefined();
    const source = QUESTIONS.find((s) => s.id === q.id)!;
    const answer = source.choices[source.answerIndex];
    await expect(page.locator('.question-box h2')).toHaveText(q.prompt);
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await page.getByRole('button', { name: new RegExp(`^보기 [1-4]: ${escaped}$`) }).click();
    await expect(page.locator('.answer-feedback')).toContainText('정답!');
    await page
      .getByRole('button', {
        name: q === session.items[3] ? '원정 결과 확인' : '다음 지역 이야기로',
        exact: true,
      })
      .click();
  }
  await expect(page.getByRole('heading', { name: '완벽한 원정!', exact: true })).toBeVisible();
  await expect(page.locator('.result-total')).toContainText('480');
  await page.getByRole('button', { name: '새로운 지역 탐험', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '탐험 도감', exact: true }).click();
  await expect(page.locator('.badge-card.unlocked')).toHaveCount(3);
  await page.getByRole('button', { name: '나의 원정', exact: true }).click();
  await expect(page.locator('.journal-list button')).toHaveCount(1);
});
test('mobile county selection and grid fit the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '제주특별자치도 시군 지도 펼치기', exact: true }).click();
  await expect(page.locator('.county-hit')).toHaveCount(2);
  await page.getByRole('button', { name: '서귀포시 퀴즈 선택', exact: true }).click();
  await expect(page.locator('.quiz-pick')).toHaveCount(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'docs/previews/mobile-selection.png', fullPage: true });
});
test('unready areas remain explorable and do not start unavailable questions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '지역 목록', exact: true }).click();
  await page.getByRole('textbox', { name: '지역 검색' }).fill('제천');
  await page.getByRole('button', { name: '제천시', exact: true }).click();
  await expect(page.getByRole('heading', { name: '새로운 지역을 발견했어요!' })).toBeVisible();
  await expect(page.locator('.quiz-pick')).toHaveCount(16);
  await expect(page.locator('.quiz-pick:disabled')).toHaveCount(16);
});
test('API rejects duplicate picks, answers out of order and double submits', async ({
  request,
}) => {
  const picks = CATEGORIES.map((c) => ({ category: c.id, level: 1 }));
  const invalid = await request.post('/api/game', {
    data: {
      action: 'start',
      regionCode: 'chungbuk-chungju',
      picks: [picks[0], picks[0], picks[2], picks[3]],
    },
  });
  expect(invalid.status()).toBe(400);
  const s = await (
    await request.post('/api/game', {
      data: { action: 'start', regionCode: 'chungbuk-chungju', picks },
    })
  ).json();
  const early = await request.post('/api/game', {
    data: { action: 'answer', sessionId: s.sessionId, index: 0, choiceIndex: 0 },
  });
  expect(early.status()).toBe(400);
  await request.post('/api/game', { data: { action: 'begin', sessionId: s.sessionId, index: 0 } });
  const q = QUESTIONS.find((q) => q.id === s.items[0].id)!;
  const correct = s.items[0].choices.indexOf(q.choices[q.answerIndex]);
  const answers = await Promise.all([
    request.post('/api/game', {
      data: { action: 'answer', sessionId: s.sessionId, index: 0, choiceIndex: correct },
    }),
    request.post('/api/game', {
      data: { action: 'answer', sessionId: s.sessionId, index: 0, choiceIndex: correct },
    }),
  ]);
  expect(answers.map((r) => r.status()).sort()).toEqual([200, 400]);
  const finish = await request.post('/api/game', {
    data: { action: 'finish', sessionId: s.sessionId },
  });
  expect(finish.status()).toBe(400);
});
test('real touch taps open county selection without relying on hover', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:3000');
    await page.getByRole('button', { name: '제주특별자치도 시군 지도 펼치기', exact: true }).tap();
    await expect(page.locator('.county-hit')).toHaveCount(2);
    await page.getByRole('button', { name: '서귀포시 퀴즈 선택', exact: true }).tap();
    await expect(page.locator('.quiz-pick')).toHaveCount(16);
  } finally {
    await context.close();
  }
});
test('an unanswered question expires after 30 seconds and scores zero', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '서귀포시 탐험하기', exact: true }).click();
  for (const c of CATEGORIES)
    await page.getByRole('button', { name: `${c.label} 1단계 100점`, exact: true }).click();
  await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
  await expect(page.locator('.answer-feedback')).toContainText('시간 종료!', { timeout: 35000 });
  await expect(page.locator('.score-card h3')).toContainText('0');
  await expect(page.getByRole('button', { name: '다음 지역 이야기로', exact: true })).toBeEnabled();
});

test('small Sejong remains selectable on hover and opens only on click or keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const sejong = page.getByRole('button', { name: '세종특별자치시 시군 지도 펼치기', exact: true });
  const target = await sejong.evaluate((node) => {
    const path = node as SVGPathElement;
    const box = path.getBBox();
    const matrix = path.getScreenCTM()!;
    for (let y = 0.1; y < 1; y += 0.1) {
      for (let x = 0.1; x < 1; x += 0.1) {
        const point = new DOMPoint(box.x + box.width * x, box.y + box.height * y);
        const screen = point.matrixTransform(matrix);
        if (path.isPointInFill(point) && document.elementFromPoint(screen.x, screen.y) === path)
          return { x: screen.x, y: screen.y };
      }
    }
    throw new Error('Sejong has no selectable interior');
  });
  await page.mouse.move(target.x, target.y);
  await page.waitForTimeout(900);
  await expect(page.locator('.province-lift-label strong')).toHaveText('세종특별자치시');
  await expect(page.locator('.province-island.lifted')).toHaveCount(1);
  await expect(page.locator('.county-hit')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(page.locator('.province-island.lifted')).toHaveCount(0);
  await page.mouse.move(target.x, target.y);
  await page.mouse.click(target.x, target.y);
  await expect(page.locator('.county-hit')).toHaveCount(1);
  await page.getByRole('button', { name: '전국으로', exact: true }).click();
  await expect(page.locator('.county-hit')).toHaveCount(0);
  await sejong.focus();
  await page.waitForTimeout(600);
  await expect(page.locator('.county-hit')).toHaveCount(0);
  await sejong.press('Enter');
  await expect(page.locator('.county-hit')).toHaveCount(1);
});
