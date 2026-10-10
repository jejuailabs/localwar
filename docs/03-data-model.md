# 03. 데이터 모델 및 보안 규칙

## 1. 컬렉션 개요

| 컬렉션 | 용도 | 클라이언트 읽기 | 클라이언트 쓰기 |
|---|---|---|---|
| `users/{uid}` | 프로필·설정·누적 기록 | 본인 | 본인(허용 필드만) |
| `users/{uid}/private/meta` | 제재 정보, 내부 메모 | ✕ | ✕ |
| `regions/{code}` | 행정구역 메타 | 전체 | ✕ |
| `questions/{id}` | 문제은행 (정답 포함) | ✕ (Function 경유) | ✕ |
| `sessions/{id}` | 플레이 세션 | 본인 | ✕ |
| `seasons/{id}` | 주간 시즌 | 전체 | ✕ |
| `territories/{seasonId_regionCode}` | 지역별 점령 집계 | 전체 | ✕ |
| `leaderboards/{seasonId_scope}` | 랭킹 스냅샷 | 전체 | ✕ |
| `reports/{id}` | 문항 오류·사용자 신고 | 본인 작성분 | 생성만 |
| `auditLogs/{id}` | 관리자 행위 기록 | ✕ | ✕ |
| `config/app` | 공지, 점검모드, 게임 파라미터 | 전체(공개 필드) | ✕ |

쓰기 ✕ 항목은 모두 **Cloud Functions(Admin SDK)** 만 기록합니다.

## 2. 스키마 (TypeScript 표기)

```ts
// users/{uid}
interface User {
  displayName: string;
  photoURL?: string;
  email: string;                 // 어드민 화면 외 노출 금지
  locale: 'ko' | 'en' | 'ja' | 'zh-CN';
  theme: 'system' | 'light' | 'dark';
  homeRegion?: string;           // 소속 지역 코드 (규칙 확정 필요)
  homeRegionChangedAt?: Timestamp;
  profile?: {                    // 모두 선택 입력
    gender?: 'female' | 'male' | 'none';
    ageBand?: '10s' | '20s' | '30s' | '40s' | '50s' | '60plus';
  };
  stats: { totalScore: number; sessions: number; bestScore: number; captures: number; defenses: number };
  status: 'active' | 'suspended' | 'banned' | 'deleted';
  createdAt: Timestamp; lastLoginAt: Timestamp;
}

// regions/{code}   code: 행정표준코드(법정동/행정동 코드 중 택1 — 확정 필요)
interface Region {
  code: string; parentCode?: string;
  level: 'sido' | 'sigungu' | 'eupmyeondong';
  names: { ko: string; en?: string; ja?: string; 'zh-CN'?: string };
  quizUnit: boolean;             // 이 단위에서 퀴즈 출제 여부 (관리자 조정)
  enabled: boolean;              // 서비스 오픈 여부 (MVP: 제주·충북)
  questionCount: Record<string, number>; // "history_1" 등 칸별 승인 문항 수
}

// questions/{id}
interface Question {
  regionCode: string;
  category: 'history' | 'people' | 'food' | 'tour';
  level: 1 | 2 | 3 | 4;
  content: Record<Locale, { prompt: string; choices: string[]; explanation: string } | undefined>;
  answerIndex: number;
  media?: { type: 'image' | 'video'; path: string; credit: string; license: string }[];
  sources: { title: string; url?: string; accessedAt: Timestamp }[];  // 근거 출처 필수
  origin: 'manual' | 'ai_draft';
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'retired';
  validUntil?: Timestamp;        // 최신 이슈 등 유효기간
  stats: { served: number; correct: number; lastServedAt?: Timestamp };
  createdBy: string; reviewedBy?: string; reviewedAt?: Timestamp;
}

// sessions/{id}
interface Session {
  uid: string; regionCode: string; seasonId: string;
  mode: 'attack' | 'defend' | 'practice';
  items: { questionId: string; category: string; level: number;
           servedAt: Timestamp; answeredAt?: Timestamp;
           choiceIndex?: number; correct?: boolean; timeFactor?: number; score?: number }[];
  totalScore?: number;
  countsForTerritory: boolean;   // 일일 반영 한도 초과 시 false
  status: 'active' | 'finished' | 'expired' | 'flagged';
  createdAt: Timestamp; finishedAt?: Timestamp;
}

// territories/{seasonId_regionCode}
interface Territory {
  seasonId: string; regionCode: string;
  teams: Record<string /*소속지역코드*/, { sumScore: number; participants: number; power: number }>;
  owner?: string; contested: boolean; leaderShare: number; // 0~1
  updatedAt: Timestamp;
}
```

## 3. 인덱스 (초안)

| 컬렉션 | 필드 |
|---|---|
| questions | regionCode ↑, category ↑, level ↑, status ↑, stats.lastServedAt ↑ |
| sessions | uid ↑, createdAt ↓ |
| sessions | regionCode ↑, seasonId ↑, status ↑ |
| reports | status ↑, createdAt ↓ |
| auditLogs | actorUid ↑, createdAt ↓ |

## 4. Security Rules (요지)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isSelf(uid) { return signedIn() && request.auth.uid == uid; }
    function isStaff()   { return signedIn() && request.auth.token.role in ['admin','moderator','editor']; }

    match /users/{uid} {
      allow read: if isSelf(uid) || isStaff();
      allow update: if isSelf(uid)
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['displayName','locale','theme','profile']);
      // homeRegion 변경은 Function(변경 제한 검증)으로만
      match /private/{doc} { allow read, write: if false; }
    }
    match /regions/{id}      { allow read: if true; allow write: if false; }
    match /seasons/{id}      { allow read: if true; allow write: if false; }
    match /territories/{id}  { allow read: if true; allow write: if false; }
    match /leaderboards/{id} { allow read: if true; allow write: if false; }
    match /config/app        { allow read: if true; allow write: if false; }

    match /questions/{id}    { allow read, write: if false; } // 어드민도 Function 경유
    match /sessions/{id}     { allow read: if signedIn() && resource.data.uid == request.auth.uid;
                               allow write: if false; }
    match /reports/{id} {
      allow create: if signedIn() && request.resource.data.reporterUid == request.auth.uid;
      allow read: if signedIn() && resource.data.reporterUid == request.auth.uid || isStaff();
    }
    match /auditLogs/{id}    { allow read: if isStaff(); allow write: if false; }
  }
}
```

> 규칙은 Firebase 에뮬레이터 + `@firebase/rules-unit-testing`으로 테스트를 작성한 뒤 배포합니다.

## 5. 개인정보 처리 원칙

- 성별·연령대는 **선택 입력**, 세대·성별 지도는 **집계 인원이 일정 수(k) 미만인 셀은 비공개** (k 값 확정 필요, 예: 20)
- 이메일은 어드민 회원관리 화면에서만 표시, 마스킹 기본
- 탈퇴 시 `users` 문서 익명화 + 세션의 uid를 해시로 치환 (집계 보존 목적) — 보존 기간은 개인정보처리방침에 명시 필요 (법률 검토 대상)
