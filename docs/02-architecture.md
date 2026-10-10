# 02. 시스템 아키텍처

## 1. 전체 구성

```
┌──────────────────────────────── 클라이언트 ────────────────────────────────┐
│  Next.js (App Router, TS) on Vercel                                         │
│  - 공개 페이지(SSR/ISR): 랜딩, 지역 소개, 랭킹 스냅샷                         │
│  - 게임 화면(CSR): 지도, 16칸 선택, 퀴즈 풀이                                │
│  - 어드민(/admin, CSR + 서버 측 권한 확인)                                   │
│  - Firebase JS SDK: Auth, Firestore 구독(집계 문서만)                         │
└───────────────┬──────────────────────────────────────┬──────────────────────┘
                │ ID Token                              │ onSnapshot (읽기 전용)
                ▼                                       ▼
┌──────────── Cloud Functions ────────────┐   ┌──────────── Firestore ─────────────┐
│ Callable: startSession / submitAnswer    │──▶│ users, regions, questions,          │
│           finishSession                  │   │ sessions, seasons, territories,     │
│ Callable(admin): setRole, banUser,       │   │ leaderboards, reports, auditLogs    │
│           approveQuestion ...            │   └─────────────────────────────────────┘
│ Trigger : onSessionFinished → 점령 집계  │
│ Scheduler: 시즌 리셋(월 00:00 KST),      │   ┌──────────── Cloud Storage ─────────┐
│           격전지 선정, 랭킹 스냅샷       │   │ 문항 이미지·영상, GeoJSON 원본      │
└──────────────────────────────────────────┘   └─────────────────────────────────────┘
```

### 원칙

1. **점수·점령 계산은 서버(Functions)에서만** 수행. 클라이언트는 정답·점수 문서에 쓰기 권한 없음.
2. **정답은 클라이언트에 내려보내지 않음.** 문항 조회도 Function을 통해 정답 필드를 제거한 형태로 전달.
3. **실시간 구독은 집계 문서만** (`territories/{regionCode}`, `leaderboards/*`). 개별 세션 문서 구독 금지 → 읽기 비용 통제.
4. 공통 로직(점수 계산, 지역 코드, 타입)은 `packages/shared`로 분리해 웹·Functions가 같은 코드 사용.

## 2. 저장소 구조 (모노레포)

```
local-quiz-battle/
├─ apps/web/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ (public)/page.tsx            # 랜딩
│  │  │  ├─ map/page.tsx                 # 전국 지도
│  │  │  ├─ region/[code]/page.tsx       # 지역 → 16칸 선택
│  │  │  ├─ play/[sessionId]/page.tsx    # 퀴즈 풀이
│  │  │  ├─ result/[sessionId]/page.tsx  # 결과
│  │  │  ├─ ranking/page.tsx
│  │  │  ├─ me/page.tsx                  # 내 정보·설정
│  │  │  └─ admin/                       # 어드민 (08 문서)
│  │  └─ api/session/route.ts            # 세션 쿠키 발급(선택)
│  ├─ components/ (map, quiz, theme, i18n, admin, ui)
│  ├─ lib/ (firebase-client.ts, firebase-admin.ts, auth.ts)
│  ├─ messages/ (ko.json, en.json, ja.json, zh-CN.json)
│  └─ middleware.ts                      # 로케일 라우팅 + /admin 1차 차단
├─ functions/src/
│  ├─ callable/ (startSession.ts, submitAnswer.ts, finishSession.ts)
│  ├─ admin/ (setRole.ts, moderateUser.ts, questionWorkflow.ts)
│  ├─ triggers/ (onSessionFinished.ts, onUserCreate.ts)
│  └─ scheduled/ (seasonReset.ts, hotspots.ts, leaderboardSnapshot.ts)
├─ packages/shared/ (scoring.ts, regions.ts, types.ts, i18n-keys.ts)
├─ data/geo/                             # 행정구역 GeoJSON (출처·라이선스 기재)
├─ firestore.rules / firestore.indexes.json / storage.rules / firebase.json
└─ docs/
```

## 3. 주요 데이터 흐름

### 3.1 퀴즈 1회 플레이

```
1. 클라이언트: startSession({regionCode, picks:[{category, level}×4]})
2. Function : 인증·일일 제한 확인 → 각 칸마다 문항 선택(최근 출제 제외)
              → sessions/{id} 생성(서버 시각 기록) → 정답 제외한 문항 반환
3. 클라이언트: 문제마다 submitAnswer({sessionId, index, choiceId})
4. Function : 서버 시각으로 경과시간 계산 → 정답 판정·시간계수 → 결과 저장
              → 정답/해설 반환
5. 클라이언트: finishSession → 총점 확정
6. Trigger  : onSessionFinished → 지역 점령 집계(트랜잭션/분산 카운터)
              → territories/{regionCode} 갱신 → 모든 지도 구독자에 반영
```

### 3.2 시즌 리셋 (매주 월 00:00 KST)

```
Scheduler → 현재 시즌 확정(점령 결과 스냅샷) → 보상 지급 기록
          → seasons/{next} 생성 → territories 초기화 → leaderboards 초기화
```

## 4. 실시간·비용 전략

| 항목 | 방식 |
|---|---|
| 지도 점령 상태 | `territories` 문서(시·도 17개 + 하위 지역) 구독. 쓰기 빈도가 높으면 **N초 단위 디바운스 집계 문서**(`mapSnapshot/current`)로 대체 |
| 쓰기 경합 | 인기 지역은 **분산 카운터(shards)** 사용 후 주기적으로 합산 |
| 랭킹 | 실시간 계산 대신 **스케줄러로 5~10분마다 스냅샷** (주기는 비용 테스트 후 결정) |
| 정적 데이터 | GeoJSON·지역 메타는 빌드 시 정적 자산으로 포함(CDN 캐시) |

> Firestore 단일 문서의 지속 쓰기 한도, 요금 등 수치는 공식 문서에서 착수 시점 기준으로 확인해야 합니다 (참고: https://firebase.google.com/docs/firestore/quotas).

## 5. 기술 선택 근거와 대안

| 영역 | 선택 | 이유 | 대안 |
|---|---|---|---|
| 지도 렌더링 | d3-geo + SVG | 시·군·구 수백 개 수준은 SVG로 충분, 호버·클릭 이벤트 단순 | 하위 지역이 매우 많으면 Canvas/WebGL(deck.gl) |
| 상태관리 | React 상태 + 가벼운 스토어(zustand 등) | 서버 상태는 Firestore 구독이 담당 | TanStack Query |
| 스타일 | Tailwind CSS + CSS 변수 토큰 | 다크/라이트 토큰 전환 용이 | CSS Modules |
| i18n | next-intl | App Router 로케일 세그먼트 지원 | 직접 구현 |

> 라이브러리 선택은 권장안이며, 착수 시 유지보수 상태와 Next.js 버전 호환성을 확인해야 합니다.
