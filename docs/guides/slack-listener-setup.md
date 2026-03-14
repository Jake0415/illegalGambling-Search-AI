# Slack 리스너 설정 가이드

Slack 채널의 봇 메시지 스레드에 사용자가 답글을 달면 Claude Code를 자동 실행하는 이벤트 기반 시스템.

## 개요

| 항목 | 설명 |
|------|------|
| **방식** | Node.js가 Slack Web API를 30초 간격으로 직접 폴링 |
| **Claude 토큰 소비** | 0 (사용자 답글 감지 시에만 `claude -p` spawn) |
| **상주 방식** | PM2 데몬 (PC 재시작 전까지 영구 실행) |
| **답글 처리** | 자연어 지시 → Claude가 의도를 파악하여 자동 실행 |

## 사전 요구사항

- Node.js 18+
- Slack Bot Token (`xoxb-...`) — Slack App에서 발급
- Slack 채널 ID, 봇 User ID, 대상 사용자 User ID
- Claude Code CLI가 PATH에 등록되어 있을 것

## 1. 패키지 설치

```bash
npm install @slack/web-api
```

## 2. 환경변수 설정 (.env)

프로젝트 루트에 `.env` 파일을 생성/수정:

```env
## Slack API 설정
SLACK_BOT_TOKEN=xoxb-YOUR-BOT-TOKEN
SLACK_CHANNEL=C0AHUT40AE5
SLACK_BOT_USER_ID=U0AKQN38QBH
SLACK_TARGET_USER_ID=U0A9RNVL1FV
```

| 변수 | 설명 | 확인 방법 |
|------|------|----------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | Slack App > OAuth & Permissions |
| `SLACK_CHANNEL` | 감시할 채널 ID | Slack 채널 우클릭 > 채널 세부정보 > 하단 ID |
| `SLACK_BOT_USER_ID` | 봇의 User ID | Slack에서 봇 프로필 클릭 > Member ID |
| `SLACK_TARGET_USER_ID` | 답글을 감지할 사용자 ID | Slack에서 사용자 프로필 클릭 > Member ID |

## 3. 리스너 스크립트

`scripts/slack-listener.js`에 위치합니다. 소스 코드를 직접 참조하세요.

## 4. PM2 설정

`ecosystem.config.js` 파일을 프로젝트 루트에 생성:

```javascript
module.exports = {
  apps: [
    {
      name: "slack-listener",
      script: "scripts/slack-listener.js",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/slack-listener-error.log",
      out_file: "logs/slack-listener-out.log",
      merge_logs: true,
    },
  ],
};
```

## 5. .gitignore 추가

```gitignore
# Slack listener state
.slack-listener-state.json

# PM2 logs
/logs
```

## 6. 실행

```bash
# logs 디렉토리 생성
mkdir -p logs

# PM2로 백그라운드 실행
npx pm2 start ecosystem.config.js

# 상태 확인
npx pm2 status

# 실시간 로그 확인
npx pm2 logs

# 재시작
npx pm2 restart slack-listener

# 중지
npx pm2 stop slack-listener

# 삭제
npx pm2 delete slack-listener
```

## 동작 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [30초마다]                                                  │
│  Node.js → Slack API (conversations.history)                │
│         → 봇 메시지 중 reply_count > 0 필터                  │
│         → Slack API (conversations.replies)                  │
│         → 사용자(TARGET_USER_ID) 답글만 필터                  │
│         → 미처리 답글 발견 시:                                │
│                                                             │
│         → claude -p (자연어 프롬프트)                         │
│           - 원본 봇 메시지 + 사용자 답글 전달                  │
│           - Claude가 의도를 파악하여 적절히 실행               │
│                                                             │
│  처리 완료 → .slack-listener-state.json에 기록 (중복 방지)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 자연어 지시

키워드 매칭 없이 **모든 봇 메시지의 스레드**를 감시합니다.
사용자가 자연어로 자유롭게 답글을 달면 Claude가 의도를 파악하여 실행합니다.

예시:
- "커밋하고 push 해줘" → git commit + push 실행
- "다음 단계 진행해" → 다음 Phase 작업 시작
- "이메일로 보내줘" → HTML 이메일 전송
- "현재 진행 상황 알려줘" → 상태 보고

## 커스터마이징

### 폴링 간격 변경

`scripts/slack-listener.js`의 `CONFIG.pollInterval` 수정:

```javascript
pollInterval: 30_000,  // 30초 (기본값)
pollInterval: 10_000,  // 10초 (더 빠른 응답)
pollInterval: 60_000,  // 60초 (API 호출 절약)
```

### Claude Code 허용 도구 변경

`runClaudeCode()` 함수의 `--allowedTools` 수정:

```javascript
spawn("claude", [
  "-p", prompt,
  "--allowedTools", "Read,Edit,Write,Bash,Glob,Grep,Agent,Skill,YOUR_TOOLS",
], ...);
```

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `Error: SLACK_BOT_TOKEN is required` | .env 파일 없거나 토큰 미설정 | .env 파일 확인 |
| `not_in_channel` 에러 | 봇이 채널에 참여하지 않음 | Slack에서 봇을 채널에 초대 |
| `ratelimited` 에러 | Slack API 호출 한도 초과 | 자동 대기 후 재시도 (스크립트 내장) |
| Claude Code 실행 안 됨 | claude CLI가 PATH에 없음 | `which claude`로 확인, PATH 등록 |
| PM2 재시작 반복 | 스크립트 에러 | `npx pm2 logs`로 에러 확인 |

## Socket Mode 업그레이드 (향후)

현재는 HTTP 폴링 방식이지만, 더 즉각적인 응답이 필요하면 Slack Socket Mode로 업그레이드 가능:

1. Slack App 콘솔 > Settings > Socket Mode 활성화
2. App-Level Token 발급 (scope: `connections:write`)
3. `npm install @slack/bolt`
4. Bolt 기반 WebSocket 리스너로 교체

Socket Mode는 서버/도메인/ngrok 없이 WebSocket으로 이벤트를 즉시 수신하므로 폴링 자체가 불필요해집니다.
