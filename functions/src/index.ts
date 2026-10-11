import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { REGION_CODES } from './shared/regions.js';
import { QUESTIONS } from './questions.js';
import { EXTRA_QUESTIONS } from './question-bank.js';
import {
  TIME_LIMIT,
  validatePicks,
  LEVELS,
  type Question,
  type AnswerResult,
  type Pick,
  type SessionResult,
  type GameSession,
  type Level,
} from './shared/game.js';
import { EMPTY_PROGRESS, applyResult, discover, type Progress } from './shared/progress.js';
import { shuffle, publicItems, grade, summarize } from './engine.js';
import {
  koreaDay,
  nextReset,
  validPreferences,
  selectRegional,
  selectDaily,
  factKey,
  regionalPower,
  dailyMetrics,
  addSupport,
  standing,
  EMPTY_AGGREGATE,
  type Preferences,
  type Aggregate,
  type BattleState,
} from './shared/conquest.js';
if (!getApps().length) initializeApp();
const db = getFirestore();
const bank = [...QUESTIONS, ...EXTRA_QUESTIONS];
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
  mode?: 'regional' | 'daily';
  day?: string;
  competitive?: boolean;
  preferences?: Preferences | null;
  level?: Level;
};
function uid(r: CallableRequest) {
  if (!r.auth) throw new HttpsError('unauthenticated', '게임 연결이 필요합니다.');
  return r.auth.uid;
}
function eligible(r: CallableRequest) {
  return r.auth?.token.firebase?.sign_in_provider !== 'anonymous';
}
function preferences(p: FirebaseFirestore.DocumentData) {
  return p.pending && p.pendingDay <= koreaDay()
    ? (p.pending as Preferences)
    : (p.preferences as Preferences) || null;
}
function dailyState(p: FirebaseFirestore.DocumentData) {
  return p.battle?.day === koreaDay()
    ? p.battle
    : { day: koreaDay(), attackUsed: 0, dailySession: null, dailyDone: false };
}
function getSession(data: FirebaseFirestore.DocumentData | undefined, userId: string): Session {
  if (!data || data.uid !== userId) throw new HttpsError('not-found', '원정을 찾을 수 없습니다.');
  const s = data as Session;
  if (s.cancelled || Date.now() - s.created > (s.mode === 'daily' ? 86400000 : 600000))
    throw new HttpsError('failed-precondition', '원정이 만료되었습니다. 다시 시작해 주세요.');
  return s;
}
function indexValue(v: unknown) {
  if (!Number.isInteger(v) || Number(v) < 0 || Number(v) > 29)
    throw new HttpsError('invalid-argument', '문제 순서를 확인해 주세요.');
  return v as number;
}
function idValue(v: unknown) {
  if (typeof v !== 'string' || !/^[a-zA-Z0-9_-]{10,100}$/.test(v))
    throw new HttpsError('invalid-argument', '유효하지 않은 원정입니다.');
  return v;
}
function response(id: string, s: Session): GameSession {
  const items = publicItems(s.questions);
  return {
    sessionId: id,
    regionCode: s.regionCode,
    items:
      s.mode === 'daily'
        ? items.map((q, i) =>
            i < s.answers.length
              ? q
              : { ...q, prompt: '다음 문제를 준비하고 있어요.', choices: [] },
          )
        : items,
    mode: s.mode || 'regional',
    competitive: !!s.competitive,
    day: s.day,
    answers: s.answers,
    ...(s.result ? { completed: s.result } : {}),
  };
}
async function start(request: CallableRequest, mode: 'regional' | 'daily') {
  const userId = uid(request),
    input = request.data || {},
    day = koreaDay();
  if (mode === 'regional') {
    try {
      validatePicks(input.picks);
    } catch {
      throw new HttpsError('invalid-argument', '서로 다른 4칸을 골라 주세요.');
    }
  } else if (
    !LEVELS.includes(input.level) ||
    (input.practice !== undefined && typeof input.practice !== 'boolean')
  )
    throw new HttpsError('invalid-argument', '난이도를 골라 주세요.');
  const practice = mode === 'daily' && (input.practice === true || !eligible(request));
  const ref = db.collection('localwarSessions').doc(),
    profileRef = db.collection('localwarProfiles').doc(userId);
  return db.runTransaction(async (tx) => {
    const p = (await tx.get(profileRef)).data() || {},
      b = dailyState(p),
      prefs = preferences(p);
    const existing =
      mode === 'daily' && b[practice ? 'practiceSession' : 'dailySession']
        ? await tx.get(
            db.collection('localwarSessions').doc(b[practice ? 'practiceSession' : 'dailySession']),
          )
        : null;
    if (existing?.exists && (!input.practice || !existing.data()?.result))
      return response(existing.id, getSession(existing.data(), userId));
    const previous =
      mode === 'regional' && p.activeSession
        ? await tx.get(db.collection('localwarSessions').doc(p.activeSession))
        : null;
    if (Date.now() - (p.lastCreated || 0) < 1500)
      throw new HttpsError('resource-exhausted', '잠시 후 시작해 주세요.');
    const competitive =
      eligible(request) && (mode === 'regional' ? b.attackUsed < 3 : !practice && !b.dailyDone);
    if (mode === 'daily' && competitive && !prefs)
      throw new HttpsError('failed-precondition', '먼저 지원 지역을 등록해 주세요.');
    const seen = (p.seen || [])
      .filter((v: { day: string }) => v.day >= koreaDay(Date.now() - 7 * 86400000))
      .map((v: { fact: string }) => v.fact);
    let qs: Question[];
    try {
      qs =
        mode === 'regional'
          ? selectRegional(bank, input.regionCode, input.picks as Pick[], day, userId, seen)
          : selectDaily(bank, input.level, day, userId, seen);
    } catch (e) {
      throw new HttpsError('failed-precondition', (e as Error).message);
    }
    const s: Session = {
      uid: userId,
      regionCode: mode === 'regional' ? input.regionCode : prefs?.regionCode || 'jeju-seogwipo',
      questions: qs.map(shuffle),
      answers: [],
      choices: [],
      started: null,
      created: Date.now(),
      cancelled: false,
      result: null,
      expiresAt: Timestamp.fromMillis(Date.now() + 86400000),
      mode,
      day,
      competitive,
      preferences: prefs,
      level: mode === 'daily' ? input.level : 1,
    };
    if (previous?.exists && !previous.data()?.result) tx.update(previous.ref, { cancelled: true });
    if (mode === 'regional' && competitive) b.attackUsed++;
    if (mode === 'daily') {
      b[practice ? 'practiceSession' : 'dailySession'] = ref.id;
      if (practice) b.practiceDone = false;
    }
    tx.create(ref, s);
    tx.set(
      profileRef,
      {
        battle: b,
        lastCreated: Date.now(),
        ...(mode === 'regional'
          ? {
              activeSession: ref.id,
              progress: discover(p.progress || structuredClone(EMPTY_PROGRESS), s.regionCode),
            }
          : {}),
      },
      { merge: true },
    );
    return response(ref.id, s);
  });
}
export const localwarStartSession = onCall(options, (r) => start(r, 'regional'));
export const localwarStartDaily = onCall(options, (r) => start(r, 'daily'));
export const localwarBeginQuestion = onCall(options, async (request) => {
  const userId = uid(request),
    index = indexValue(request.data?.index),
    ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId));
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (s.answers.length !== index || !s.questions[index])
      throw new HttpsError('failed-precondition', '문제 순서를 확인해 주세요.');
    const started = s.started ?? Date.now();
    if (s.started === null) tx.update(ref, { started });
    return { deadline: started + TIME_LIMIT * 1000, item: publicItems([s.questions[index]])[0] };
  });
});
export const localwarSubmitAnswer = onCall(options, async (request) => {
  const userId = uid(request),
    index = indexValue(request.data?.index),
    choice = request.data?.choiceIndex;
  if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3))
    throw new HttpsError('invalid-argument', '유효하지 않은 보기입니다.');
  const ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId));
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (index < s.answers.length) {
      if (s.choices[index] === choice) return s.answers[index];
      throw new HttpsError('already-exists', '이미 답을 제출했습니다.');
    }
    if (index !== s.answers.length || s.started === null || !s.questions[index])
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
  const userId = uid(request),
    ref = db.collection('localwarSessions').doc(idValue(request.data?.sessionId)),
    profileRef = db.collection('localwarProfiles').doc(userId);
  return db.runTransaction(async (tx) => {
    const s = getSession((await tx.get(ref)).data(), userId);
    if (s.result) return s.result;
    if (s.answers.length !== s.questions.length)
      throw new HttpsError('failed-precondition', '모든 문제 도전을 마쳐 주세요.');
    const p = (await tx.get(profileRef)).data() || {},
      day = s.day || koreaDay(),
      competitive = !!s.competitive && day === koreaDay();
    const aggregateRef = db
      .collection('localwarDays')
      .doc(day)
      .collection('regions')
      .doc(s.regionCode);
    const a = competitive
      ? ((await tx.get(aggregateRef)).data() as Aggregate) || structuredClone(EMPTY_AGGREGATE)
      : null;
    const result: SessionResult = {
      ...summarize(ref.id, s.regionCode, s.questions, s.answers),
      mode: s.mode || 'regional',
      day,
      competitive,
    };
    if (s.mode === 'daily') {
      result.daily = dailyMetrics(s.answers, s.level!);
      result.contribution = 0;
      if (!competitive) result.daily.support = 0;
    }
    if (a) {
      const aggregate =
        s.mode === 'daily'
          ? addSupport(a, s.preferences!, result.daily!.support)
          : {
              ...a,
              warRuns: a.warRuns + 1,
              warTotal: a.warTotal + regionalPower(result.totalScore),
            };
      tx.set(aggregateRef, aggregate);
    }
    const b = dailyState(p);
    if (s.mode === 'daily' && b.dailySession === ref.id) b.dailyDone = true;
    if (s.mode === 'daily' && b.practiceSession === ref.id) b.practiceDone = true;
    const seen = [...(p.seen || []), ...s.questions.map((q) => ({ day, fact: factKey(q) }))]
      .filter((v) => v.day >= koreaDay(Date.now() - 7 * 86400000))
      .slice(-250);
    tx.update(ref, { result });
    tx.set(
      profileRef,
      {
        progress: applyResult(p.progress || structuredClone(EMPTY_PROGRESS), result),
        battle: b,
        seen,
        ...(s.mode === 'daily' ? {} : { activeSession: null }),
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
    return result;
  });
});
export const localwarSavePreferences = onCall(options, async (request) => {
  const userId = uid(request);
  let pref: Preferences;
  try {
    pref = validPreferences(request.data, REGION_CODES);
  } catch (e) {
    throw new HttpsError('invalid-argument', (e as Error).message);
  }
  const ref = db.collection('localwarProfiles').doc(userId);
  await db.runTransaction(async (tx) => {
    const p = (await tx.get(ref)).data() || {},
      current = preferences(p);
    if (!current)
      tx.set(ref, { preferences: pref, pending: null, pendingDay: null }, { merge: true });
    else
      tx.set(
        ref,
        { preferences: current, pending: pref, pendingDay: koreaDay(nextReset()) },
        { merge: true },
      );
  });
  return { saved: true };
});
export const localwarBattleState = onCall(options, async (request) => {
  const userId = uid(request),
    day = koreaDay(),
    p = (await db.collection('localwarProfiles').doc(userId).get()).data() || {},
    b = dailyState(p);
  async function rows(d: string) {
    const docs = await db.collection('localwarDays').doc(d).collection('regions').get();
    return docs.docs
      .map((doc) => standing(doc.id, doc.data() as Aggregate))
      .sort((a, b) => b.total - a.total || a.regionCode.localeCompare(b.regionCode));
  }
  const [standings, yesterday] = await Promise.all([
    rows(day),
    rows(koreaDay(Date.now() - 86400000)),
  ]);
  return {
    day,
    eligible: eligible(request),
    attackUsed: b.attackUsed,
    preferences: preferences(p),
    pending: p.pendingDay > day ? p.pending : null,
    dailySession: eligible(request) ? b.dailySession : b.practiceSession || null,
    dailyDone: eligible(request) ? b.dailyDone : !!b.practiceDone,
    practiceSession: b.practiceSession || null,
    standings,
    yesterday,
    nextReset: nextReset(),
  } satisfies BattleState;
});
export const localwarDiscoverRegion = onCall(options, async (request) => {
  const userId = uid(request),
    code = request.data?.regionCode;
  if (typeof code !== 'string' || !REGION_CODES.includes(code))
    throw new HttpsError('invalid-argument', '유효하지 않은 지역입니다.');
  const ref = db.collection('localwarProfiles').doc(userId);
  return db.runTransaction(async (tx) => {
    const p = await tx.get(ref);
    const progress = discover(p.data()?.progress || structuredClone(EMPTY_PROGRESS), code);
    tx.set(ref, { progress }, { merge: true });
    return progress;
  });
});
export const localwarGetProgress = onCall(options, async (request) => {
  const p = await db.collection('localwarProfiles').doc(uid(request)).get();
  return (p.data()?.progress || structuredClone(EMPTY_PROGRESS)) as Progress;
});
