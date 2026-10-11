import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { QUESTIONS } from '../lib/questions';
import { EXTRA_QUESTIONS } from '../lib/question-bank';
import { CATEGORIES, LEVELS } from '../packages/shared/game';
import { PLAYABLE_REGIONS } from '../lib/regions';
import catalog from '../data/question-catalog.json';
const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
const additions = [
  ['gyeongbuk-gyeongju', 'gyeongju'],
  ['jeonbuk-jeonju', 'jeonju'],
  ['gangwon-gangneung', 'gangneung'],
] as const;

test('three new regions each have 48 distinct sourced questions and matching fact records', () => {
  for (const [code, file] of additions) {
    const questions = bank.filter((q) => q.regionCode === code);
    const facts: Array<{
      factId: string;
      regionCode: string;
      category: string;
      claim: string;
      sourceUrl: string;
      checkedAt: string;
      status: string;
    }> = JSON.parse(fs.readFileSync(`data/region-facts/${file}.json`, 'utf8'));
    assert.equal(questions.length, 48);
    assert.equal(facts.length, 48);
    assert.equal(new Set(questions.map((q) => q.factId)).size, 48);
    assert.equal(new Set(facts.map((fact) => fact.factId)).size, 48);
    for (const category of CATEGORIES)
      for (const level of LEVELS) {
        assert.equal(
          questions.filter((q) => q.category === category.id && q.level === level).length,
          3,
        );
      }
    for (const question of questions) {
      const fact = facts.find((fact) => fact.factId === question.factId);
      assert.ok(fact, `missing fact: ${question.id}`);
      assert.equal(fact.regionCode, code);
      assert.equal(fact.category, question.category);
      assert.ok(fact.claim.length > 10);
      assert.equal(fact.sourceUrl, question.source);
      assert.match(fact.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(fact.status, 'reviewed');
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.answerIndex, 0);
      assert.ok(question.explanation.length > 10);
      assert.equal(new URL(question.source).protocol, 'https:');
      for (const wrong of question.alternatives || [])
        assert.ok(!question.choices.includes(wrong), `duplicate distractor: ${question.id}`);
    }
  }
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length);
});

test('public quiz catalog matches actual ready question pools without exposing answers', () => {
  assert.equal(bank.length, 288);
  assert.equal(PLAYABLE_REGIONS.length, 6);
  assert.equal(PLAYABLE_REGIONS[0].code, 'jeju-seogwipo');
  for (const entry of catalog) {
    assert.deepEqual(Object.keys(entry).sort(), ['questionCount', 'ready', 'regionCode']);
    assert.equal(entry.questionCount, bank.filter((q) => q.regionCode === entry.regionCode).length);
    assert.equal(entry.ready, true);
  }
});
