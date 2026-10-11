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

const catalogExport = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules/tsx/dist/cli.mjs'),
    path.join(root, 'scripts/export-question-catalog.ts'),
  ],
  { cwd: root, stdio: 'inherit' },
);
if (catalogExport.status !== 0) process.exit(catalogExport.status || 1);
const exported = spawnSync(
  process.execPath,
  [path.join(root, 'node_modules/tsx/dist/cli.mjs'), path.join(root, 'scripts/export-regions.ts')],
  { cwd: root, stdio: 'inherit' },
);
if (exported.status !== 0) process.exit(exported.status || 1);

fs.copyFileSync(
  path.join(root, 'packages/shared/conquest.ts'),
  path.join(root, 'functions/src/shared/conquest.ts'),
);
fs.copyFileSync(
  path.join(root, 'lib/question-bank.ts'),
  path.join(root, 'functions/src/question-bank.ts'),
);
let bank = fs
  .readFileSync(path.join(root, 'functions/src/question-bank.ts'), 'utf8')
  .replaceAll('@/packages/shared/game', './shared/game.js')
  .replace(/from '(\.\/question-bank-[^']+)'/g, (_match, source) => `from '${source}.js'`);
fs.writeFileSync(path.join(root, 'functions/src/question-bank.ts'), bank);
for (const file of fs
  .readdirSync(path.join(root, 'lib'))
  .filter((file) => /^question-bank-.+\.ts$/.test(file))) {
  const source = fs
    .readFileSync(path.join(root, 'lib', file), 'utf8')
    .replaceAll('@/packages/shared/game', './shared/game.js');
  fs.writeFileSync(path.join(root, 'functions/src', file), source);
}

let conquest = fs
  .readFileSync(path.join(root, 'functions/src/shared/conquest.ts'), 'utf8')
  .replaceAll("'./game'", "'./game.js'");
fs.writeFileSync(path.join(root, 'functions/src/shared/conquest.ts'), conquest);

const enginePath = path.join(root, 'functions/src/engine.ts');
const engineSource = fs
  .readFileSync(path.join(root, 'lib/server-engine.ts'), 'utf8')
  .replaceAll('@/packages/shared/game', './shared/game.js');
if (fs.readFileSync(enginePath, 'utf8') !== engineSource)
  fs.writeFileSync(enginePath, engineSource);
