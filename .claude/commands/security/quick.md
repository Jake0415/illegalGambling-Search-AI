---
description: '빠른 보안 스캔 - npm audit + ESLint Security 실행 후 결과 분석'
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

# Claude 명령어: Security Quick Scan

프로젝트의 빠른 보안 점검을 수행합니다 (약 3분).

## 사용법

```
/security:quick
```

## 프로세스

### 1단계: 의존성 취약점 스캔

```bash
cd frontend && npm audit --audit-level=moderate 2>&1
```

- 결과를 심각도별로 정리 (critical > high > moderate)
- 각 취약점의 영향 범위와 패치 가능 여부 분석

### 2단계: ESLint Security 정적 분석

```bash
cd frontend && npx eslint --no-error-on-unmatched-pattern "src/**/*.{ts,tsx}" 2>&1
```

- `eslint-plugin-security` 룰 위반 사항 정리
- eval, 코드 인젝션, 파일 시스템 위험 패턴 탐지

### 3단계: 하드코딩된 시크릿 패턴 탐지

Grep 도구로 다음 패턴을 `frontend/src/` 디렉토리에서 검색:

- `password\s*=\s*['"]` (하드코딩된 비밀번호)
- `(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9]` (API 키/토큰)
- `xoxb-|xoxp-|xapp-` (Slack 토큰)
- `sk-[A-Za-z0-9]{20,}` (OpenAI/Stripe 키)
- `AKIA[0-9A-Z]{16}` (AWS 키)

### 4단계: 결과 종합 보고

다음 형식으로 결과를 출력:

```
## 보안 스캔 결과 요약

### npm audit
- CRITICAL: N건
- HIGH: N건
- MODERATE: N건

### ESLint Security
- 위반 사항: N건
- 주요 이슈: ...

### 시크릿 탐지
- 발견된 패턴: N건
- 위치: ...

### 권장 조치
1. ...
2. ...
```

## 참고사항

- 이 스캔은 빠른 점검용입니다
- 전체 보안 감사는 `/security:full` 을 사용하세요
