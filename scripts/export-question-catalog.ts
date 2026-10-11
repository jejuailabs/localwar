import fs from 'node:fs';
import { QUESTIONS } from '../lib/questions';
import { EXTRA_QUESTIONS } from '../lib/question-bank';
import { CATEGORIES, LEVELS } from '../packages/shared/game';
const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
const catalog = [...new Set(bank.map((q) => q.regionCode))].map((regionCode) => {
  const questions = bank.filter((q) => q.regionCode === regionCode);
  const ready = CATEGORIES.every((category) =>
    LEVELS.every(
      (level) =>
        questions.filter((q) => q.category === category.id && q.level === level).length >= 3,
    ),
  );
  return { regionCode, questionCount: questions.length, ready };
});
fs.writeFileSync('data/question-catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(
  JSON.stringify({
    catalogRegions: catalog.filter((r) => r.ready).length,
    questionCount: bank.length,
  }),
);
