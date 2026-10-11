import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { QUESTIONS as BASE_QUESTIONS } from '../functions/lib/questions.js';
import { EXTRA_QUESTIONS } from '../functions/lib/question-bank.js';
const QUESTIONS = [...BASE_QUESTIONS, ...EXTRA_QUESTIONS];
process.loadEnvFile('.env.local');
const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
assert.equal(project, 'test-e27db');
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const require = createRequire(import.meta.url);
const auth = require('C:/Users/na/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js');
const account = auth.getGlobalDefaultAccount();
assert.equal(account.user.email, 'jejuailabs@gmail.com');
const admin = await auth.getAccessToken(account.tokens.refresh_token, [
  'https://www.googleapis.com/auth/cloud-platform',
]);
const users = [];
const sessions = [];
async function guest() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const user = await response.json();
  if (!response.ok) throw Error(user.error?.message);
  users.push(user);
  return user;
}
async function call(name, data, user) {
  const response = await fetch(`https://asia-northeast3-${project}.cloudfunctions.net/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(user ? { Authorization: `Bearer ${user.idToken}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  const body = await response.json();
  return { status: response.status, ...body };
}
try {
  const user = await guest();
  const other = await guest();
  const unauthenticated = await call('localwarGetProgress', {}, null);
  assert.equal(unauthenticated.error.status, 'UNAUTHENTICATED');
  const picks = ['history', 'people', 'food', 'travel'].map((category) => ({ category, level: 1 }));
  const start = await call('localwarStartSession', { regionCode: 'chungbuk-chungju', picks }, user);
  assert.ok(start.result, JSON.stringify(start));
  const session = start.result;
  sessions.push({ id: session.sessionId, uid: user.localId });
  session.items.forEach((q) => {
    assert.equal('answerIndex' in q, false);
    assert.equal('explanation' in q, false);
  });
  const stranger = await call(
    'localwarBeginQuestion',
    { sessionId: session.sessionId, index: 0 },
    other,
  );
  assert.equal(stranger.error.status, 'NOT_FOUND');
  for (let index = 0; index < 4; index++) {
    const begin = await call(
      'localwarBeginQuestion',
      { sessionId: session.sessionId, index },
      user,
    );
    assert.ok(begin.result.deadline > Date.now());
    const q = session.items[index];
    const source = QUESTIONS.find((s) => s.id === q.id);
    const choiceIndex = q.choices.indexOf(source.choices[source.answerIndex]);
    const answer = await call(
      'localwarSubmitAnswer',
      { sessionId: session.sessionId, index, choiceIndex },
      user,
    );
    assert.equal(answer.result.correct, true);
    const repeat = await call(
      'localwarSubmitAnswer',
      { sessionId: session.sessionId, index, choiceIndex },
      user,
    );
    assert.deepEqual(repeat.result, answer.result);
  }
  const result = (await call('localwarFinishSession', { sessionId: session.sessionId }, user))
    .result;
  assert.equal(result.correctCount, 4);
  assert.equal(result.bestCombo, 4);
  assert.ok(result.totalScore >= 400 && result.totalScore <= 480);
  const repeat = (await call('localwarFinishSession', { sessionId: session.sessionId }, user))
    .result;
  assert.deepEqual(repeat, result);
  const progress = (await call('localwarGetProgress', {}, user)).result;
  assert.equal(progress.results.length, 1);
  assert.equal(progress.xp, result.totalScore);
  assert.ok(progress.badges.includes('perfect'));
  const sessionRead = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/localwarSessions/${session.sessionId}`,
    { headers: { Authorization: `Bearer ${user.idToken}` } },
  );
  assert.equal(sessionRead.status, 403);
  await call(
    'localwarSavePreferences',
    { regionCode: 'jeju-seogwipo', gender: 'unspecified', age: 'unspecified' },
    user,
  );
  const daily = (await call('localwarStartDaily', { level: 4 }, user)).result;
  assert.ok(daily);
  sessions.push({ id: daily.sessionId, uid: user.localId });
  assert.equal(daily.competitive, false);
  assert.equal(daily.items.length, 30);
  assert.ok(
    daily.items.every((q) => q.choices.length === 0 && !('factId' in q) && !('alternatives' in q)),
  );
  const first = (
    await call('localwarBeginQuestion', { sessionId: daily.sessionId, index: 0 }, user)
  ).result;
  const resume = (await call('localwarStartDaily', { level: 1 }, user)).result;
  assert.equal(resume.sessionId, daily.sessionId);
  assert.equal(
    (await call('localwarBeginQuestion', { sessionId: daily.sessionId, index: 0 }, user)).result
      .deadline,
    first.deadline,
  );
  for (let index = 0; index < 30; index++) {
    const begin = (await call('localwarBeginQuestion', { sessionId: daily.sessionId, index }, user))
      .result;
    const source = QUESTIONS.find((q) => q.id === begin.item.id);
    const choiceIndex = begin.item.choices.indexOf(source.choices[source.answerIndex]);
    const answer = (
      await call('localwarSubmitAnswer', { sessionId: daily.sessionId, index, choiceIndex }, user)
    ).result;
    assert.equal(answer.correct, true);
  }
  const dailyResult = (await call('localwarFinishSession', { sessionId: daily.sessionId }, user))
    .result;
  assert.equal(dailyResult.correctCount, 30);
  assert.equal(dailyResult.daily.accuracy, 100);
  assert.equal(dailyResult.daily.support, 0);
  assert.deepEqual(
    (await call('localwarFinishSession', { sessionId: daily.sessionId }, user)).result,
    dailyResult,
  );
  const battle = (await call('localwarBattleState', {}, user)).result;
  assert.equal(battle.eligible, false);
  assert.ok(battle.standings.every((row) => !('groups' in row)));

  console.log(
    JSON.stringify({
      liveFirebase: 'passed',
      daily: '30/30 correct, resumed, idempotent, guest practice',
      score: result.totalScore,
      correctCount: result.correctCount,
      bestCombo: result.bestCombo,
      idempotentAnswers: true,
      idempotentFinish: true,
      privateSessionRead: 'denied',
      crossUserSession: 'denied',
    }),
  );
} finally {
  for (const s of sessions) {
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/localwarSessions/${s.id}`;
    const owned = await (
      await fetch(url, { headers: { Authorization: `Bearer ${admin.access_token}` } })
    ).json();
    if (owned.fields?.uid?.stringValue === s.uid)
      await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin.access_token}` },
      });
  }
  for (const user of users) {
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/localwarProfiles/${user.localId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${admin.access_token}` } },
    );
    await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: user.idToken }),
    });
  }
  console.log(JSON.stringify({ testAccountsAndSessions: 'cleaned' }));
}
