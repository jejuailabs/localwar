import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root, 'functions/src/shared'), { recursive: true });
fs.copyFileSync(
  path.join(root, 'packages/shared/game.ts'),
  path.join(root, 'functions/src/shared/game.ts'),
);
fs.copyFileSync(
  path.join(root, 'lib/progress.ts'),
  path.join(root, 'functions/src/shared/progress.ts'),
);
let progress = fs
  .readFileSync(path.join(root, 'functions/src/shared/progress.ts'), 'utf8')
  .replaceAll('@/packages/shared/game', './game.js');
fs.writeFileSync(path.join(root, 'functions/src/shared/progress.ts'), progress);
let questions = fs
  .readFileSync(path.join(root, 'lib/questions.ts'), 'utf8')
  .replaceAll('@/packages/shared/game', './shared/game.js');
fs.writeFileSync(path.join(root, 'functions/src/questions.ts'), questions);

const exported = spawnSync(
  process.execPath,
  [path.join(root, 'node_modules/tsx/dist/cli.mjs'), path.join(root, 'scripts/export-regions.ts')],
  { cwd: root, stdio: 'inherit' },
);
if (exported.status !== 0) process.exit(exported.status || 1);
