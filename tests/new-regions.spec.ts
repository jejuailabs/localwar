import { test, expect } from '@playwright/test';
import { CATEGORIES, LEVELS } from '../packages/shared/game';
import { QUESTIONS as BASE_QUESTIONS } from '../lib/questions';
import { EXTRA_QUESTIONS } from '../lib/question-bank';
const bank = [...BASE_QUESTIONS, ...EXTRA_QUESTIONS];
const regions = [
  ['gyeongbuk-gyeongju', '경주시'],
  ['jeonbuk-jeonju', '전주시'],
  ['gangwon-gangneung', '강릉시'],
] as const;
for (const [code, name] of regions) {
  test(`${name} is playable in the map and all category/difficulty choices score correctly`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.goto('/');
    await expect(page.locator('.expedition-list .section-title')).toContainText('6 REGIONS');
    await page.getByRole('button', { name: '지역 목록', exact: true }).click();
    await page.getByRole('textbox', { name: '지역 검색' }).fill(name);
    const row = page
      .locator('.province-list')
      .getByRole('button', { name: new RegExp('^' + name) });
    await expect(row).toBeVisible();
    await expect(row).toHaveClass(/ready/);
    await row.click();
    await expect(page.locator('.quiz-pick')).toHaveCount(16);
    await expect(page.locator('.quiz-pick:disabled')).toHaveCount(0);
    for (const level of LEVELS) {
      for (const category of CATEGORIES)
        await page
          .getByRole('button', {
            name: `${category.label} ${level}단계 ${[0, 100, 150, 200, 300][level]}점`,
            exact: true,
          })
          .click();
      const response = page.waitForResponse(
        (r) => r.url().endsWith('/api/game') && r.request().postDataJSON().action === 'start',
      );
      await page.getByRole('button', { name: '4문제 원정 시작', exact: true }).click();
      const session = await (await response).json();
      expect(session.regionCode).toBe(code);
      for (let index = 0; index < 4; index++) {
        const item = session.items[index];
        expect(item.answerIndex).toBeUndefined();
        const canonical = bank.find((q) => q.id === item.id)!;
        const answer = canonical.choices[canonical.answerIndex];
        await expect(page.locator('.question-box h2')).toHaveText(item.prompt);
        await page
          .getByRole('button', {
            name: new RegExp('^보기 [1-4]: ' + answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'),
          })
          .click();
        await expect(page.locator('.answer-feedback')).toContainText('정답!');
        await page
          .getByRole('button', {
            name: index === 3 ? '원정 결과 확인' : '다음 지역 이야기로',
            exact: true,
          })
          .click();
      }
      await expect(page.getByRole('heading', { name: '완벽한 원정!', exact: true })).toBeVisible();
      if (level !== 4)
        await page.getByRole('button', { name: '같은 지역 다시 도전', exact: true }).click();
    }
  });
}
