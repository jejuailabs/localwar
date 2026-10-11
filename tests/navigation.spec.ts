import { test, expect } from '@playwright/test';
import { CATEGORIES } from '../packages/shared/game';

async function daily(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '데일리 퀴즈', exact: true }).first().click();
  await page.getByRole('button', { name: '지원 정보 저장', exact: true }).click();
  const response = page.waitForResponse(
    (r) => r.url().endsWith('/api/game') && r.request().postDataJSON().action === 'daily',
  );
  await page.getByRole('button', { name: '데일리 30문제 시작', exact: true }).click();
  const session = await (await response).json();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  return session;
}

test('mobile fourth daily question can open every menu and resume saved answers without resetting its timer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const session = await daily(page);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /^보기 1:/ }).click();
    await page.getByRole('button', { name: '다음 지역 이야기로', exact: true }).click();
    await expect(page.locator('.answer-options button').first()).toBeEnabled();
  }
  const before = await (
    await page.request.post('/api/game', {
      data: { action: 'begin', sessionId: session.sessionId, index: 3 },
    })
  ).json();
  const menu = page.getByRole('navigation', { name: '게임 메뉴' });
  for (const name of ['전국 지도', '데일리 퀴즈', '나의 원정', '탐험 도감', '플레이 가이드']) {
    const button = menu.getByRole('button', { name, exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    const dialog = page.getByRole('dialog', { name: '퀴즈 화면 전환' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('제한 시간은 계속 흐릅니다');
    await dialog.getByRole('button', { name: '메뉴로 이동', exact: true }).click();
    await expect(page.locator('.play-screen')).toHaveCount(0);
    if (name !== '데일리 퀴즈') {
      await menu.getByRole('button', { name: '데일리 퀴즈', exact: true }).click();
    } else {
      await page.getByRole('button', { name: '진행 중인 데일리 이어 하기', exact: true }).click();
    }
    await expect(page.locator('.answer-options button').first()).toBeEnabled();
  }
  const after = await (
    await page.request.post('/api/game', {
      data: { action: 'begin', sessionId: session.sessionId, index: 3 },
    })
  ).json();
  expect(after.deadline).toBe(before.deadline);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('cancel and Escape keep the daily question, while modal keyboard shortcuts cannot submit an answer', async ({
  page,
}) => {
  const session = await daily(page);
  const prompt = await page.locator('.question-box h2').textContent();
  await page.getByRole('button', { name: '탐험 도감', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '퀴즈 화면 전환' })).toBeVisible();
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: '퀴즈 화면 전환' })).toHaveCount(0);
  await expect(page.locator('.question-box h2')).toHaveText(prompt!);
  await expect(page.locator('.answer-feedback')).toHaveCount(0);
  const resume = await (
    await page.request.post('/api/game', { data: { action: 'daily', level: 1 } })
  ).json();
  expect(resume.sessionId).toBe(session.sessionId);
  expect(resume.answers).toHaveLength(0);
  await page.getByRole('button', { name: '플레이 가이드', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '퀴즈 화면 전환' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '플레이 가이드', exact: true })).toBeFocused();
});

test('regional play can navigate after explaining the consumed attack attempt', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '서귀포시 탐험하기', exact: true }).click();
  for (const c of CATEGORIES)
    await page.getByRole('button', { name: `${c.label} 1단계 100점`, exact: true }).click();
  await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
  await expect(page.locator('.answer-options button').first()).toBeEnabled();
  await page.getByRole('button', { name: '나의 원정', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '퀴즈 화면 전환' });
  await expect(dialog).toContainText('공격 횟수는 복구되지 않습니다');
  await dialog.getByRole('button', { name: '메뉴로 이동', exact: true }).click();
  await expect(page.getByRole('heading', { name: '나의 원정 기록', exact: true })).toBeVisible();
});
