export type Category = 'history' | 'people' | 'food' | 'travel';
export type Level = 1 | 2 | 3 | 4;
export type Pick = { category: Category; level: Level };
export type Question = Pick & {
  factId?: string;
  alternatives?: string[];
  id: string;
  regionCode: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  source: string;
};
export type PublicQuestion = Omit<
  Question,
  'answerIndex' | 'explanation' | 'source' | 'alternatives' | 'factId'
> & {
  timeLimitSec: number;
};
export type AnswerResult = {
  elapsedSec?: number;
  correct: boolean;
  answerIndex: number;
  explanation: string;
  source: string;
  score: number;
  timeFactor: number;
  timedOut: boolean;
};
export type GameSession = {
  sessionId: string;
  regionCode: string;
  items: PublicQuestion[];
  mode?: 'daily' | 'regional';
  competitive?: boolean;
  day?: string;
  answers?: AnswerResult[];
  completed?: SessionResult;
};
export type SessionResult = {
  sessionId: string;
  regionCode: string;
  mode?: 'daily' | 'regional';
  competitive?: boolean;
  day?: string;
  daily?: { accuracy: number; speed: number; performance: number; support: number };
  totalScore: number;
  maxScore: number;
  correctCount: number;
  bestCombo: number;
  contribution: number;
  answers: AnswerResult[];
  items: PublicQuestion[];
  backend: 'demo' | 'firebase';
};
export interface GameGateway {
  mode: 'demo' | 'firebase';
  startSession(regionCode: string, picks: Pick[]): Promise<GameSession>;
  submitAnswer(sessionId: string, index: number, choiceIndex: number | null): Promise<AnswerResult>;
  finishSession(sessionId: string): Promise<SessionResult>;
}
export const CATEGORIES = [
  {
    id: 'history' as Category,
    label: '역사·문화',
    short: '역사',
    icon: 'landmark',
    color: '#eebc70',
  },
  {
    id: 'people' as Category,
    label: '인물·이야기',
    short: '인물',
    icon: 'users',
    color: '#c7a1ff',
  },
  {
    id: 'food' as Category,
    label: '특산물·음식',
    short: '음식',
    icon: 'utensils',
    color: '#ffa185',
  },
  {
    id: 'travel' as Category,
    label: '관광·지역상식',
    short: '여행',
    icon: 'compass',
    color: '#71dece',
  },
];
export const LEVELS: Level[] = [1, 2, 3, 4];
export const BASE_POINTS = { 1: 100, 2: 150, 3: 200, 4: 300 } as const;
export const TIME_LIMIT = 30;
export function timeFactor(elapsedSec: number) {
  if (!Number.isFinite(elapsedSec) || elapsedSec < 0)
    throw new Error('유효하지 않은 응답 시간입니다.');
  if (elapsedSec <= 3) return 1.2;
  if (elapsedSec >= TIME_LIMIT) return 1;
  return Math.round((1.2 - ((elapsedSec - 3) / (TIME_LIMIT - 3)) * 0.2) * 100) / 100;
}
export function itemScore(level: Level, correct: boolean, elapsedSec: number) {
  if (!correct || elapsedSec >= TIME_LIMIT) return 0;
  return Math.round(BASE_POINTS[level] * timeFactor(elapsedSec));
}
export function validatePicks(picks: Pick[]) {
  if (picks.length !== 4 || new Set(picks.map((p) => `${p.category}-${p.level}`)).size !== 4)
    throw new Error('서로 다른 4칸을 선택해 주세요.');
  if (picks.some((p) => !CATEGORIES.some((c) => c.id === p.category) || !LEVELS.includes(p.level)))
    throw new Error('유효하지 않은 선택입니다.');
}
