import { randomInt } from 'node:crypto';
import {
  BASE_POINTS,
  TIME_LIMIT,
  itemScore,
  timeFactor,
  type Question,
  type AnswerResult,
  type SessionResult,
} from './shared/game.js';
export function shuffle(q: Question): Question {
  const answer = q.choices[q.answerIndex];
  const wrong = [
    ...new Set([...q.choices.filter((_, i) => i !== q.answerIndex), ...(q.alternatives || [])]),
  ].filter((c) => c !== answer);
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  q = { ...q, choices: [answer, ...wrong.slice(0, 3)], answerIndex: 0 };
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
export function publicItems(questions: Question[]) {
  return questions.map(({ answerIndex, explanation, source, alternatives, factId, ...q }) => ({
    ...q,
    timeLimitSec: TIME_LIMIT,
  }));
}
export function grade(
  q: Question,
  choiceIndex: number | null,
  started: number,
  now: number,
): AnswerResult {
  const elapsed = Math.max(0, (now - started) / 1000);
  const timedOut = elapsed >= TIME_LIMIT;
  const correct = !timedOut && choiceIndex === q.answerIndex;
  return {
    elapsedSec: Math.min(30, elapsed),
    correct,
    answerIndex: q.answerIndex,
    explanation: q.explanation,
    source: q.source,
    score: itemScore(q.level, correct, elapsed),
    timeFactor: timeFactor(elapsed),
    timedOut,
  };
}
export function summarize(
  sessionId: string,
  regionCode: string,
  questions: Question[],
  answers: AnswerResult[],
): SessionResult {
  let combo = 0,
    bestCombo = 0;
  answers.forEach((a) => {
    combo = a.correct ? combo + 1 : 0;
    bestCombo = Math.max(bestCombo, combo);
  });
  const totalScore = answers.reduce((n, a) => n + a.score, 0);
  return {
    sessionId,
    regionCode,
    totalScore,
    maxScore: Math.round(questions.reduce((n, q) => n + BASE_POINTS[q.level], 0) * 1.2),
    correctCount: answers.filter((a) => a.correct).length,
    bestCombo,
    contribution: Math.round(totalScore / 120),
    answers,
    items: publicItems(questions),
    backend: 'firebase',
  };
}
