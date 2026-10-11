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
  let checked = 0;
  for (const code of ['gyeongbuk-gyeongju', 'jeonbuk-jeonju', 'gangwon-gangneung']) {
    for (const level of [1, 2, 3, 4]) {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      const picks = ['history', 'people', 'food', 'travel'].map((category) => ({
        category,
        level,
      }));
      const started = await call('localwarStartSession', { regionCode: code, picks }, user);
      assert.ok(started.result, JSON.stringify(started));
      const session = started.result;
      sessions.push({ id: session.sessionId, uid: user.localId });
      assert.equal(session.regionCode, code);
      assert.equal(session.items.length, 4);
      for (let index = 0; index < 4; index++) {
        const item = session.items[index];
        assert.equal('answerIndex' in item, false);
        assert.equal('explanation' in item, false);
        const source = QUESTIONS.find((q) => q.id === item.id);
        assert.ok(source);
        const timing = (
          await call('localwarBeginQuestion', { sessionId: session.sessionId, index }, user)
        ).result;
        assert.ok(timing.item.choices.includes(source.choices[source.answerIndex]));
        const choiceIndex = timing.item.choices.indexOf(source.choices[source.answerIndex]);
        const answer = (
          await call(
            'localwarSubmitAnswer',
            { sessionId: session.sessionId, index, choiceIndex },
            user,
          )
        ).result;
        assert.equal(answer.correct, true);
        checked++;
      }
      const finished = (await call('localwarFinishSession', { sessionId: session.sessionId }, user))
        .result;
      assert.equal(finished.correctCount, 4);
      assert.equal(finished.competitive, false);
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const started = await call('localwarStartDaily', { level: 4, practice: true }, user);
  assert.ok(started.result);
  const daily = started.result;
  sessions.push({ id: daily.sessionId, uid: user.localId });
  assert.equal(daily.items.length, 30);
  assert.equal(new Set(daily.items.map((item) => item.regionCode)).size, 6);
  assert.ok(daily.items.every((item) => item.choices.length === 0));
  console.log(
    JSON.stringify({
      liveFirebase: 'passed',
      newRegions: 3,
      cellsAnsweredCorrectly: checked,
      dailyRegions: 6,
      dailyCount: 30,
      guestPracticeOnly: true,
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
