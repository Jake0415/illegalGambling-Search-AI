# 인증 플로우 가이드

GambleGuard 시스템의 초기 설정(Setup) → 로그인(Login) → 대시보드(Dashboard) 인증 흐름을 설명합니다.

---

## 전체 플로우 다이어그램

```
사용자 접속 (/)
  │
  ▼
AuthGuard (보호된 라우트 진입점)
  │
  ├─ 백엔드 DB에 슈퍼어드민 없음 → /setup (초기 설정)
  │     │
  │     ▼ 5단계 설정 완료
  │     │
  │     └─→ /login
  │
  ├─ 슈퍼어드민 존재 + 미인증 → /login (로그인)
  │     │
  │     ▼ 이메일/비밀번호 인증
  │     │
  │     └─→ / (대시보드)
  │
  └─ 슈퍼어드민 존재 + 인증됨 → / (대시보드 접근 허용)
```

---

## 시나리오별 상세

### 시나리오 1: 최초 접속 (DB에 사용자 없음)

1. 사용자가 `http://localhost:3000` 접속
2. `AuthGuard`가 백엔드 `GET /api/v1/auth/setup-status` 호출
3. `isSetupComplete: false` 응답 → `/setup`으로 리다이렉트
4. `SetupWizard` 5단계 입력 (계정/DB/외부서비스/시스템/확인)
5. 설정 완료 → 슈퍼어드민 생성 + localStorage 동기화
6. `/login`으로 리다이렉트

### 시나리오 2: 슈퍼어드민 존재 + 미로그인 (브라우저 캐시 삭제 포함)

1. 사용자가 `http://localhost:3000` 접속
2. `AuthGuard`가 백엔드 `GET /api/v1/auth/setup-status` 호출
3. `isSetupComplete: true` 응답 (DB에 사용자 존재)
4. `isAuthenticated()` = false → `/login`으로 리다이렉트
5. 이메일/비밀번호 입력 → 로그인 성공 → `/` 대시보드

### 시나리오 3: 이미 로그인한 상태

1. 사용자가 `http://localhost:3000` 접속
2. `AuthGuard` 확인: setup 완료 + 인증됨
3. 대시보드 바로 렌더링

### 시나리오 4: 로그인 상태에서 /login 접속 시도

1. `LoginForm`의 `useEffect`에서 `isAuthenticated()` 확인
2. 이미 인증됨 → `/` 대시보드로 리다이렉트

### 시나리오 5: 슈퍼어드민 존재 + /setup 접속 시도

1. `SetupWizard`의 `useEffect`에서 `checkSetupStatus()` 호출
2. `isSetupComplete: true` → `/login`으로 리다이렉트
3. 이미 설정된 시스템에서 setup 재진입 차단

---

## 슈퍼어드민 정책

- **슈퍼어드민은 시스템에 1명만 존재**
- `POST /api/v1/auth/setup`은 users 테이블이 비어있을 때만 동작 (중복 생성 차단)
- `GET /api/v1/auth/setup-status`는 `role=SUPER_ADMIN`인 사용자가 1명이라도 있으면 `isSetupComplete: true` 반환
- 슈퍼어드민이 등록된 상태에서 `/setup` 접속 → **즉시 `/login`으로 리다이렉트**

---

## Setup 상태 판단 로직

```
브라우저 (클라이언트)
  │
  ▼
checkSetupStatus()
  │
  ├─ Next.js API 프록시 GET /api/auth/setup-status 호출
  │     │
  │     ▼ (서버사이드)
  │     FastAPI GET /api/v1/auth/setup-status
  │     │
  │     ├─ DB에 role=SUPER_ADMIN 사용자 존재 → true
  │     └─ 없음 → false
  │
  └─ API 연결 실패 → localStorage 폴백 (isSetupComplete)
```

**중요**: 브라우저 localStorage가 삭제되어도 백엔드 DB에 슈퍼어드민이 있으면 `/login`으로 정상 이동합니다.

---

## 공개 경로 (인증 불필요)

| 경로 | 용도 |
|------|------|
| `/login` | 로그인 페이지 |
| `/signup` | 회원가입 (Phase 3) |
| `/setup` | 초기 설정 |
| `/landing` | 랜딩 페이지 |

---

## 핵심 파일 위치

| 파일 | 역할 |
|------|------|
| `frontend/src/components/auth-guard.tsx` | 보호된 라우트 진입점 (비동기 setup 확인) |
| `frontend/src/lib/mock-auth.ts` | `checkSetupStatus()`, `isAuthenticated()` 등 인증 함수 |
| `frontend/src/components/setup/setup-wizard.tsx` | 5단계 초기 설정 위저드 |
| `frontend/src/components/login-form.tsx` | 로그인 폼 |
| `backend/app/api/v1/auth.py` | `GET /setup-status`, `POST /login`, `POST /setup` |

---

## 로그인 계정 (데모)

| 이메일 | 비밀번호 | 역할 |
|--------|---------|------|
| admin@gambleguard.kr | admin1234 | SUPER_ADMIN |
| teamlead@gambleguard.kr | admin1234 | ADMIN |
| operator@gambleguard.kr | admin1234 | OPERATOR |
| investigator@gambleguard.kr | admin1234 | INVESTIGATOR |
