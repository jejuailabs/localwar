import { BASE_POINTS } from './game.js';
import type { AnswerResult, Level, Question, Pick } from './game.js';
export const GENDERS = ['unspecified', 'female', 'male', 'other'] as const;
export const AGES = ['unspecified', 'under20', '20s', '30s', '40s', '50s', '60plus'] as const;
export type Preferences = {
  regionCode: string;
  gender: (typeof GENDERS)[number];
  age: (typeof AGES)[number];
};
export type Aggregate = {
  warTotal: number;
  warRuns: number;
  dailyCount: number;
  groups: Record<string, { count: number; sum: number }>;
};
export type RegionStanding = {
  regionCode: string;
  attackIndex: number;
  supportIndex: number;
  total: number;
  participants: number;
};
export type BattleState = {
  day: string;
  eligible: boolean;
  attackUsed: number;
  preferences: Preferences | null;
  pending: Preferences | null;
  practiceSession?: string | null;
  dailySession: string | null;
  dailyDone: boolean;
  standings: RegionStanding[];
  yesterday: RegionStanding[];
  nextReset: number;
};
export const EMPTY_AGGREGATE: Aggregate = { warTotal: 0, warRuns: 0, dailyCount: 0, groups: {} };
export function koreaDay(now = Date.now()) {
  return new Date(now + 9 * 3600000).toISOString().slice(0, 10);
}
export function nextReset(now = Date.now()) {
  return Date.parse(koreaDay(now) + 'T00:00:00+09:00') + 86400000;
}
export function validPreferences(value: unknown, regions: string[]): Preferences {
  const p = value as Preferences;
  if (!p || !regions.includes(p.regionCode) || !GENDERS.includes(p.gender) || !AGES.includes(p.age))
    throw Error('지원 지역과 참여 정보를 확인해 주세요.');
  return { regionCode: p.regionCode, gender: p.gender, age: p.age };
}
export function regionalPower(totalScore: number) {
  return Math.min(100, Math.max(0, (totalScore / (4 * BASE_POINTS[4] * 1.2)) * 100));
}
export function dailyMetrics(answers: AnswerResult[], level: Level) {
  const correct = answers.filter((a) => a.correct);
  const accuracy = correct.length / 30;
  const speed = correct.length
    ? correct.reduce((n, a) => n + Math.max(0, Math.min(1, 1 - (a.elapsedSec ?? 30) / 30)), 0) /
      correct.length
    : 0;
  const performance = accuracy * (80 + 20 * speed);
  // Conservative launch coefficients; revise after sufficient observed correct-rate data.
  const support = performance * { 1: 0.7, 2: 0.8, 3: 0.9, 4: 1 }[level];
  return {
    accuracy: Math.round(accuracy * 10000) / 100,
    speed: Math.round(speed * 10000) / 100,
    performance: Math.round(performance * 100) / 100,
    support: Math.round(support * 100) / 100,
  };
}
export function addSupport(a: Aggregate, preferences: Preferences, score: number): Aggregate {
  const key = `${preferences.gender}-${preferences.age}`;
  const group = a.groups[key] || { count: 0, sum: 0 };
  return {
    ...a,
    dailyCount: a.dailyCount + 1,
    groups: { ...a.groups, [key]: { count: group.count + 1, sum: group.sum + score } },
  };
}
export function standing(regionCode: string, a: Aggregate): RegionStanding {
  const groups = Object.values(a.groups),
    count = groups.reduce((n, g) => n + g.count, 0);
  const sum = groups.reduce((n, g) => n + g.sum, 0),
    mean = count ? sum / count : 0;
  const qualified = groups.filter((g) => g.count >= 5);
  let supportIndex = mean;
  if (qualified.length >= 2 && count >= 20) {
    const target = count / groups.length;
    const weighted = groups.map((g) => ({
      ...g,
      w: g.count >= 5 ? Math.min(1.5, Math.max(2 / 3, target / g.count)) : 1,
    }));
    const adjusted =
      weighted.reduce((n, g) => n + g.sum * g.w, 0) /
      weighted.reduce((n, g) => n + g.count * g.w, 0);
    supportIndex = (adjusted * count + mean * 20) / (count + 20);
  }
  // Five participants unlock full daily influence; tiny samples have a proportional cap.
  supportIndex *= Math.min(1, count / 5);
  const attackIndex = 100 * (1 - Math.exp(-a.warTotal / 3000));
  return {
    regionCode,
    attackIndex: Math.round(attackIndex * 100) / 100,
    supportIndex: Math.round(supportIndex * 100) / 100,
    total: Math.round((attackIndex * 0.9 + supportIndex * 0.1) * 100) / 100,
    participants: count,
  };
}
export function seedHash(value: string) {
  let h = 2166136261;
  for (const c of value) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
export function factKey(q: Question) {
  return q.factId || q.id;
}
export function selectRegional(
  bank: Question[],
  region: string,
  picks: Pick[],
  day: string,
  player: string,
  seen: string[],
) {
  const used = new Set<string>();
  return picks.map((p) => {
    const pool = bank.filter(
      (q) =>
        q.regionCode === region &&
        q.category === p.category &&
        q.level === p.level &&
        !used.has(factKey(q)),
    );
    pool.sort(
      (a, b) =>
        Number(seen.includes(factKey(a))) - Number(seen.includes(factKey(b))) ||
        seedHash(`${day}-${player}-${a.id}`) - seedHash(`${day}-${player}-${b.id}`),
    );
    if (!pool.length) throw Error('이 지역의 문항은 준비 중입니다.');
    used.add(factKey(pool[0]));
    return pool[0];
  });
}
export function selectDaily(
  bank: Question[],
  level: Level,
  day: string,
  player: string,
  seen: string[],
) {
  const pool = bank
    .filter((q) => q.level === level)
    .sort(
      (a, b) =>
        Number(seen.includes(factKey(a))) - Number(seen.includes(factKey(b))) ||
        seedHash(`${day}-${player}-${a.id}`) - seedHash(`${day}-${player}-${b.id}`),
    );
  const groups = new Map<string, Question[]>();
  for (const q of pool) {
    const key = `${q.regionCode}-${q.category}`;
    groups.set(key, [...(groups.get(key) || []), q]);
  }
  const selected: Question[] = [],
    facts = new Set<string>();
  while (selected.length < 30) {
    let added = false;
    for (const group of groups.values()) {
      const q = group.find((q) => !facts.has(factKey(q)));
      if (q) {
        selected.push(q);
        facts.add(factKey(q));
        added = true;
        if (selected.length === 30) break;
      }
    }
    if (!added) throw Error('해당 난이도의 30문항을 준비 중입니다.');
  }
  return selected;
}
