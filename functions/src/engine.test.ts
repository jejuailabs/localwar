import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from './questions.js';
import { shuffle, publicItems, grade, summarize } from './engine.js';
test('shuffling preserves the correct answer and hides unrevealed answer fields', () => {
  for (let n = 0; n < 20; n++) {
    const q = QUESTIONS[n];
    const shuffled = shuffle(q);
    assert.equal(shuffled.choices[shuffled.answerIndex], q.choices[q.answerIndex]);
    assert.equal(new Set(shuffled.choices).size, 4);
    const publicQuestion = publicItems([shuffled])[0];
    assert.equal('answerIndex' in publicQuestion, false);
    assert.equal('explanation' in publicQuestion, false);
  }
});
test('server deadlines prevent expired correct answers from scoring', () => {
  const q = QUESTIONS[0];
  assert.equal(grade(q, q.answerIndex, 1000, 2000).score, 120);
  assert.equal(grade(q, q.answerIndex, 1000, 31000).score, 0);
  assert.equal(grade(q, q.answerIndex, 1000, 31000).timedOut, true);
});
test('summary combines only accepted answers and computes max score correctly', () => {
  const questions = QUESTIONS.filter((q) => q.regionCode === 'jeju-seogwipo' && q.level === 4);
  const answers = questions.map((q) => grade(q, q.answerIndex, 1000, 2000));
  const result = summarize('test-session', 'jeju-seogwipo', questions, answers);
  assert.equal(result.totalScore, 1440);
  assert.equal(result.maxScore, 1440);
  assert.equal(result.bestCombo, 4);
  assert.equal(result.contribution, 12);
});
