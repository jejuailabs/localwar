import { browserExecutable } from './browser-options.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('docs/previews', { recursive: true });
const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1040 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
await page.locator('.province-hit').first().waitFor();
await page.screenshot({ path: 'docs/previews/home-desktop.png', fullPage: true });
const provinceLabel = await page
  .locator('text.province-label')
  .filter({ hasText: /^충북$/ })
  .boundingBox();
await page.mouse.move(
  provinceLabel.x + provinceLabel.width / 2,
  provinceLabel.y + provinceLabel.height / 2,
);
await page.waitForTimeout(700);
await page.screenshot({ path: 'docs/previews/province-hover.png', fullPage: true });
await page.mouse.click(
  provinceLabel.x + provinceLabel.width / 2,
  provinceLabel.y + provinceLabel.height / 2,
);
await page.locator('.county-board').waitFor();
await page.waitForTimeout(950);
await page.screenshot({ path: 'docs/previews/chungbuk-desktop.png', fullPage: true });
await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).hover();
await page.waitForTimeout(350);
await page.screenshot({ path: 'docs/previews/chungju-hover.png', fullPage: true });
await page.getByRole('button', { name: '충주시 퀴즈 선택', exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/previews/quiz-selection.png', fullPage: true });
console.log(JSON.stringify({ errors, selection: await page.locator('.quiz-pick').count() }));
await browser.close();
