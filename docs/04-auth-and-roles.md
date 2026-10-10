# 04. 인증 및 권한

## 1. 로그인 방식

| 단계 | 공급자 |
|---|---|
| MVP | **Google 로그인** (Firebase Auth `GoogleAuthProvider`) |
| 2차 | 카카오·네이버 (Firebase 기본 공급자가 아니므로 OIDC 또는 Custom Token 방식 — 착수 시 공식 지원 범위 확인 필요) |
| 선택 | 비로그인 "연습 모드" (점수는 저장하지 않음) |

### 클라이언트 흐름

```ts
// apps/web/lib/auth.ts
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // 모바일·인앱 브라우저는 팝업 차단이 잦아 redirect 사용
  return isMobileOrInApp() ? signInWithRedirect(auth, provider) : signInWithPopup(auth, provider);
}
```

> 카카오톡·인스타그램 등 **인앱 브라우저에서 Google 로그인이 차단**될 수 있습니다. 감지 시 "외부 브라우저로 열기" 안내를 띄웁니다.

### Vercel 도메인 설정

- Firebase 콘솔 → Authentication → **승인된 도메인**에 운영 도메인과 Vercel 프리뷰 도메인 추가
- Redirect 방식 사용 시 서드파티 쿠키 차단 브라우저 대응이 필요할 수 있음 → 공식 가이드 확인: https://firebase.google.com/docs/auth/web/redirect-best-practices

## 2. 최초 가입 처리

```
Auth onCreate (functions/triggers/onUserCreate.ts)
  → users/{uid} 생성 (status: active, theme: system, locale: 브라우저 언어)
  → 온보딩 화면: 약관 동의 → 연령 확인 → 소속 지역 선택 → (선택) 성별·연령대
```

## 3. 역할(Role) 모델

Firebase **Custom Claims**에 `role` 저장. 변경은 `setRole` Callable(admin 전용)로만 수행하고 `auditLogs`에 기록합니다.

| 역할 | 권한 |
|---|---|
| `user` (기본, 클레임 없음) | 플레이, 본인 정보 수정, 신고 |
| `editor` | 문항 작성·AI 초안 편집·검수 요청 |
| `moderator` | 문항 승인/반려, 신고 처리, 사용자 일시정지 |
| `admin` | 전체 권한: 역할 부여, 영구 정지, 시즌·게임 파라미터, 지역 오픈 |

```ts
// functions/src/admin/setRole.ts (요지)
export const setRole = onCall(async (req) => {
  assertRole(req.auth, ['admin']);
  const { uid, role } = req.data;
  await getAuth().setCustomUserClaims(uid, role === 'user' ? {} : { role });
  await getAuth().revokeRefreshTokens(uid);        // 즉시 반영 유도
  await writeAudit(req.auth.uid, 'setRole', { uid, role });
});
```

- 최초 admin은 배포 스크립트(로컬 Admin SDK)로 1회 지정
- 클레임은 ID 토큰 갱신 후 반영되므로 역할 변경 후 클라이언트에서 `getIdToken(true)` 호출

## 4. 어드민 접근 보호 (다층)

1. `middleware.ts`: 세션 쿠키 없으면 `/admin` → 로그인 리다이렉트 (UX 목적, 보안 경계 아님)
2. 어드민 레이아웃: 클라이언트에서 `role` 클레임 확인 후 렌더
3. **실제 보안 경계**: 모든 어드민 데이터는 `role`을 검사하는 Callable Function 또는 Rules로만 접근
4. 어드민 계정은 Google 계정의 2단계 인증 사용 권장

## 5. 계정 상태

| 상태 | 동작 |
|---|---|
| `suspended` | 로그인 가능, 플레이·랭킹 반영 차단, 사유·기간 표시 |
| `banned` | Firebase Auth `disabled: true` + 랭킹에서 제외 |
| `deleted` | 사용자 요청 탈퇴: Auth 계정 삭제 + 프로필 익명화 |

## 6. 미성년자 처리

문제 난이도가 초등 수준이라 아동 이용이 예상됩니다. 국내 개인정보 보호법은 **만 14세 미만 아동의 개인정보 처리 시 법정대리인 동의**를 요구하는 것으로 알고 있으나, 구체적 절차는 **법률 검토가 필요(확실하지 않음)** 합니다. 선택지:

| 안 | 내용 | 비고 |
|---|---|---|
| A | 만 14세 미만 가입 불가 | 가장 단순, 타깃 축소 |
| B | 보호자 동의 절차 구현 | 개발·운영 부담 큼 |
| C | 14세 미만은 비로그인 연습 모드만 | 절충안 |

MVP 권장: **A 또는 C** (확정 필요). Google 계정 자체의 연령 정책도 있으므로 함께 검토합니다.
