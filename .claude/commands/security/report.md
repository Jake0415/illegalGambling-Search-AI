---
description: '보안 리포트 생성 - OWASP Top 10 기준 Markdown 보고서 파일 생성'
allowed-tools:
  [
    'Bash(npm audit:*)',
    'Bash(npx eslint:*)',
    'Bash(cd:*)',
    'Bash(mkdir:*)',
    'Bash(date:*)',
    'Read',
    'Write',
    'Glob',
    'Grep',
  ]
---

# Claude 명령어: Security Report

보안 감사 결과를 Markdown 파일로 저장합니다.

## 사용법

```
/security:report
```

## 프로세스

### 1단계: 전체 보안 감사 수행

`/security:full` 과 동일한 전체 감사를 수행합니다.

### 2단계: 리포트 파일 생성

리포트를 `docs/security/` 디렉토리에 날짜 기반 파일명으로 저장합니다.

```bash
mkdir -p docs/security
```

파일명: `docs/security/report-YYYY-MM-DD.md`

### 3단계: 리포트 내용 작성

Write 도구로 다음 구조의 Markdown 파일 생성:

```markdown
# 보안 감사 리포트

- **프로젝트**: illegalGambling-Search-AI
- **날짜**: YYYY-MM-DD
- **감사 도구**: ESLint Security, npm audit, Claude AI 코드 분석
- **감사 범위**: frontend/src/ 전체

## 요약

| 심각도 | 건수 | 상태 |
|--------|------|------|
| CRITICAL | N | ... |
| HIGH | N | ... |
| MEDIUM | N | ... |
| LOW | N | ... |

## OWASP Top 10 점검 결과

### A01: Broken Access Control
- 상태: PASS / FAIL / N/A
- 발견 사항: ...
- 권장 조치: ...

### A02: Cryptographic Failures
...

### A03: Injection
...

(A04~A10 동일 구조)

## 의존성 취약점 상세

npm audit 결과 전체 기록

## ESLint Security 위반 상세

위반 사항 전체 목록

## 이전 리포트 대비 변화

(이전 리포트가 존재하면 비교)
- 신규 발견: N건
- 해결됨: N건
- 미해결: N건

## 권장 조치 우선순위

1. [CRITICAL] ...
2. [HIGH] ...
3. ...
```

### 4단계: 이전 리포트 비교 (선택)

`docs/security/` 디렉토리에 이전 리포트가 존재하면:

1. 가장 최근 리포트를 Read로 읽기
2. 이전 발견 사항과 현재 결과 비교
3. "이전 리포트 대비 변화" 섹션 작성

### 5단계: 결과 출력

- 리포트 파일 경로 출력
- 요약 테이블 터미널에 출력
- CRITICAL/HIGH 이슈가 있으면 즉시 조치 필요 강조

## 참고사항

- 이 리포트는 Git에 커밋하여 보안 이력을 추적하세요
- 빠른 점검만 필요하면 `/security:quick` 을 사용하세요
