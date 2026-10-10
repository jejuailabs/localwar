import fs from 'node:fs';
import path from 'node:path';
const bundled = path.join(
  process.env.LOCALAPPDATA || '',
  'ms-playwright',
  'chromium-1243',
  'chrome-win64',
  'chrome.exe',
);
export const browserExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  (process.platform === 'win32' && fs.existsSync(bundled) ? bundled : undefined);
