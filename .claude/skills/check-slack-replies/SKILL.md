---
description: 'Slack 채널 전체에서 사용자 답글을 스캔하고, 지시에 따라 team-leader 에이전트를 호출합니다. /loop 5m /check-slack-replies 로 주기적 폴링 가능.'
allowed-tools:
  - 'Read'
  - 'Write'
  - 'Edit'
  - 'Agent'
  - 'mcp__slack__slack_get_channel_history'
  - 'mcp__slack__slack_get_thread_replies'
  - 'mcp__slack__slack_post_message'
---

# Slack 답글 확인 및 자동 실행

Slack 채널(C0AHUT40AE5) 전체에서 사용자(U0A9RNVL1FV)의 미처리 답글을 스캔하고, 답글 내용에 따라 team-leader 에이전트를 호출합니다.

## 사용법

```
/check-slack-replies
```

주기적 폴링:
```
/loop 5m /check-slack-replies
```

## 프로세스

### 1단계: 채널 전체에서 미처리 답글 스캔

1. `docs/planning/progress.md`를 읽어서 **마지막 처리 답글 ts** 확인
2. `mcp__slack__slack_get_channel_history`로 채널(C0AHUT40AE5)의 최근 메시지 20개 조회
3. `reply_count > 0`인 메시지를 모두 찾음
4. 각 스레드에서 `mcp__slack__slack_get_thread_replies`로 답글 조회
5. 사용자 **U0A9RNVL1FV**의 답글만 필터링 (봇 U0AKQN38QBH 및 다른 사용자 무시)
6. 마지막 처리 답글 ts 이후의 새 답글만 추출 (시간 비교)
7. 새 답글이 없으면 → "미처리 답글이 없습니다" 출력 후 종료

### 2단계: 답글 분류 및 실행

가장 최근 미처리 답글의 텍스트를 분석:

| 답글 내용 | 액션 |
|-----------|------|
| "승인", "확인", "진행", "OK", "ㅇㅋ" 등 승인 계열 | team-leader 에이전트 호출 → 다음 단계 바로 진행 |
| "이메일", "email", "메일로 보내" 포함 | team-leader 에이전트 호출 → 해당 보고 내용을 HTML 이메일로 yhk71261@gmail.com 전송 (승인 요청 미포함, 보고서만) |
| 기타 구체적 지시 | team-leader 에이전트 호출 → 원본 메시지와 답글 내용을 함께 전달하여 해당 작업 즉시 실행 |

### 3단계: 처리 기록

1. `docs/planning/progress.md`의 **마지막 처리 답글 ts**를 방금 처리한 답글의 ts로 업데이트
2. 중복 실행 방지를 위해 반드시 기록

## team-leader 에이전트 호출 형식

### 승인 시:
```
team-leader 에이전트를 호출하여 다음 단계를 진행하세요.
현재 상태는 docs/planning/progress.md를 참조하세요.
사용자가 Slack에서 "승인"했습니다.
```

### 이메일 전송 시:
```
team-leader 에이전트를 호출하여 현재 보고 내용을 HTML 이메일로 전송하세요.
수신자: yhk71261@gmail.com
이메일에는 승인 요청을 포함하지 마세요 — 순수 보고서만 전송합니다.
원본 메시지: "{스레드 부모 메시지 텍스트}"
```

### 기타 지시 시:
```
team-leader 에이전트를 호출하여 다음 사용자 지시를 실행하세요:
- 원본 메시지: "{스레드 부모 메시지 텍스트}"
- 사용자 지시: "{답글 텍스트 그대로}"
```

## 규칙

- 사용자(U0A9RNVL1FV)의 답글만 처리 — 봇(U0AKQN38QBH) 메시지나 다른 사용자 답글 무시
- **채널의 모든 메시지 스레드를 스캔** — 특정 Gate Review 메시지에 한정하지 않음
- 미처리 답글이 여러 개면 가장 오래된 것부터 순서대로 처리
- 답글 처리 후 반드시 progress.md의 마지막 처리 답글 ts 업데이트
- team-leader 에이전트에게 재확인 요청하지 않도록 명시
- 원본 메시지(스레드 부모) 내용을 team-leader에게 항상 함께 전달
