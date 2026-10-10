# 08. 어드민 콘솔

경로: `/[locale]/admin` (UI는 ko 고정). 접근 조건과 역할은 [04-auth-and-roles.md](04-auth-and-roles.md#3-역할role-모델) 참고.

## 1. 메뉴 구성 및 권한

| 메뉴 | 경로 | editor | moderator | admin |
|---|---|:-:|:-:|:-:|
| 대시보드 | `/admin` | ○ | ○ | ○ |
| 회원관리 | `/admin/users` | | 조회·일시정지 | 전체 |
| 문제은행 | `/admin/questions` | 작성·편집 | 승인·반려 | 전체 |
| AI 문항 초안 | `/admin/questions/ai` | ○ | ○ | ○ |
| 신고 처리 | `/admin/reports` | | ○ | ○ |
| 지역 관리 | `/admin/regions` | | | ○ |
| 시즌·점령 | `/admin/seasons` | | 조회 | 전체 |
| 게임 설정 | `/admin/config` | | | ○ |
| 공지·점검 | `/admin/notices` | | ○ | ○ |
| 감사 로그 | `/admin/audit` | | | ○ |

## 2. 대시보드

### KPI 카드 (상단)

| 지표 | 정의 |
|---|---|
| DAU / WAU | 일·주간 1회 이상 세션 시작한 고유 사용자 |
| 신규 가입 | 오늘 / 7일 추이 |
| 오늘 세션 수 | finished 세션 수, 평균 점수 |
| 진행 중 시즌 | 남은 시간, 점령 전환 횟수 |
| 검수 대기 | review 상태 문항 수, 미처리 신고 수 |
| 이상 탐지 | flagged 세션 수 (최근 24시간) |

### 차트·패널

- 일별 DAU·세션 추이 (최근 30일 라인 차트)
- 지역별 참여 히트맵 (전국 지도 재사용)
- 단계별 정답률 분포 vs 목표 범위 (막대) → 너무 쉽거나 어려운 문항 탐지
- 문항 커버리지: 지역 × 16칸 승인 문항 수 표 (부족 칸 빨간색)
- 최근 관리자 활동 (감사 로그 10건)

### 데이터 소스

대시보드는 원본 컬렉션을 직접 스캔하지 않고, Scheduler가 생성하는 **`stats/daily/{yyyymmdd}` 집계 문서**를 읽습니다(비용 통제). 정밀 분석이 필요해지면 Firestore → **BigQuery 내보내기**(Firebase 확장 프로그램) 후 분석합니다.

## 3. 회원관리

### 목록

- 검색: 닉네임, 이메일(admin만 전체 표시, 그 외 마스킹), uid
- 필터: 상태(active/suspended/banned), 역할, 소속 지역, 가입일, 최근 접속일
- 컬럼: 닉네임 · 이메일(마스킹) · 소속 지역 · 역할 · 상태 · 누적 점수 · 세션 수 · 가입일 · 최근 접속
- 서버 페이지네이션(커서 기반), CSV 내보내기는 admin만 + 감사 로그 기록

### 상세

- 프로필, 누적 기록, 최근 세션 20건(문항별 응답 시간 포함), 신고 이력, 제재 이력
- 동작: 일시정지(기간·사유) / 해제 / 영구 정지 / 역할 변경 / 소속 지역 강제 변경 / 탈퇴 처리
- **모든 동작은 사유 입력 필수** → `auditLogs` 기록

```ts
// functions/src/admin/moderateUser.ts (요지)
export const moderateUser = onCall(async (req) => {
  const actor = assertRole(req.auth, ['moderator', 'admin']);
  const { uid, action, reason, until } = parse(ModerateSchema, req.data);
  if (action === 'ban' && actor.role !== 'admin') throw forbidden();
  await applyModeration(uid, action, until);           // users.status + Auth disabled
  await writeAudit(actor.uid, `user.${action}`, { uid, reason, until });
});
```

## 4. 문제은행

### 상태 흐름

```
draft ──(검수 요청)──▶ review ──(승인)──▶ approved ──(만료/정답률 이상)──▶ retired
  ▲                      │
  └────(반려·수정 요청)───┘
```

### 편집기

- 필드: 지역(트리 선택), 분류, 단계, 질문, 보기 4개, 정답, 해설, 미디어(업로드 + 출처·라이선스), **근거 출처(필수)**, 유효기간
- 언어 탭 (07 문서)
- 미리보기: 실제 풀이 화면 컴포넌트로 다크/라이트 양쪽 표시
- 검수 체크리스트 (승인 시 전부 체크해야 활성화)
  - [ ] 근거 출처로 사실 확인됨
  - [ ] 정답이 하나뿐이고 오답이 명확히 틀림
  - [ ] 이미지가 정답을 직접 암시하지 않음
  - [ ] 단계 난이도 적정
  - [ ] 인물 출신지·사투리·최신 이슈인 경우 2차 확인 완료
  - [ ] 미디어 사용 권한 확인

### AI 문항 초안

- 입력: 지역, 분류, 단계, 개수, 참고 자료(공공데이터·지자체·관광공사 URL 또는 텍스트)
- 출력은 **반드시 `draft` + `origin: ai_draft`** 로 저장, 출처 없는 초안은 저장 불가
- 사용 모델·API는 착수 시 결정 (비용·한국어 품질 비교 필요)

### 일괄 작업

- CSV/JSON 가져오기 (스키마 검증 후 draft로)
- 문항 통계: 출제 횟수, 정답률, 평균 응답시간, 신고 수 → 이상치 정렬

## 5. 신고 처리

- 유형: 문항 오류(정답 틀림·오탈자·오래된 정보), 부적절 닉네임, 부정행위 의심
- 처리: 문항 수정/퇴출, 사용자 제재, 기각 — 결과를 신고자에게 알림(2차)

## 6. 지역·시즌·설정

- **지역 관리**: 오픈 여부(`enabled`), 퀴즈 단위(`quizUnit`), 다국어 지역명
- **시즌**: 현재 점령 현황 표, 수동 점령 정정(사유 필수), 시즌 조기 종료/연장, 지난 시즌 기록 조회
- **게임 설정**: `config/game` 파라미터 편집 (변경 전후 diff 표시 + 다음 시즌부터 적용 옵션)
- **공지·점검 모드**: 상단 배너, 점검 모드 시 플레이 차단 + 안내 페이지

## 7. 감사 로그

```ts
interface AuditLog {
  actorUid: string; actorRole: string;
  action: string;          // 'user.suspend', 'question.approve', 'config.update' ...
  target?: { type: string; id: string };
  payload: Record<string, unknown>; reason?: string;
  createdAt: Timestamp;
}
```

- 수정·삭제 불가(Rules), 보존 기간은 운영 정책으로 확정
