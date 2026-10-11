import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { QUESTIONS } from '@/lib/questions';
import { EXTRA_QUESTIONS } from '@/lib/question-bank';
import {
  validatePicks,
  LEVELS,
  type Question,
  type AnswerResult,
  type SessionResult,
  type GameSession,
} from '@/packages/shared/game';
import {
  koreaDay,
  nextReset,
  validPreferences,
  selectRegional,
  selectDaily,
  regionalPower,
  dailyMetrics,
  addSupport,
  standing,
  EMPTY_AGGREGATE,
  type Preferences,
  type Aggregate,
  type BattleState,
} from '@/packages/shared/conquest';
import { shuffle, publicItems, grade, summarize } from '@/lib/server-engine';
export const runtime = 'nodejs';
type Session = {
  id: string;
  uid: string;
  regionCode: string;
  questions: Question[];
  answers: AnswerResult[];
  choices: (number | null)[];
  started: number | null;
  created: number;
  result?: SessionResult;
  mode: 'daily' | 'regional';
  day: string;
  competitive: boolean;
  level: 1 | 2 | 3 | 4;
  preferences: Preferences | null;
};
type Player = {
  day: string;
  attackUsed: number;
  practiceSession?: string | null;
  dailySession: string | null;
  dailyDone: boolean;
  preferences: Preferences | null;
  pending: Preferences | null;
  pendingDay: string;
  seen: string[];
};
const globalGame = globalThis as typeof globalThis & {
  demoGame?: {
    sessions: Map<string, Session>;
    players: Map<string, Player>;
    days: Map<string, Map<string, Aggregate>>;
  };
};
const game = (globalGame.demoGame ??= {
  sessions: new Map<string, Session>(),
  players: new Map<string, Player>(),
  days: new Map<string, Map<string, Aggregate>>(),
});
function response(s: Session): GameSession {
  const items = publicItems(s.questions);
  return {
    sessionId: s.id,
    regionCode: s.regionCode,
    items:
      s.mode === 'daily'
        ? items.map((q, i) =>
            i < s.answers.length
              ? q
              : { ...q, prompt: '다음 문제를 준비하고 있어요.', choices: [] },
          )
        : items,
    mode: s.mode,
    day: s.day,
    competitive: s.competitive,
    answers: s.answers,
    ...(s.result ? { completed: s.result } : {}),
  };
}
export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_GAME_BACKEND?.trim() === 'firebase')
    return NextResponse.json({ error: '시연 API가 비활성화되었습니다.' }, { status: 404 });
  const cookie = request.headers.get('cookie')?.match(/(?:^|; )localwar-demo=([a-zA-Z0-9-]+)/)?.[1];
  const userId = cookie || randomUUID(),
    day = koreaDay();
  function send(data: unknown, status = 200) {
    const r = NextResponse.json(data, { status });
    if (!cookie)
      r.cookies.set('localwar-demo', userId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 86400 * 365,
      });
    return r;
  }
  let p = game.players.get(userId);
  if (!p) {
    p = {
      day,
      attackUsed: 0,
      dailySession: null,
      dailyDone: false,
      preferences: null,
      pending: null,
      pendingDay: '',
      seen: [],
    };
    game.players.set(userId, p);
  }
  if (p.day !== day) {
    p.day = day;
    p.attackUsed = 0;
    p.dailySession = null;
    p.practiceSession = null;
    p.dailyDone = false;
    if (p.pending && p.pendingDay <= day) {
      p.preferences = p.pending;
      p.pending = null;
    }
  }
  const current = p;
  try {
    const b = await request.json();
    const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
    const rows = (d: string) =>
      [...(game.days.get(d) || new Map<string, Aggregate>())]
        .map(([code, a]) => standing(code, a))
        .sort((a, b) => b.total - a.total);
    if (b.action === 'state')
      return send({
        day,
        eligible: true,
        attackUsed: p.attackUsed,
        preferences: p.preferences,
        pending: p.pending,
        practiceSession: p.practiceSession || null,
        dailySession: p.dailySession,
        dailyDone: p.dailyDone,
        standings: rows(day),
        yesterday: rows(koreaDay(Date.now() - 86400000)),
        nextReset: nextReset(),
      } satisfies BattleState);
    if (b.action === 'preferences') {
      const { REGIONS } = await import('@/lib/regions');
      const prefs = validPreferences(
        b,
        REGIONS.map((r) => r.code),
      );
      if (!p.preferences) p.preferences = prefs;
      else {
        p.pending = prefs;
        p.pendingDay = koreaDay(nextReset());
      }
      return send({ saved: true });
    }
    if (b.action === 'start' || b.action === 'daily') {
      const mode = b.action === 'daily' ? 'daily' : 'regional';
      if (mode === 'regional') validatePicks(b.picks);
      else if (!LEVELS.includes(b.level)) throw Error('난이도를 골라 주세요.');
      if (mode === 'daily' && p[b.practice ? 'practiceSession' : 'dailySession']) {
        const old = game.sessions.get(p[b.practice ? 'practiceSession' : 'dailySession']!);
        if (old && (!b.practice || !old.result) && Date.now() - old.created < 86400000)
          return send(response(old));
      }
      const competitive = mode === 'daily' ? !b.practice && !p.dailyDone : p.attackUsed < 3;
      if (mode === 'daily' && competitive && !p.preferences)
        throw Error('먼저 지원 지역을 등록해 주세요.');
      const qs =
        mode === 'daily'
          ? selectDaily(bank, b.level, day, userId, p.seen)
          : selectRegional(bank, b.regionCode, b.picks, day, userId, p.seen);
      const id = randomUUID();
      const s: Session = {
        id,
        uid: userId,
        regionCode: mode === 'daily' ? p.preferences?.regionCode || 'jeju-seogwipo' : b.regionCode,
        questions: qs.map(shuffle),
        answers: [],
        choices: [],
        started: null,
        created: Date.now(),
        mode,
        day,
        competitive,
        level: b.level || 1,
        preferences: p.preferences,
      };
      game.sessions.set(id, s);
      if (mode === 'regional' && competitive) p.attackUsed++;
      if (mode === 'daily') p[b.practice ? 'practiceSession' : 'dailySession'] = id;
      return send(response(s));
    }
    const s: Session | undefined = game.sessions.get(b.sessionId);
    if (!s || s.uid !== userId || Date.now() - s.created > (s.mode === 'daily' ? 86400000 : 600000))
      throw Error('원정이 만료되었습니다. 새 원정을 시작해 주세요.');
    if (b.action === 'finish') {
      if (s.answers.length !== s.questions.length) throw Error('모든 문제 도전을 마쳐 주세요.');
      if (!s.result) {
        const r = {
          ...summarize(s.id, s.regionCode, s.questions, s.answers),
          backend: 'demo' as const,
          mode: s.mode,
          day: s.day,
          competitive: s.competitive && s.day === day,
        };
        s.result = r;
        if (s.mode === 'daily') {
          r.daily = dailyMetrics(s.answers, s.level);
          r.contribution = 0;
          if (!r.competitive) r.daily.support = 0;
        }
        if (r.competitive) {
          const regions = game.days.get(day) || new Map<string, Aggregate>(),
            a = regions.get(s.regionCode) || structuredClone(EMPTY_AGGREGATE);
          regions.set(
            s.regionCode,
            s.mode === 'daily'
              ? addSupport(a, s.preferences!, r.daily!.support)
              : {
                  ...a,
                  warRuns: a.warRuns + 1,
                  warTotal: a.warTotal + regionalPower(r.totalScore),
                },
          );
          game.days.set(day, regions);
        }
        if (s.mode === 'daily' && p.dailySession === s.id) p.dailyDone = true;
        p.seen = [...p.seen, ...s.questions.map((q) => q.factId || q.id)].slice(-250);
      }
      return send(s.result);
    }
    if (!Number.isInteger(b.index) || b.index < 0 || b.index >= s.questions.length)
      throw Error('문제 순서를 확인해 주세요.');
    if (b.action === 'begin') {
      if (b.index !== s.answers.length) throw Error('문제 순서를 확인해 주세요.');
      s.started ??= Date.now();
      return send({ deadline: s.started + 30000, item: publicItems([s.questions[b.index]])[0] });
    }
    if (b.action === 'answer') {
      if (
        b.choiceIndex !== null &&
        (!Number.isInteger(b.choiceIndex) || b.choiceIndex < 0 || b.choiceIndex > 3)
      )
        throw Error('유효하지 않은 답입니다.');
      if (b.index < s.answers.length) {
        if (s.choices[b.index] === b.choiceIndex) return send(s.answers[b.index]);
        throw Error('이미 답을 제출했습니다.');
      }
      if (b.index !== s.answers.length || s.started === null)
        throw Error('시작되지 않은 문제입니다.');
      const answer = grade(s.questions[b.index], b.choiceIndex, s.started, Date.now());
      s.answers.push(answer);
      s.choices.push(b.choiceIndex);
      s.started = null;
      return send(answer);
    }
    throw Error('알 수 없는 요청입니다.');
  } catch (error) {
    return send(
      { error: error instanceof Error ? error.message : '게임 요청을 처리하지 못했습니다.' },
      400,
    );
  }
}
