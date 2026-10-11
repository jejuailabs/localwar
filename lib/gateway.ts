import type { BattleState, Preferences } from '@/packages/shared/conquest';
import type { PublicQuestion, Level } from '@/packages/shared/game';
import type { Progress } from './progress';
import type {
  GameGateway,
  GameSession,
  Pick,
  AnswerResult,
  SessionResult,
} from '@/packages/shared/game';
export type TimedGateway = GameGateway & {
  beginQuestion(
    sessionId: string,
    index: number,
  ): Promise<{ deadline: number; item?: PublicQuestion }>;
  battleState(): Promise<BattleState>;
  savePreferences(preferences: Preferences): Promise<unknown>;
  startDaily(level: Level, practice?: boolean): Promise<GameSession>;
  discoverRegion?(regionCode: string): Promise<Progress>;
  loadProgress?(): Promise<Progress>;
};
async function request<T>(action: string, payload: object): Promise<T> {
  const response = await fetch('/api/game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || '요청을 처리하지 못했습니다. 다시 시도해 주세요.');
  return body;
}
const demo: TimedGateway = {
  mode: 'demo',
  battleState: () => request('state', {}),
  savePreferences: (preferences) => request('preferences', preferences),
  startDaily: (level, practice = false) => request('daily', { level, practice }),
  startSession: (regionCode, picks) => request<GameSession>('start', { regionCode, picks }),
  beginQuestion: (sessionId, index) => request('begin', { sessionId, index }),
  submitAnswer: (sessionId, index, choiceIndex) =>
    request<AnswerResult>('answer', { sessionId, index, choiceIndex }),
  finishSession: (sessionId) => request<SessionResult>('finish', { sessionId }),
};
export const backendMode =
  process.env.NEXT_PUBLIC_GAME_BACKEND?.trim() === 'firebase' ? 'firebase' : 'demo';
let live: Promise<TimedGateway> | undefined;
export async function getGateway(): Promise<TimedGateway> {
  if (backendMode === 'demo') return demo;
  live ??= import('./firebase-gateway').then((m) => m.createFirebaseGateway());
  return live;
}
export async function signIn() {
  const { loginWithGoogle } = await import('./firebase-gateway');
  return loginWithGoogle();
}
