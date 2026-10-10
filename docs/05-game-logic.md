# 05. 게임 로직 및 점수 계산

모든 계산은 `packages/shared/scoring.ts`에 순수 함수로 두고, **실행은 Cloud Functions에서만** 합니다. 클라이언트는 표시용 미리보기에만 같은 함수를 사용합니다.

## 1. 게임 파라미터 (`config/game`, 어드민에서 수정)

```ts
export const DEFAULT_GAME_CONFIG = {
  basePoints: { 1: 100, 2: 150, 3: 200, 4: 300 },
  picksPerSession: 4,
  allowDuplicateLevel: true,        // 확정 필요
  timeLimitSec: 30,                 // 시안 24초 표시 → 확정 필요
  timeFactor: { min: 1.0, max: 1.2, graceSec: 3 },  // 시안(1.3배)과 불일치 → 확정 필요
  networkGraceMs: 1500,
  dailyTerritoryLimitPerRegion: 3,  // 가설
  questionCooldownDays: 14,         // 가설
  capture: { minParticipants: 30, minShare: 0.55, holdHours: 6 }, // 가설
  kAnonymity: 20,                   // 세대·성별 지도 최소 집계 인원 (가설)
} as const;
```

## 2. 개인 점수

\[
\text{총점}=\sum_{i=1}^{4}(\text{기본점수}_i\times\text{정답}_i\times\text{시간계수}_i)
\]

### 시간계수 (선형 감소안)

```ts
export function timeFactor(elapsedSec: number, cfg = DEFAULT_GAME_CONFIG) {
  const { min, max, graceSec } = cfg.timeFactor;
  const limit = cfg.timeLimitSec;
  if (elapsedSec <= graceSec) return max;
  if (elapsedSec >= limit) return min;
  const ratio = (elapsedSec - graceSec) / (limit - graceSec);
  return round2(max - (max - min) * ratio);
}

export function itemScore(level: 1|2|3|4, correct: boolean, elapsedSec: number) {
  if (!correct) return 0;
  return Math.round(DEFAULT_GAME_CONFIG.basePoints[level] * timeFactor(elapsedSec));
}
```

- **경과시간 = `answeredAt(서버) − servedAt(서버)` − 네트워크 유예**. 클라이언트 타이머는 표시용.
- 제한시간 + 유예 초과 제출은 오답 처리.
- 너무 빠른 정답(예: 0.8초 미만 연속)은 `flagged` 후보로 기록 (봇 탐지).

## 3. 출제 알고리즘 (`startSession`)

```
for each pick(category, level):
  후보 = questions where regionCode, category, level, status=approved, validUntil > now
  후보 −= 이 사용자가 cooldownDays 내 받은 문항
  정렬: lastServedAt 오래된 순 + 무작위 가중치
  후보 없으면 → cooldown 무시 → 그래도 없으면 해당 칸 비활성(16칸 화면에 미리 표시)
선택지 순서는 서버에서 섞고, 섞인 순서의 정답 인덱스를 세션에 저장
```

- 16칸 화면은 `regions.questionCount`로 **문항이 부족한 칸을 회색 처리**
- 정답·해설은 `submitAnswer` 응답에서만 공개

## 4. 점령력 (집단 점수)

\[
\text{점령력}_{팀}=\overline{\text{점수}}_{팀}\times\sqrt{N_{유효}}
\]

```ts
export function territoryPower(sumScore: number, participants: number) {
  if (participants === 0) return 0;
  return (sumScore / participants) * Math.sqrt(participants);
}
```

- **유효 참여자**: 시즌 내 해당 지역에 1회 이상 `countsForTerritory=true` 세션을 낸 고유 사용자. 정지·flagged 제외.
- 한 사용자의 팀 기여 점수는 **해당 지역 일일 반영 한도 내 세션의 최고점 또는 평균**(확정 필요) 사용 → 반복 플레이로 평균을 끌어올리는 효과 억제.
- 방어팀 = 해당 지역 소속원(`homeRegion == regionCode`), 공격팀 = 그 외 소속 지역별 팀.

### 점령 판정 (매 집계 시)

```
leader = power 최대 팀, share = leader.power / Σpower
if leader != owner
   and leader.participants >= minParticipants
   and share >= minShare
   유지 시작 시각 기록 → holdHours 경과 시 owner 교체, 이벤트 발행
contested = 상위 2팀 share 차이 < 0.1 (가설)
```

### 오늘의 격전지 (Scheduler, 1시간마다)

`contested` 지역 중 최근 24시간 참여자 수 × (1 − |share 차이|) 상위 3곳.

## 5. Callable Function 계약

| 함수 | 입력 | 출력 | 검증 |
|---|---|---|---|
| `startSession` | `{regionCode, mode, picks[4]}` | `{sessionId, items:[{prompt, choices, timeLimitSec}]}` | 로그인, 계정 상태, 지역 오픈 여부, picks 유효성, 진행 중 세션 1개 제한 |
| `submitAnswer` | `{sessionId, index, choiceIndex}` | `{correct, answerIndex, explanation, score, timeFactor}` | 본인 세션, 순서대로 제출, 중복 제출 불가 |
| `finishSession` | `{sessionId}` | `{totalScore, countsForTerritory, rankDelta}` | 모든 문항 응답 또는 만료 |

세션은 시작 후 `timeLimitSec × 4 + 60초` 경과 시 자동 `expired` (미응답 오답).

## 6. 부정행위 방지

| 위협 | 대응 |
|---|---|
| 클라이언트 점수 조작 | 서버 채점, Rules로 쓰기 차단 |
| 정답 사전 열람 | 정답 미전송, 문항 컬렉션 읽기 차단 |
| 다중 계정 | 유효 참여자 산정 시 신규 계정 가중치 낮춤(가입 N일 미만), App Check 적용 |
| 봇·매크로 | Firebase **App Check**(reCAPTCHA Enterprise 등), 비정상 응답속도 플래그 |
| 문항 유출·공유 | 문항 풀 확대, 쿨다운, 선택지 셔플, 정답률 급등 문항 자동 검수 대기 |

## 7. 테스트

- `scoring.ts` 단위 테스트: 경계값(유예시간, 제한시간, 0명 팀)
- Functions 통합 테스트: 에뮬레이터로 세션 시작→제출→집계 시나리오
- 시뮬레이션: 가상 사용자 분포로 점령 판정 파라미터 튜닝 (참여 인원 편중 지역 vs 소규모 지역)
