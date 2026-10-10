# 09. 배포·운영·로드맵

## 1. 환경 구성

| 환경 | 웹 (Vercel) | Firebase 프로젝트 | 용도 |
|---|---|---|---|
| local | `pnpm dev` | 에뮬레이터 | 개발 |
| preview | PR별 프리뷰 URL | `lqb-staging` | 리뷰·QA |
| production | 운영 도메인 | `lqb-prod` | 서비스 |

> Firebase 프로젝트는 스테이징·운영을 **분리**합니다. 프로젝트 ID는 예시입니다.

## 2. 환경 변수

```bash
# .env.example — 클라이언트 공개 값 (Firebase 웹 설정은 비밀이 아님, 보안은 Rules·App Check로)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=          # App Check
NEXT_PUBLIC_USE_EMULATORS=true           # local만

# 서버 전용 (Vercel 환경변수에 Production/Preview 별도 등록)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=              # 줄바꿈 \n 처리 주의
```

- Functions 비밀값(AI API 키 등)은 **Secret Manager**(`defineSecret`)로 관리
- 서비스 계정 키 파일은 저장소에 커밋 금지 (`.gitignore`)

## 3. 배포 파이프라인 (GitHub Actions 예)

```
PR 생성
 ├─ lint · typecheck · 단위 테스트(packages/shared)
 ├─ 에뮬레이터 통합 테스트 (Rules + Functions)
 ├─ i18n 키 누락 검사
 └─ Vercel 프리뷰 자동 배포 (Vercel GitHub 연동)

main 머지
 ├─ Vercel Production 자동 배포
 └─ firebase deploy --only firestore:rules,firestore:indexes,functions,storage -P prod
```

- Rules·인덱스 배포를 웹 배포보다 **먼저** 실행(새 쿼리의 인덱스 누락 방지)
- Functions 리전: 사용자 근접성을 위해 서울(`asia-northeast3`) 고려 — 해당 리전의 기능 지원 범위(예: 스케줄러, 2세대 함수)는 착수 시 확인 필요
- 스케줄러 타임존은 `Asia/Seoul`로 명시

## 4. 비용 관리

| 항목 | 대응 |
|---|---|
| Firestore 읽기 | 지도·랭킹은 집계 문서 구독, 목록은 페이지네이션 |
| Functions 호출 | 1세션 = 시작 1 + 제출 4 + 종료 1 = 약 6회 (종료를 마지막 제출에 합치면 5회) |
| 지도 데이터 | 정적 자산 + CDN 캐시 |
| 예산 경보 | Google Cloud Billing 예산 알림(50/80/100%) 설정 |

> 구체 단가는 요금이 변경될 수 있으므로 착수 시 공식 요금표에서 확인 후 예상 DAU별 시뮬레이션을 작성합니다. 참고: https://firebase.google.com/pricing , https://vercel.com/pricing

## 5. 모니터링·로깅

- 웹 오류: Sentry 등 에러 트래킹 (Vercel 연동)
- Functions: Cloud Logging, 오류율·지연시간 알림 (Cloud Monitoring)
- 제품 분석: Google Analytics for Firebase — 이벤트 `session_start`, `pick_complete`, `answer`, `session_finish`, `capture`, `theme_change`, `locale_change`
- 개인정보 처리방침에 분석 도구 사용 고지, 쿠키 동의 필요 여부는 법률 검토

## 6. 백업·장애 대응

- Firestore 예약 내보내기(일 1회) → Cloud Storage, 보존 30일(가설)
- 점검 모드 플래그(`config/app.maintenance`)로 즉시 플레이 차단
- 시즌 리셋 실패 시: 재실행 가능한 **멱등** 함수로 작성(시즌 ID 기준 중복 실행 방지)

## 7. 출시 전 체크리스트

- [ ] 미확정 규칙 7개 확정 ([01 문서 7장](01-product-overview.md#7-미확정-규칙-및-확인-필요-사항))
- [ ] 이용약관·개인정보처리방침 (법률 검토)
- [ ] 미성년자 정책 확정 및 구현
- [ ] Security Rules 테스트 통과, App Check 강제 모드
- [ ] 제주·충북 승인 문항: 16칸 × 칸당 최소 N개(N 확정 필요, 예: 10)
- [ ] GeoJSON·이미지 라이선스 표기
- [ ] 다크/라이트 × ko/en × 모바일/PC 시각 QA
- [ ] 접근성 점검 (키보드, 대비, 지도 목록 뷰)
- [ ] 부하 테스트: 동시 접속 시 territories 쓰기 경합 확인

## 8. 로드맵

> 기간은 인력·범위에 따라 달라지므로 **상대적 규모 추정**이며 확정 일정이 아닙니다.

| 단계 | 주요 작업 | 산출물 |
|---|---|---|
| 0. 준비 | 규칙 확정, 디자인 시스템(토큰·컴포넌트), GeoJSON 가공, 문항 수집 착수 | 확정 규칙서, 디자인 토큰 |
| 1. MVP | Google 로그인, 테마 토글, ko/en, 지도·지역 선택, 16칸, 서버 채점, 결과, 지역 랭킹, 기본 어드민(대시보드·회원·문제은행) | 제주·충북 클로즈드 베타 |
| 2. 점령 시스템 | 공격·방어, 실시간 점령, 주간 시즌·보상, 격전지, 세대·성별 지도, 방어 알림(FCM), ja/zh-CN, AI 문항 초안 | 전국 오픈 |
| 3. 라이브·협업 | 전국 동시 OX(실시간 동기화 설계 별도), 지역 대항전·동맹, 축제 특별전, 지자체 협업·리워드 | 파트너십 운영 |

### MVP 작업 분해 (요약)

1. 모노레포·CI 셋업, 에뮬레이터 환경
2. `packages/shared`: 타입, 지역 코드, 점수 함수 + 테스트
3. Auth + 온보딩 + 역할 클레임
4. 테마 토글 + i18n 라우팅 + 레이아웃
5. 지도 컴포넌트 (시·도 → 시·군·구)
6. 16칸 선택 + `startSession`/`submitAnswer`/`finishSession`
7. 결과·랭킹 스냅샷
8. 어드민: 대시보드, 회원관리, 문제은행 편집·검수, 감사 로그
9. QA·베타 운영
