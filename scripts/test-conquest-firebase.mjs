import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const cli = require('C:/Users/na/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js');
const account = cli.getGlobalDefaultAccount();
assert.equal(account.user.email, 'jejuailabs@gmail.com');
const token = await cli.getAccessToken(account.tokens.refresh_token, [
  'https://www.googleapis.com/auth/cloud-platform',
]);
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({
  projectId: 'test-e27db',
  credential: {
    getAccessToken: async () => ({ access_token: token.access_token, expires_in: 3600 }),
  },
});
const { Firestore } = require('@google-cloud/firestore');
const { GoogleAuth, OAuth2Client } = require('google-auth-library');
const oauth = new OAuth2Client();
oauth.setCredentials({ access_token: token.access_token });
const db = new Firestore({
  projectId: 'test-e27db',
  preferRest: true,
  auth: new GoogleAuth({ projectId: 'test-e27db', authClient: oauth }),
});
require('firebase-admin/firestore').getFirestore = () => db;
const testIndex = new URL('../functions/lib/index-test.js', import.meta.url);
const testClock = new URL('../functions/lib/shared/conquest-test.js', import.meta.url);
fs.writeFileSync(
  testClock,
  fs
    .readFileSync(new URL('../functions/lib/shared/conquest.js', import.meta.url), 'utf8')
    .replaceAll('Date.now()', 'globalThis.__localwarTestNow()'),
);
fs.writeFileSync(
  testIndex,
  fs
    .readFileSync(new URL('../functions/lib/index.js', import.meta.url), 'utf8')
    .replaceAll('Date.now()', 'globalThis.__localwarTestNow()')
    .replaceAll('./shared/conquest.js', './shared/conquest-test.js'),
);
const functions = await import(testIndex.href);
const originalNow = Date.now;
let now = Date.parse('2099-10-11T01:00:00Z');
const day = '2099-10-11';
const userId = `daily_test_${randomUUID().replaceAll('-', '')}`;
const profileRef = db.collection('localwarProfiles').doc(userId);
const refs = [];
const regionRef = db.collection('localwarDays').doc(day).collection('regions').doc('jeju-seogwipo');
console.log(JSON.stringify({ testStage: 'checking isolated future day' }));
assert.equal((await regionRef.get()).exists, false, 'Future test aggregate must be unused');
const call = (name, data = {}, provider = 'google.com') =>
  functions[name].run({
    data,
    auth: { uid: userId, token: { firebase: { sign_in_provider: provider } } },
  });
try {
  globalThis.__localwarTestNow = () => now;
  console.log(JSON.stringify({ testStage: 'running server transactions' }));
  await call('localwarSavePreferences', {
    regionCode: 'jeju-seogwipo',
    gender: 'female',
    age: '30s',
  });
  const picks = ['history', 'people', 'food', 'travel'].map((category) => ({ category, level: 1 }));
  const canonical = [
    ...(await import('../functions/lib/questions.js')).QUESTIONS,
    ...(await import('../functions/lib/question-bank.js')).EXTRA_QUESTIONS,
  ];
  for (let i = 0; i < 4; i++) {
    now += 2000;
    const s = await call('localwarStartSession', { regionCode: 'jeju-seogwipo', picks });
    refs.push(s.sessionId);
    assert.equal(s.competitive, i < 3);
    if (i === 0) {
      for (let index = 0; index < 4; index++) {
        const begin = await call('localwarBeginQuestion', { sessionId: s.sessionId, index });
        const q = canonical.find((q) => q.id === begin.item.id);
        const choiceIndex = begin.item.choices.indexOf(q.choices[q.answerIndex]);
        now += 100;
        await call('localwarSubmitAnswer', { sessionId: s.sessionId, index, choiceIndex });
      }
      const war = await call('localwarFinishSession', { sessionId: s.sessionId });
      assert.equal(war.competitive, true);
      assert.equal(war.correctCount, 4);
      assert.deepEqual(await call('localwarFinishSession', { sessionId: s.sessionId }), war);
      assert.equal((await regionRef.get()).data().warRuns, 1);
    }
  }
  assert.equal((await call('localwarBattleState')).attackUsed, 3);
  now += 2000;
  const guestRun = await call('localwarStartDaily', { level: 1 }, 'anonymous');
  refs.push(guestRun.sessionId);
  assert.equal(guestRun.competitive, false);
  for (let index = 0; index < 30; index++) {
    const begin = await call(
      'localwarBeginQuestion',
      { sessionId: guestRun.sessionId, index },
      'anonymous',
    );
    const q = canonical.find((q) => q.id === begin.item.id);
    const choiceIndex = begin.item.choices.indexOf(q.choices[q.answerIndex]);
    now += 100;
    await call(
      'localwarSubmitAnswer',
      { sessionId: guestRun.sessionId, index, choiceIndex },
      'anonymous',
    );
  }
  const trial = await call('localwarFinishSession', { sessionId: guestRun.sessionId }, 'anonymous');
  assert.equal(trial.daily.support, 0);
  assert.equal((await call('localwarBattleState', {}, 'anonymous')).dailyDone, true);
  assert.equal((await call('localwarBattleState')).dailyDone, false);
  now += 2000;
  const s = await call('localwarStartDaily', { level: 4 });
  refs.push(s.sessionId);
  assert.equal(s.competitive, true);
  assert.equal(s.items.length, 30);
  assert.ok(s.items.every((q) => !q.choices.length));
  const first = await call('localwarBeginQuestion', { sessionId: s.sessionId, index: 0 });
  now += 1000;
  const resumed = await call('localwarStartDaily', { level: 1 });
  assert.equal(resumed.sessionId, s.sessionId);
  assert.equal(
    (await call('localwarBeginQuestion', { sessionId: s.sessionId, index: 0 })).deadline,
    first.deadline,
  );
  for (let index = 0; index < 30; index++) {
    const begin = await call('localwarBeginQuestion', { sessionId: s.sessionId, index });
    const source = canonical.find((q) => q.id === begin.item.id);
    const choiceIndex = begin.item.choices.indexOf(source.choices[source.answerIndex]);
    now += 100;
    const a = await call('localwarSubmitAnswer', { sessionId: s.sessionId, index, choiceIndex });
    assert.equal(a.correct, true);
  }
  const r = await call('localwarFinishSession', { sessionId: s.sessionId });
  assert.equal(r.correctCount, 30);
  assert.equal(r.competitive, true);
  assert.ok(r.daily.support > 95);
  assert.deepEqual(await call('localwarFinishSession', { sessionId: s.sessionId }), r);
  const state = await call('localwarBattleState');
  assert.equal(state.dailyDone, true);
  assert.equal(state.standings[0].participants, 1);
  assert.equal('groups' in state.standings[0], false);
  await call('localwarSavePreferences', { regionCode: 'seoul-jongno', gender: 'male', age: '40s' });
  const pending = await call('localwarBattleState');
  assert.equal(pending.preferences.regionCode, 'jeju-seogwipo');
  assert.equal(pending.pending.regionCode, 'seoul-jongno');
  now += 2000;
  const practice = await call('localwarStartDaily', { level: 1, practice: true });
  refs.push(practice.sessionId);
  assert.equal(practice.competitive, false);
  assert.equal(
    (await call('localwarStartDaily', { level: 1, practice: true })).sessionId,
    practice.sessionId,
  );
  assert.equal((await regionRef.get()).data().dailyCount, 1);
  now += 86400000;
  const tomorrow = await call('localwarBattleState');
  assert.equal(tomorrow.attackUsed, 0);
  assert.equal(tomorrow.preferences.regionCode, 'seoul-jongno');
  assert.equal(tomorrow.dailySession, null);
  assert.equal(tomorrow.yesterday[0].participants, 1);
  console.log(
    JSON.stringify({
      firebaseTransactions: 'passed',
      dailyQuestions: 30,
      resumeDeadline: 'preserved',
      support: 'once',
      guestUpgrade: 'practice does not consume ranked entry',
      preferences: 'next-day',
      attackLimit: 3,
      rollover: 'passed',
      demographicDetails: 'private',
      testDay: day,
    }),
  );
} finally {
  delete globalThis.__localwarTestNow;
  for (const id of refs) {
    const ref = db.collection('localwarSessions').doc(id);
    const s = await ref.get();
    if (s.data()?.uid === userId) await ref.delete();
  }
  const remaining = await db.collection('localwarSessions').where('uid', '==', userId).get();
  for (const doc of remaining.docs) await doc.ref.delete();
  await profileRef.delete();
  await regionRef.delete();
  fs.rmSync(testIndex);
  fs.rmSync(testClock);
  console.log(JSON.stringify({ futureTestData: 'cleaned' }));
}
