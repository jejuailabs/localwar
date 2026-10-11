import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  koreaDay,
  nextReset,
  dailyMetrics,
  standing,
  addSupport,
  EMPTY_AGGREGATE,
  selectDaily,
  selectRegional,
  validPreferences,
  factKey,
} from '../packages/shared/conquest';
import { QUESTIONS } from '../lib/questions';
import { EXTRA_QUESTIONS } from '../lib/question-bank';
import { PLAYABLE_REGIONS } from '../lib/regions';
import type { AnswerResult } from '../packages/shared/game';
const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
const answer = (correct: boolean, elapsedSec: number): AnswerResult => ({
  correct,
  elapsedSec,
  answerIndex: 0,
  explanation: '',
  source: '',
  score: correct ? 120 : 0,
  timeFactor: 1.2,
  timedOut: false,
});
test('Korean midnight rolls over all daily state consistently', () => {
  assert.equal(koreaDay(Date.parse('2026-10-11T14:59:59Z')), '2026-10-11');
  assert.equal(koreaDay(Date.parse('2026-10-11T15:00:00Z')), '2026-10-12');
  assert.equal(nextReset(Date.parse('2026-10-11T14:59:59Z')), Date.parse('2026-10-11T15:00:00Z'));
});
test('daily speed rewards only correct answers and cannot exceed accuracy ceilings', () => {
  assert.equal(
    dailyMetrics(
      Array.from({ length: 30 }, () => answer(false, 0)),
      4,
    ).support,
    0,
  );
  assert.equal(
    dailyMetrics(
      Array.from({ length: 30 }, () => answer(true, 0)),
      4,
    ).support,
    100,
  );
  assert.equal(
    dailyMetrics(
      Array.from({ length: 30 }, () => answer(true, 0)),
      1,
    ).support,
    70,
  );
  const mix = [
    ...Array.from({ length: 15 }, () => answer(true, 15)),
    ...Array.from({ length: 15 }, () => answer(false, 0)),
  ];
  assert.deepEqual(dailyMetrics(mix, 4), { accuracy: 50, speed: 50, performance: 45, support: 45 });
});
test('every difficulty has 30 distinct facts balanced across playable areas', () => {
  for (const level of [1, 2, 3, 4] as const) {
    const qs = selectDaily(bank, level, '2026-10-11', 'player', []);
    assert.equal(qs.length, 30);
    assert.equal(new Set(qs.map(factKey)).size, 30);
    assert.equal(new Set(qs.map((q) => q.regionCode)).size, PLAYABLE_REGIONS.length);
    assert.equal(new Set(qs.map((q) => q.category)).size, 4);
    assert.deepEqual(qs, selectDaily(bank, level, '2026-10-11', 'player', []));
    assert.notDeepEqual(
      qs.map((q) => q.id),
      selectDaily(bank, level, '2026-10-12', 'player', []).map((q) => q.id),
    );
  }
});
test('each regional cell has at least 3 options and prefers unseen facts', () => {
  for (const code of PLAYABLE_REGIONS.map((r) => r.code))
    for (const category of ['history', 'people', 'food', 'travel'] as const)
      for (const level of [1, 2, 3, 4] as const) {
        const pool = bank.filter(
          (q) => q.regionCode === code && q.category === category && q.level === level,
        );
        assert.ok(pool.length >= 3);
        const selected = selectRegional(
          bank,
          code,
          [{ category, level }],
          '2026-10-11',
          'player',
          [],
        )[0];
        const next = selectRegional(bank, code, [{ category, level }], '2026-10-11', 'player', [
          factKey(selected),
        ])[0];
        assert.notEqual(factKey(next), factKey(selected));
      }
});
test('public territory score is 90/10 and demography changes no individual score', () => {
  let a = structuredClone(EMPTY_AGGREGATE);
  const p = { regionCode: 'seoul-jongno', gender: 'female' as const, age: '30s' as const };
  a = addSupport(a, p, 100);
  assert.equal(standing(p.regionCode, a).supportIndex, 20);
  for (let i = 0; i < 4; i++) a = addSupport(a, p, 100);
  const s = standing(p.regionCode, a);
  assert.equal(s.supportIndex, 100);
  assert.equal(s.total, 10);
  assert.equal(
    Object.keys(s).some((k) => k === 'groups'),
    false,
  );
  assert.throws(() => validPreferences({ ...p, gender: 'invalid' }, [p.regionCode]));
});
import { standing as correctedStanding } from '../packages/shared/conquest';
test('demographic correction activates only with enough samples and is label-neutral', () => {
  const a = {
    warTotal: 0,
    warRuns: 0,
    dailyCount: 30,
    groups: { 'female-30s': { count: 25, sum: 250 }, 'male-40s': { count: 5, sum: 450 } },
  };
  const adjusted = correctedStanding('region', a);
  assert.ok(adjusted.supportIndex > 700 / 30);
  assert.ok(adjusted.supportIndex < 100);
  const swapped = {
    ...a,
    groups: { 'male-40s': a.groups['female-30s'], 'female-30s': a.groups['male-40s'] },
  };
  assert.equal(correctedStanding('region', swapped).supportIndex, adjusted.supportIndex);
  const tiny = {
    ...a,
    dailyCount: 29,
    groups: { 'female-30s': { count: 25, sum: 250 }, 'male-40s': { count: 4, sum: 360 } },
  };
  assert.equal(correctedStanding('region', tiny).supportIndex, Math.round((610 / 29) * 100) / 100);
});
import { regionalPower } from '../packages/shared/conquest';
test('regional conquest rewards higher difficulty on one common score scale', () => {
  assert.ok(Math.abs(regionalPower(480) - 100 / 3) < 0.0001);
  assert.equal(regionalPower(1440), 100);
  assert.equal(regionalPower(0), 0);
  assert.equal(regionalPower(720), 50);
});
