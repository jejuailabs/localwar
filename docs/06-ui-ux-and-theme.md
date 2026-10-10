# 06. UI/UX 및 테마

## 1. 시안 분석

| 구분 | B안 — 배틀형 | D안 — 전략형 |
|---|---|---|
| 콘셉트 | "지역을 건 치열한 승부" 게임 몰입 | "데이터로 분석하는 전략" 정보 중심 |
| 좌측 | 방어전 지역 일러스트 + 점령도 68% + 행동 유도 문구 | 전국 지도 미니맵 + 지역 랭킹 TOP 5 |
| 중앙 | 진행(1/4), 4칸 탭, 문제·보기·사진, 힌트 | 동일 구조 |
| 우측 | 원형 타이머(24초), 획득 점수 내역, 누적 점수, 강조 CTA | 타이머, 점수 계산식, 누적, 퀴즈 분석(보기 선택 비율) |
| 장점 | 감정적 몰입, 모바일 친화 | 경쟁 맥락 파악, 재방문 동기 |
| 우려 | 정보 부족 | 정보 과다, 모바일에서 축약 필요 |

### 권장: B+D 결합

- **풀이 화면**: B안 중심 (타이머·점수 피드백의 긴장감)
- **지도·결과·랭킹 화면**: D안 중심 (미니맵, 랭킹, 분석)
- D안의 "보기 선택 비율" 그래프는 **응답 제출 후에만** 노출 (사전 노출 시 정답 힌트가 됨)

> 시안 속 제주 초가집 문제처럼 사진이 정답을 암시하지 않도록 **이미지-정답 독립성**을 검수 체크리스트에 포함합니다.

## 2. 화면 목록

| 경로 | 화면 | 핵심 요소 |
|---|---|---|
| `/` | 랜딩 | 실시간 전국 지도 미리보기, Google 로그인 |
| `/map` | 전국 지도 | 점령 모드 / 세대·성별 모드 탭, 오늘의 격전지 3곳 |
| `/region/[code]` | 지역 + 16칸 선택 | 4×4 그리드, 선택 수(n/4), 최대 기본점수, "4문제 도전" |
| `/play/[id]` | 풀이 | 진행바, 타이머, 문제, 보기 4개, 힌트, 점수 패널 |
| `/result/[id]` | 결과 | 문항별 정오·해설·출처, 점령 기여도, 공유 |
| `/ranking` | 랭킹 | 개인 / 지역 / 시즌 / 역대 |
| `/me` | 내 정보 | 소속 지역, 기록·업적, 언어·테마 설정, 탈퇴 |
| `/admin/*` | 어드민 | [08 문서](08-admin-console.md) |

## 3. 레이아웃 반응형

| 폭 | 풀이 화면 구성 |
|---|---|
| ≥1280px | 3단 (좌 지역 패널 / 중앙 문제 / 우 타이머·점수) — 시안 그대로 |
| 768~1279px | 2단 (중앙 문제 + 우 패널), 좌 패널은 상단 배너로 축약 |
| <768px | 1단: 상단 고정 바(진행·타이머·점수) → 문제 → 보기(엄지 영역 큰 버튼) → 하단 CTA |

## 4. 지도 인터랙션

- 데이터: 행정구역 GeoJSON → 빌드 시 단순화(mapshaper 등)로 용량 축소 → TopoJSON
- **출처·라이선스 확인 필수**: 공공데이터 경계 파일 사용 시 이용 조건 기재 (구체 출처는 착수 시 확정 — 확실하지 않음)
- PC: hover 시 해당 지역 **위로 떠오르는 효과**(translateY + drop-shadow) + 툴팁(지역명·점령 팀·점유율)
- 클릭: 시·도 → 시·군·구로 확대 (d3 zoom transform 애니메이션), 뒤로가기 버튼과 브라우저 history 연동
- 모바일: 첫 탭 = 강조+툴팁, 두 번째 탭 = 진입. 핀치 줌 지원
- 점령 모드: 점령 팀 색 + 깃발 아이콘, 경합 지역은 맥동(pulse) 테두리
- 세대·성별 모드: 색상(성별) × 농도(우세 정도) × 패턴(연령대, SVG `<pattern>`). **색만으로 의미 전달하지 않도록** 패턴·범례 병행
- 접근성: 지도 옆에 동일 정보를 담은 **목록 뷰** 제공 (키보드·스크린리더)

## 5. 다크/라이트 모드 토글

### 요구사항

- 헤더 우측 **토글 스위치** (☀︎ / ☾), 설정 화면에는 `시스템 / 라이트 / 다크` 3지선다
- 첫 방문: OS 설정(`prefers-color-scheme`) 따름
- 선택값 저장: 비로그인 → `localStorage`, 로그인 → `users.theme`에도 저장해 기기 간 동기화
- **첫 페인트 깜빡임(FOUC) 방지**: `<head>` 인라인 스크립트로 hydration 전 `data-theme` 설정

### 구현 (next-themes 사용 예)

```tsx
// app/[locale]/layout.tsx
<html lang={locale} suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>

// components/theme/ThemeToggle.tsx
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <button role="switch" aria-checked={isDark}
            aria-label={t('theme.toggle')}
            onClick={() => { const next = isDark ? 'light' : 'dark'; setTheme(next); saveThemeToProfile(next); }}
            className="theme-switch">
      <span className="thumb" />
    </button>
  );
}
```

### 디자인 토큰

```css
:root, [data-theme="light"] {
  --bg: #f5f7fb; --surface: #ffffff; --text: #111827; --text-muted: #6b7280;
  --primary: #1d4ed8; --accent: #f59e0b; --danger: #dc2626; --success: #16a34a;
  --border: #e5e7eb;
}
[data-theme="dark"] {
  --bg: #0b1220; --surface: #111a2e; --text: #e5e7eb; --text-muted: #94a3b8;
  --primary: #3b82f6; --accent: #fbbf24; --danger: #f87171; --success: #4ade80;
  --border: #1f2a44;
}
```

- 시안은 다크 기본(남색 배경 + 주황/금색 강조). **다크 모드를 1차 디자인 기준**으로 삼고 라이트는 동일 토큰으로 파생
- 지도 팀 색상 팔레트는 양 테마에서 대비 확인 (WCAG AA 4.5:1 텍스트 기준)
- 사진·일러스트는 테마 무관, 단 라이트 모드에서 B안의 화염 효과 등은 채도 낮춤

## 6. 피드백·모션

- 정답: 초록 하이라이트 + 점수 카운트업, 오답: 흔들림 + 정답 표시
- 타이머 5초 이하: 색 전환(주황→빨강) + 진동(모바일, 사용자 설정으로 끌 수 있음)
- `prefers-reduced-motion` 존중: 지도 부상·맥동·화염 애니메이션 비활성
