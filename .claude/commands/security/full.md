---
description: '전체 보안 감사 - OWASP Top 10 기준 종합 보안 점검'
allowed-tools:
  [
    'Bash(npm audit:*)',
    'Bash(npx eslint:*)',
    'Bash(cd:*)',
    'Read',
    'Glob',
    'Grep',
  ]
---

# Claude 명령어: Security Full Audit

OWASP Top 10 기준으로 프로젝트 전체 보안 감사를 수행합니다 (약 10분).

## 사용법

```
/security:full
```

## 프로세스

### 1단계: 의존성 취약점 (OWASP A06: Vulnerable Components)

```bash
cd frontend && npm audit 2>&1
```

- 모든 심각도 취약점 목록화
- 업데이트 가능 여부 분석

### 2단계: ESLint Security 정적 분석 (OWASP A03: Injection)

```bash
cd frontend && npx eslint --no-error-on-unmatched-pattern "src/**/*.{ts,tsx}" 2>&1
```

### 3단계: 시크릿 노출 탐지 (OWASP A02: Cryptographic Failures)

Grep으로 프로젝트 전체에서 시크릿 패턴 검색:

- 하드코딩된 비밀번호, API 키, 토큰
- `.env` 파일 Git 추적 여부 확인
- `.gitignore`에 민감 파일 포함 여부 확인

### 4단계: 인증/인가 점검 (OWASP A01: Broken Access Control)

API 라우트 파일들을 Read로 확인:

- `frontend/src/app/api/**/route.ts` 전체 검사
- `withAuth()`, `withRole()` 미들웨어 적용 여부
- 인증 없이 접근 가능한 엔드포인트 목록화
- Server Actions에 권한 검증 존재 여부

### 5단계: 입력 검증 점검 (OWASP A03: Injection)

API 라우트에서 Zod 스키마 검증 적용 여부 확인:

- `request.json()` 후 Zod `.parse()` 또는 `.safeParse()` 호출 여부
- URL 파라미터 검증 여부
- SQL 인젝션 위험 (raw query 사용 여부)
- `dangerouslySetInnerHTML` 사용 여부

### 6단계: 보안 헤더 점검 (OWASP A05: Security Misconfiguration)

`frontend/next.config.ts` 파일을 Read로 확인:

- **필수 헤더 체크리스트:**
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Strict-Transport-Security` (HSTS)
  - [ ] `Content-Security-Policy` (CSP)
  - [ ] `Permissions-Policy`
  - [ ] `X-XSS-Protection: 0` (최신 브라우저는 CSP로 대체)

### 7단계: CSRF 보호 점검 (OWASP A01)

- Server Actions의 CSRF 토큰 자동 포함 확인
- API Route의 CSRF 보호 미들웨어 확인
- SameSite 쿠키 설정 확인

### 8단계: XSS 취약점 점검 (OWASP A03)

Grep으로 위험 패턴 검색:

- `dangerouslySetInnerHTML` 사용처
- `eval()`, `Function()`, `setTimeout(string)` 사용처
- 사용자 입력이 직접 렌더링되는 곳
- URL 파라미터를 그대로 출력하는 곳

### 9단계: SSRF 점검 (OWASP A10: Server-Side Request Forgery)

- 사용자 입력 URL로 서버 측 요청을 보내는 코드 검색
- URL 화이트리스트/블랙리스트 적용 여부
- 내부 네트워크 접근 차단 여부

### 10단계: 종합 보고서 생성

다음 형식으로 결과 출력:

```
# OWASP Top 10 보안 감사 결과

## 요약
| 항목 | 상태 | 심각도 | 발견 건수 |
|------|------|--------|----------|
| A01: Broken Access Control | ... | ... | ... |
| A02: Cryptographic Failures | ... | ... | ... |
| A03: Injection | ... | ... | ... |
| A05: Security Misconfiguration | ... | ... | ... |
| A06: Vulnerable Components | ... | ... | ... |
| A10: SSRF | ... | ... | ... |

## 상세 발견 사항

### CRITICAL (즉시 조치 필요)
1. ...

### HIGH (1주 내 조치)
1. ...

### MEDIUM (1개월 내 조치)
1. ...

### LOW (개선 권장)
1. ...

## 권장 조치 우선순위
1. ...
2. ...
3. ...
```

## 참고사항

- 전체 감사 결과를 리포트로 저장하려면 `/security:report` 를 사용하세요
- 빠른 점검만 필요하면 `/security:quick` 을 사용하세요
