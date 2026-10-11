import type { SessionResult } from '@/packages/shared/game';
export type Progress = {
  discovered: string[];
  visited: string[];
  xp: number;
  wins: number;
  bestScore: number;
  results: SessionResult[];
  badges: string[];
  territory: Record<string, number>;
};
export const EMPTY_PROGRESS: Progress = {
  discovered: [],
  visited: [],
  xp: 0,
  wins: 0,
  bestScore: 0,
  results: [],
  badges: [],
  territory: {},
};
const KEY = 'localwar-progress-v1';
export function loadProgress(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    return value && Array.isArray(value.discovered) && Array.isArray(value.results)
      ? { ...EMPTY_PROGRESS, ...value }
      : structuredClone(EMPTY_PROGRESS);
  } catch {
    return structuredClone(EMPTY_PROGRESS);
  }
}
export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* 저장 공간을 사용할 수 없어도 현재 플레이는 계속 진행합니다. */
  }
}
export function discover(p: Progress, code: string): Progress {
  if (p.discovered.includes(code)) return p;
  return {
    ...p,
    discovered: [...p.discovered, code],
    badges: [...new Set([...p.badges, 'first-step'])],
  };
}
export function applyResult(p: Progress, r: SessionResult): Progress {
  if (p.results.some((v) => v.sessionId === r.sessionId)) return p;
  const badges = [...p.badges];
  if (r.correctCount === (r.items.length || 4)) badges.push('perfect');
  if (r.bestCombo >= 3) badges.push('combo');
  if (r.mode !== 'daily' && new Set([...p.visited, r.regionCode]).size >= 3)
    badges.push('explorer');
  return {
    ...p,
    visited: r.mode === 'daily' ? p.visited : [...new Set([...p.visited, r.regionCode])],
    xp: p.xp + (r.mode === 'daily' ? Math.round((r.daily?.performance || 0) * 5) : r.totalScore),
    wins: p.wins + (r.correctCount >= (r.items.length || 4) * 0.75 ? 1 : 0),
    bestScore: Math.max(p.bestScore, r.totalScore),
    results: [r, ...p.results]
      .filter(
        (v, i, all) =>
          v.mode !== 'daily' || all.slice(0, i + 1).filter((a) => a.mode === 'daily').length <= 3,
      )
      .slice(0, 20),
    badges: [...new Set(badges)],
    territory: {
      ...p.territory,
      [r.regionCode]: Math.min(100, (p.territory[r.regionCode] || 32) + r.contribution),
    },
  };
}
export const BADGES = [
  { id: 'first-step', name: '첫 발걸음', description: '첫 지역을 발견하기', symbol: 'compass' },
  { id: 'combo', name: '지식의 불꽃', description: '3문제 연속 정답', symbol: 'flame' },
  { id: 'perfect', name: '완벽한 원정', description: '한 원정의 모든 문제 정답', symbol: 'crown' },
  { id: 'explorer', name: '전국 탐험가', description: '3개 지역 원정 완료', symbol: 'map' },
];
