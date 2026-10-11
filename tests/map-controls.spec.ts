import { test, expect } from '@playwright/test';

test('national and county maps zoom, pan and reset without unintended navigation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.province-hit')).toHaveCount(17);
  const board = page.locator('.national-board');
  const size = () => board.evaluate((g) => g.getBoundingClientRect().height);
  const initial = await size();
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await expect(page.getByLabel('지도 배율')).toHaveText('120%');
  await expect.poll(size).toBeGreaterThan(initial * 1.18);
  const svg = await page.locator('.korea-map').boundingBox();
  const before = await board.evaluate((g) => getComputedStyle(g).transform);
  await page.mouse.move(svg!.x + svg!.width * 0.55, svg!.y + svg!.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(svg!.x + svg!.width * 0.55 + 65, svg!.y + svg!.height * 0.45 + 40, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator('.county-hit')).toHaveCount(0);
  await expect.poll(() => board.evaluate((g) => getComputedStyle(g).transform)).not.toBe(before);
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await expect(page.getByLabel('지도 배율')).toHaveText('100%');
  await expect.poll(size).toBeLessThan(initial * 1.01);
  await page.getByRole('button', { name: '지도 축소', exact: true }).click();
  await expect(page.getByLabel('지도 배율')).toHaveText('80%');
  await expect(page.getByRole('button', { name: '지도 축소', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await page.getByRole('button', { name: '충청북도 시군 지도 펼치기', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.county-hit')).toHaveCount(11);
  await page.waitForTimeout(1000);
  const county = page.locator('.county-board');
  const countySize = () => county.evaluate((g) => g.getBoundingClientRect().height);
  const base = await countySize();
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await expect.poll(countySize).toBeGreaterThan(base * 1.18);
  await page.getByRole('button', { name: '지도 축소', exact: true }).click();
  await expect.poll(countySize).toBeLessThan(base * 1.01);
  await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).click();
  await expect(page.locator('.quiz-pick')).toHaveCount(16);
});

test('mobile enlarged flat map keeps Jeju visible and zoom controls tappable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.province-hit')).toHaveCount(17);
  const viewport = await page.locator('.map-viewport').boundingBox();
  const jeju = await page
    .getByRole('button', { name: '제주특별자치도 시군 지도 펼치기', exact: true })
    .boundingBox();
  expect(jeju!.y).toBeGreaterThan(viewport!.y);
  expect(jeju!.y + jeju!.height).toBeLessThan(viewport!.y + viewport!.height - 40);
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await expect(page.getByLabel('지도 배율')).toHaveText('120%');
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('regional banners use real credited photos and unready areas do not borrow another region', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.featured-expedition > img')).toHaveAttribute('src', /^\/photos\//);
  await expect(page.locator('.featured-photo-credit')).toHaveAttribute('href', /^https:\/\//);
  for (const name of ['서귀포시', '충주시', '종로구']) {
    await page.getByRole('button', { name: '지역 목록', exact: true }).click();
    await page.getByRole('textbox', { name: '지역 검색' }).fill(name);
    await page
      .locator('.province-list')
      .getByRole('button', { name: new RegExp('^' + name) })
      .click();
    const photo = page.locator('.challenge-art img');
    await expect(photo).toHaveAttribute('src', /^\/photos\//);
    await expect
      .poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(600);
    await expect(page.locator('.regional-photo-credit')).toHaveAttribute('href', /^https:\/\//);
    await page.getByRole('button', { name: '전국 지도', exact: true }).click();
  }
  await page.getByRole('button', { name: '지역 목록', exact: true }).click();
  await page.getByRole('textbox', { name: '지역 검색' }).fill('제천');
  await page.getByRole('button', { name: '제천시', exact: true }).click();
  await expect(page.locator('.challenge-art img')).toHaveCount(0);
  await expect(page.locator('.region-photo-pending')).toHaveAttribute(
    'aria-label',
    '제천시 지역 사진 준비 중',
  );
});
