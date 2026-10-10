import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_POINTS,
  CATEGORIES,
  LEVELS,
  itemScore,
  timeFactor,
  validatePicks,
  type SessionResult,
} from '../packages/shared/game';
import { QUESTIONS } from '../lib/questions';
import { PLAYABLE_REGIONS, PROVINCES, REGIONS } from '../lib/regions';
import { EMPTY_PROGRESS, applyResult, discover } from '../lib/progress';
import { geoArea } from 'd3-geo';
import fs from 'node:fs';
test('time bonus respects the 3-second grace and 30-second limit', () => {
  assert.equal(timeFactor(0), 1.2);
  assert.equal(timeFactor(3), 1.2);
  assert.equal(timeFactor(16.5), 1.1);
  assert.equal(timeFactor(30), 1);
  assert.throws(() => timeFactor(NaN));
});
test('timeouts never score points and each difficulty uses its base points', () => {
  for (const level of LEVELS) {
    assert.equal(itemScore(level, true, 1), Math.round(BASE_POINTS[level] * 1.2));
    assert.equal(itemScore(level, false, 1), 0);
    assert.equal(itemScore(level, true, 30), 0);
    assert.equal(itemScore(level, true, 31), 0);
  }
});
test('four distinct cells are required while duplicate levels remain allowed', () => {
  const picks = CATEGORIES.map((c) => ({ category: c.id, level: 1 as const }));
  validatePicks(picks);
  assert.throws(() => validatePicks(picks.slice(1)));
  assert.throws(() => validatePicks([picks[0], picks[0], picks[2], picks[3]]));
});
test('every playable region has all 16 unique quiz cells', () => {
  for (const region of PLAYABLE_REGIONS) {
    const questions = QUESTIONS.filter((q) => q.regionCode === region.code);
    assert.equal(questions.length, 16);
    assert.equal(new Set(questions.map((q) => `${q.category}-${q.level}`)).size, 16);
    questions.forEach((q) => {
      assert.equal(q.choices.length, 4);
      assert.ok(q.answerIndex >= 0 && q.answerIndex < 4);
      assert.ok(q.explanation);
      assert.ok(q.source.startsWith('https://'));
    });
  }
});
test('province and county geography represents small polygons, not spherical complements', () => {
  for (const file of ['public/geo/korea.geojson', 'public/geo/counties.geojson']) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    data.features.forEach((f: any) => assert.ok(geoArea(f) < 1));
  }
  assert.equal(PROVINCES.length, 17);
  assert.equal(PROVINCES.find((p) => p.iso === 'KR-43')?.regions.length, 11);
  assert.equal(PROVINCES.find((p) => p.iso === 'KR-11')?.regions.length, 25);
  assert.equal(REGIONS.length, new Set(REGIONS.map((r) => r.code)).size);
});
test('discoveries are unique and unlock the first exploration badge', () => {
  const p = discover(structuredClone(EMPTY_PROGRESS), 'chungbuk-chungju');
  assert.equal(p.discovered.length, 1);
  assert.ok(p.badges.includes('first-step'));
  assert.equal(discover(p, 'chungbuk-chungju').discovered.length, 1);
});
test('replaying a result cannot duplicate XP or occupation contribution', () => {
  const r: SessionResult = {
    sessionId: 'test-1',
    regionCode: 'chungbuk-chungju',
    totalScore: 480,
    maxScore: 480,
    correctCount: 4,
    bestCombo: 4,
    contribution: 4,
    answers: [],
    items: [],
    backend: 'demo',
  };
  const p = applyResult(structuredClone(EMPTY_PROGRESS), r);
  assert.equal(p.xp, 480);
  assert.equal(p.territory[r.regionCode], 36);
  assert.ok(p.badges.includes('perfect'));
  assert.ok(p.badges.includes('combo'));
  assert.deepEqual(applyResult(p, r), p);
});
