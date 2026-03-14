#!/usr/bin/env node
/**
 * Slack 테스트 메시지 전송 스크립트
 *
 * Usage:
 *   node scripts/slack-test-message.js                     # 기본 Gate Review 메시지
 *   node scripts/slack-test-message.js "커스텀 메시지"      # 사용자 지정 메시지
 *   node scripts/slack-test-message.js --delete <ts>       # 메시지 삭제
 */

const { WebClient } = require("@slack/web-api");
const fs = require("fs");
const path = require("path");

// .env 파싱
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env file not found at", envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_CHANNEL;

if (!token || !channel) {
  console.error("Error: SLACK_BOT_TOKEN and SLACK_CHANNEL are required in .env");
  process.exit(1);
}

const slack = new WebClient(token);

const DEFAULT_MESSAGE = `[Gate Review] Plan 2 PRD Phase A 완료 보고

✅ 완료 항목:
- 01-overview-and-stories.md: 4개 페르소나, 17개 사용자 스토리
- 02-evidence-collection-engine.md: 42개 요구사항
- 03-sms-authentication.md: 31개 요구사항
- 04-evidence-integrity.md: 25개 요구사항
- 05-detection-engine.md: 30개 요구사항

📊 총 145개 기능 요구사항 작성 완료

다음 단계: Phase B (대시보드/API/데이터모델 작성, 교차 검토, 최종 PRD 통합)

승인 또는 지시사항을 답글로 달아주세요.`;

async function main() {
  const args = process.argv.slice(2);

  // --delete <ts> 모드
  if (args[0] === "--delete" && args[1]) {
    try {
      const result = await slack.chat.delete({ channel, ts: args[1] });
      console.log(result.ok ? `삭제 완료: ${args[1]}` : `삭제 실패: ${result.error}`);
    } catch (err) {
      console.error("삭제 오류:", err.message);
    }
    return;
  }

  // 메시지 전송
  const text = args.join(" ") || DEFAULT_MESSAGE;
  try {
    const result = await slack.chat.postMessage({ channel, text });
    if (result.ok) {
      console.log(`전송 완료! ts: ${result.ts}`);
      console.log(`채널: ${channel}`);
    } else {
      console.error("전송 실패:", result.error);
    }
  } catch (err) {
    console.error("전송 오류:", err.message);
  }
}

main();
