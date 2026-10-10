import { NextResponse } from 'next/server';
import { randomUUID, randomInt } from 'node:crypto';
import { QUESTIONS } from '@/lib/questions';
import {
  BASE_POINTS,
  TIME_LIMIT,
  itemScore,
  timeFactor,
  validatePicks,
  type Question,
  type AnswerResult,
  type Pick,
} from '@/packages/shared/game';
export const runtime = 'nodejs';
type Session = {
  id: string;
  regionCode: string;
  questions: Question[];
  answers: AnswerResult[];
  started: number | null;
  created: number;
  result?: object;
};
const gameGlobal = globalThis as typeof globalThis & { demoSessions?: Map<string, Session> };
const sessions = (gameGlobal.demoSessions ??= new Map<string, Session>());
function shuffle(q: Question): Question {
  const order = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answerIndex: order.indexOf(q.answerIndex),
  };
}
function publicItems(session: Session) {
  return session.questions.map(({ answerIndex, explanation, source, ...q }) => ({
    ...q,
    timeLimitSec: TIME_LIMIT,
  }));
}
export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_GAME_BACKEND === 'firebase')
    return NextResponse.json({ error: '시연 API가 비활성화되었습니다.' }, { status: 404 });
  try {
    const body = await request.json();
    for (const [id, s] of sessions) if (Date.now() - s.created > 600000) sessions.delete(id);
    if (body.action === 'start') {
      if (!Array.isArray(body.picks)) throw new Error('4칸을 선택해 주세요.');
      const picks = body.picks as Pick[];
      validatePicks(picks);
      const questions = picks.map((p) =>
        QUESTIONS.find(
          (q) =>
            q.regionCode === body.regionCode && q.category === p.category && q.level === p.level,
        ),
      );
      if (questions.some((q) => !q)) throw new Error('이 지역의 문항은 준비 중입니다.');
      const id = randomUUID();
      const s: Session = {
        id,
        regionCode: body.regionCode,
        questions: questions.map((q) => shuffle(q!)),
        answers: [],
        started: null,
        created: Date.now(),
      };
      sessions.set(id, s);
      return NextResponse.json({ sessionId: id, regionCode: s.regionCode, items: publicItems(s) });
    }
    const s = sessions.get(body.sessionId);
    if (!s) throw new Error('원정이 만료되었습니다. 새 원정을 시작해 주세요.');
    if (body.action === 'begin') {
      if (body.index !== s.answers.length || body.index >= 4)
        throw new Error('문제 순서를 확인해 주세요.');
      s.started ??= Date.now();
      return NextResponse.json({ deadline: s.started + TIME_LIMIT * 1000 });
    }
    if (body.action === 'answer') {
      if (body.index !== s.answers.length || body.index >= 4 || s.started === null)
        throw new Error('이미 제출했거나 시작되지 않은 문제입니다.');
      if (
        body.choiceIndex !== null &&
        (!Number.isInteger(body.choiceIndex) || body.choiceIndex < 0 || body.choiceIndex > 3)
      )
        throw new Error('유효하지 않은 답입니다.');
      const q = s.questions[body.index];
      const elapsed = (Date.now() - s.started) / 1000;
      const timedOut = elapsed >= TIME_LIMIT;
      const correct = !timedOut && body.choiceIndex === q.answerIndex;
      const result: AnswerResult = {
        correct,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
        source: q.source,
        score: itemScore(q.level, correct, elapsed),
        timeFactor: timeFactor(elapsed),
        timedOut,
      };
      s.answers.push(result);
      s.started = null;
      return NextResponse.json(result);
    }
    if (body.action === 'finish') {
      if (s.answers.length !== 4) throw new Error('4문제 도전을 마쳐 주세요.');
      if (!s.result) {
        let combo = 0,
          bestCombo = 0;
        s.answers.forEach((a) => {
          combo = a.correct ? combo + 1 : 0;
          bestCombo = Math.max(bestCombo, combo);
        });
        const totalScore = s.answers.reduce((n, a) => n + a.score, 0);
        s.result = {
          sessionId: s.id,
          regionCode: s.regionCode,
          totalScore,
          maxScore: Math.round(s.questions.reduce((n, q) => n + BASE_POINTS[q.level], 0) * 1.2),
          correctCount: s.answers.filter((a) => a.correct).length,
          bestCombo,
          contribution: Math.round(totalScore / 120),
          answers: s.answers,
          items: publicItems(s),
          backend: 'demo',
        };
      }
      return NextResponse.json(s.result);
    }
    throw new Error('알 수 없는 요청입니다.');
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '게임 요청을 처리하지 못했습니다.' },
      { status: 400 },
    );
  }
}
