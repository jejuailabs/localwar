import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { REGION_CODES } from './shared/regions.js';
import { QUESTIONS } from './questions.js';
import {
  TIME_LIMIT,
  validatePicks,
  type Question,
  type AnswerResult,
  type Pick,
  type SessionResult,
} from './shared/game.js';
import { EMPTY_PROGRESS, applyResult, discover, type Progress } from './shared/progress.js';
import { shuffle, publicItems, grade, summarize } from './engine.js';
initializeApp();
const db = getFirestore();
const options = {
  region: 'asia-northeast3',
  maxInstances: 3,
  minInstances: 0,
  memory: '256MiB' as const,
  timeoutSeconds: 30,
};
type Session = {
  uid: string;
  regionCode: string;
  questions: Question[];
  answers: AnswerResult[];
  choices: (number | null)[];
  started: number | null;
  created: number;
  cancelled: boolean;
  result: SessionResult | null;
  expiresAt: Timestamp;
};
function uid(request: CallableRequest) {
  if (!request.auth)
    throw new HttpsError('unauthenticated', '원정을 시작하려면 게임 연결이 필요합니다.');
  return request.auth.uid;
}
function getSession(data: FirebaseFirestore.DocumentData | undefined, userId: string): Session {
  if (!data || data.uid !== userId) throw new HttpsError('not-found', '원정을 찾을 수 없습니다.');
  const s = data as Session;
  if (s.cancelled || Date.now() - s.created > 600000)
    throw new HttpsError('failed-precondition', '원정이 만료되었습니다. 다시 시작해 주세요.');
  return s;
}
function indexValue(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 3)
    throw new HttpsError('invalid-argument', '문제 순서를 확인해 주세요.');
  return value as number;
}
function idValue(value: unknown) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{10,100}$/.test(value))
    throw new HttpsError('invalid-argument', '유효하지 않은 원정입니다.');
  return value;
}
export const localwarStartSession = onCall(options, async (request) => {
  const userId = uid(request);
  const { regionCode, picks } = request.data || {};
  try {
    if (!Array.isArray(picks)) throw Error();
    validatePicks(picks as Pick[]);
  } catch {
    throw new HttpsError('invalid-argument', '서로 다른 4칸을 골라 주세요.');
  }
  const questions = (picks as Pick[]).map((p) =>
    QUESTIONS.find(
      (q) => q.regionCode === regionCode && q.category === p.category && q.level === p.level,
    ),
  );
  if (questions.some((q) => !q))
    throw new HttpsError('failed-precondition', '이 지역의 문항은 준비 중입니다.');
  const ref = db.collection('localwarSessions').doc();
  const profileRef = db.collection('localwarProfiles').doc(userId);
  const session: Session = {
    uid: userId,
    regionCode,
    questions: questions.map((q) => shuffle(q!)),
    answers: [],
    choices: [],
    started: null,
    created: Date.now(),
    cancelled: false,
    result: null,
    expiresAt: Timestamp.fromMillis(Date.now() + 86400000),
  };
  await db.runTransaction(async (tx) => {
    const profile = await tx.get(profileRef);
    const previous = profile.data()?.activeSession;
    const old = previous ? await tx.get(db.collection('localwarSessions').doc(previous)) : null;
    const lastCreated = profile.data()?.lastCreated || 0;
    if (Date.now() - lastCreated < 1500)
      throw new HttpsError('resource-exhausted', '잠시 후 다시 원정을 시작해 주세요.');
    if (old?.exists && !old.data()?.result) tx.update(old.ref, { cancelled: true });
    tx.create(ref, session);
    tx.set(
      profileRef,
      {
        activeSession: ref.id,
        lastCreated: Date.now(),
        progress: discover(profile.data()?.progress || structuredClone(EMPTY_PROGRESS), regionCode),
      },
      { merge: true },
    );
  });
  return { sessionId: ref.id, regionCode, items: publicItems(session.questions) };
});
export const localwarBeginQuestion = onCall(options, async (request) => {
  const userId = uid(request);
  const index = indexValue(request.data?.index);
  const ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId));
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (s.answers.length !== index)
      throw new HttpsError('failed-precondition', '문제 순서를 확인해 주세요.');
    const started = s.started ?? Date.now();
    if (s.started === null) tx.update(ref, { started });
    return { deadline: started + TIME_LIMIT * 1000 };
  });
});
export const localwarSubmitAnswer = onCall(options, async (request) => {
  const userId = uid(request);
  const index = indexValue(request.data?.index);
  const choice = request.data?.choiceIndex;
  if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3))
    throw new HttpsError('invalid-argument', '유효하지 않은 보기입니다.');
  const ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId));
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (index < s.answers.length) {
      if (s.choices[index] === choice) return s.answers[index];
      throw new HttpsError('already-exists', '이미 답을 제출했습니다.');
    }
    if (index !== s.answers.length || s.started === null)
      throw new HttpsError('failed-precondition', '시작되지 않은 문제입니다.');
    const answer = grade(s.questions[index], choice, s.started, Date.now());
    tx.update(ref, {
      answers: [...s.answers, answer],
      choices: [...s.choices, choice],
      started: null,
    });
    return answer;
  });
});
export const localwarFinishSession = onCall(options, async (request) => {
  const userId = uid(request);
  const ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId));
  const profileRef = db.collection('localwarProfiles').doc(userId);
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (s.result) return s.result;
    if (s.answers.length !== 4)
      throw new HttpsError('failed-precondition', '4문제 도전을 마쳐 주세요.');
    const profile = await tx.get(profileRef);
    const result = summarize(ref.id, s.regionCode, s.questions, s.answers);
    const progress = applyResult(
      profile.data()?.progress || structuredClone(EMPTY_PROGRESS),
      result,
    );
    tx.update(ref, { result });
    tx.set(
      profileRef,
      { progress, activeSession: null, updatedAt: Timestamp.now() },
      { merge: true },
    );
    return result;
  });
});
export const localwarDiscoverRegion = onCall(options, async (request) => {
  const userId = uid(request);
  const code = request.data?.regionCode;
  if (typeof code !== 'string' || code.length > 100 || !REGION_CODES.includes(code))
    throw new HttpsError('invalid-argument', '유효하지 않은 지역입니다.');
  const ref = db.collection('localwarProfiles').doc(userId);
  return db.runTransaction(async (tx) => {
    const profile = await tx.get(ref);
    const progress = discover(profile.data()?.progress || structuredClone(EMPTY_PROGRESS), code);
    tx.set(ref, { progress }, { merge: true });
    return progress;
  });
});
export const localwarGetProgress = onCall(options, async (request) => {
  const userId = uid(request);
  const profile = await db.collection('localwarProfiles').doc(userId).get();
  return (profile.data()?.progress || structuredClone(EMPTY_PROGRESS)) as Progress;
});
