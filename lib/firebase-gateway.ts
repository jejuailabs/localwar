import { initializeApp, getApps, FirebaseError } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  linkWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, doc, onSnapshot, connectFirestoreEmulator } from 'firebase/firestore';
import type { TimedGateway } from './gateway';
import type { GameSession, AnswerResult, SessionResult } from '@/packages/shared/game';
import { EMPTY_PROGRESS, type Progress } from './progress';
let connected = false;
function clients() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  };
  if (!config.apiKey || !config.projectId || !config.authDomain || !config.appId)
    throw Error('Firebase 웹 설정을 먼저 입력해 주세요.');
  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  const functions = getFunctions(
    app,
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION?.trim() || 'asia-northeast3',
  );
  const db = getFirestore(app);
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' && !connected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connected = true;
  }
  return { auth, functions, db };
}
let guestSignIn: Promise<unknown> | undefined;
async function ensurePlayer() {
  const { auth } = clients();
  await auth.authStateReady();
  if (!auth.currentUser) {
    guestSignIn ??= signInAnonymously(auth).finally(() => {
      guestSignIn = undefined;
    });
    await guestSignIn;
  }
  return auth.currentUser!;
}
export async function loginWithGoogle() {
  const { auth } = clients();
  const provider = new GoogleAuthProvider();
  let user;
  try {
    const result = auth.currentUser?.isAnonymous
      ? await linkWithPopup(auth.currentUser, provider)
      : await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/credential-already-in-use') {
      const credential = GoogleAuthProvider.credentialFromError(error);
      if (!credential) throw error;
      user = (await signInWithCredential(auth, credential)).user;
    } else throw error;
  }
  return { name: user.displayName || '탐험가' };
}
export async function logoutPlayer() {
  await signOut(clients().auth);
}
export async function createFirebaseGateway(): Promise<TimedGateway> {
  const { functions } = clients();
  async function call<T>(name: string, input: object): Promise<T> {
    await ensurePlayer();
    return (await httpsCallable<object, T>(functions, name)(input)).data;
  }
  return {
    mode: 'firebase',
    battleState: () => call('localwarBattleState', {}),
    savePreferences: (preferences) => call('localwarSavePreferences', preferences),
    startDaily: (level, practice = false) => call('localwarStartDaily', { level, practice }),
    startSession: (regionCode, picks) =>
      call<GameSession>('localwarStartSession', { regionCode, picks }),
    beginQuestion: (sessionId, index) => call('localwarBeginQuestion', { sessionId, index }),
    submitAnswer: (sessionId, index, choiceIndex) =>
      call<AnswerResult>('localwarSubmitAnswer', { sessionId, index, choiceIndex }),
    finishSession: (sessionId) => call<SessionResult>('localwarFinishSession', { sessionId }),
    discoverRegion: (regionCode) => call<Progress>('localwarDiscoverRegion', { regionCode }),
    loadProgress: () => call<Progress>('localwarGetProgress', {}),
  };
}
export function watchFirebasePlayer(
  onPlayer: (p: { name: string; anonymous: boolean }) => void,
  onProgress: (p: Progress) => void,
  onError: (message: string) => void,
) {
  const { auth, db } = clients();
  let offProfile: (() => void) | undefined;
  const offAuth = onAuthStateChanged(auth, (user) => {
    offProfile?.();
    if (!user) {
      void ensurePlayer().catch((e) => onError(e.message));
      return;
    }
    onPlayer({
      name: user.isAnonymous ? '게스트 탐험가' : user.displayName || '탐험가',
      anonymous: user.isAnonymous,
    });
    offProfile = onSnapshot(
      doc(db, 'localwarProfiles', user.uid),
      (snapshot) => onProgress(snapshot.data()?.progress || structuredClone(EMPTY_PROGRESS)),
      (e) => onError(e.message),
    );
  });
  return () => {
    offAuth();
    offProfile?.();
  };
}
