#!/usr/bin/env node
/**
 * Slack 리스너 - 이벤트 기반 자동 실행
 *
 * 봇 메시지 스레드에 사용자 답글 감지 시 Claude Code headless 실행.
 * Claude 토큰 소비 0 (Node.js가 직접 Slack API 폴링).
 */

const { WebClient } = require("@slack/web-api");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ── .env 파싱 ──────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", "..", ".env");
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

// ── 설정 ───────────────────────────────────────────────────
const CONFIG = {
  botToken: process.env.SLACK_BOT_TOKEN,
  channelId: process.env.SLACK_CHANNEL,
  botUserId: process.env.SLACK_BOT_USER_ID,
  targetUserId: process.env.SLACK_TARGET_USER_ID,
  pollInterval: 30_000, // 30초
  projectDir: path.resolve(__dirname, "..", ".."),
  stateFile: path.resolve(__dirname, "..", "..", ".slack-listener-state.json"),
};

if (!CONFIG.botToken) {
  console.error("Error: SLACK_BOT_TOKEN is required in .env");
  process.exit(1);
}

const slack = new WebClient(CONFIG.botToken);

// ── 처리 상태 관리 (중복 실행 방지) ────────────────────────
function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, "utf-8"));
    }
  } catch {
    // ignore
  }
  return { processedReplies: [], lastCheck: null };
}

function saveState(state) {
  if (state.processedReplies.length > 200) {
    state.processedReplies = state.processedReplies.slice(-200);
  }
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

function isProcessed(state, ts) {
  return state.processedReplies.includes(ts);
}

function markProcessed(state, ts) {
  state.processedReplies.push(ts);
  saveState(state);
}


// ── Claude Code 실행 ───────────────────────────────────────
function runClaudeCode(prompt) {
  console.log(`[${new Date().toISOString()}] Claude Code 실행: ${prompt.slice(0, 80)}...`);

  // 프롬프트를 임시 파일로 저장 (Windows shell에서 긴 인자가 잘리는 문제 방지)
  const tmpFile = path.join(CONFIG.projectDir, `.tmp-prompt-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, prompt, "utf-8");

  const child = spawn(
    "claude",
    [
      "-p",
      "--allowedTools",
      "Read,Edit,Write,Bash,Glob,Grep,Agent,Skill,mcp__slack__slack_post_message,mcp__slack__slack_reply_to_thread",
    ],
    {
      cwd: CONFIG.projectDir,
      shell: true,
      stdio: [fs.openSync(tmpFile, "r"), "pipe", "pipe"],
      env: { ...process.env, CLAUDECODE: "" },
    }
  );

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (data) => { stdout += data.toString(); });
  child.stderr.on("data", (data) => { stderr += data.toString(); });

  child.on("close", (code) => {
    console.log(`[${new Date().toISOString()}] Claude Code 완료 (exit: ${code})`);
    if (stdout) console.log("stdout:", stdout.slice(0, 500));
    if (stderr && code !== 0) console.error("stderr:", stderr.slice(0, 500));
    // 임시 파일 정리
    try { fs.unlinkSync(tmpFile); } catch {}
  });

  child.on("error", (err) => {
    console.error(`[${new Date().toISOString()}] Claude Code 실행 오류:`, err.message);
    try { fs.unlinkSync(tmpFile); } catch {}
  });
}

// ── 프롬프트 생성 ──────────────────────────────────────────
function buildPrompt(replyText, parentText, threadTs) {
  const parentSummary = parentText.slice(0, 800);
  const channelId = CONFIG.channelId;

  return [
    `[프로젝트 컨텍스트]`,
    `프로젝트: illegalGambling-Search-AI (불법 도박 사이트 자동 검색/채증 시스템)`,
    `작업 디렉토리: ${CONFIG.projectDir}`,
    `기획 문서: docs/planning/ (service-concept.md, decisions.md, progress.md)`,
    `PRD 섹션: docs/PRD-sections/`,
    ``,
    `[Slack 컨텍스트]`,
    `채널 ID: ${channelId}`,
    `스레드 ts: ${threadTs}`,
    ``,
    `[원본 봇 메시지]`,
    parentSummary,
    ``,
    `[사용자 지시]`,
    replyText,
    ``,
    `[실행 요청]`,
    `사용자의 지시를 자연어로 이해하고 적절히 실행하세요.`,
    `- 승인/진행 요청이면 다음 단계를 진행`,
    `- 이메일 요청이면 backend/scripts/send-email.js를 사용하여 이메일 전송`,
    `- 구체적인 작업 지시면 해당 작업 수행`,
    `- 질문이면 답변`,
    ``,
    `[필수 지시사항]`,
    `1. 작업 완료 후 반드시 Slack 채널 ${channelId}의 스레드 ${threadTs}에 결과를 답글로 보내세요.`,
    `2. mcp__slack__slack_reply_to_thread 도구를 사용하세요. (channel: "${channelId}", thread_ts: "${threadTs}")`,
    `3. 답글은 한국어로 작성하세요.`,
  ].join("\n");
}


// ── 메인 폴링 루프 ────────────────────────────────────────
async function poll() {
  const state = loadState();

  try {
    const history = await slack.conversations.history({
      channel: CONFIG.channelId,
      limit: 15,
    });
    if (!history.ok || !history.messages) return;

    const botMessages = history.messages.filter(
      (m) => m.user === CONFIG.botUserId && m.reply_count > 0
    );
    if (botMessages.length === 0) return;

    for (const botMsg of botMessages) {
      try {
        const replies = await slack.conversations.replies({
          channel: CONFIG.channelId,
          ts: botMsg.ts,
        });
        if (!replies.ok || !replies.messages) continue;

        const userReplies = replies.messages.filter(
          (r) =>
            r.user === CONFIG.targetUserId &&
            r.ts !== botMsg.ts &&
            !isProcessed(state, r.ts)
        );

        for (const reply of userReplies) {
          const prompt = buildPrompt(reply.text || "", botMsg.text || "", botMsg.ts);
          console.log(
            `[${new Date().toISOString()}] 사용자 답글 감지! text="${(reply.text || "").slice(0, 80)}"`
          );
          runClaudeCode(prompt);
          markProcessed(state, reply.ts);
        }
      } catch (threadErr) {
        console.error(`Thread error (${botMsg.ts}):`, threadErr.message);
      }
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Poll error:`, err.message);
    if (err.data?.error === "ratelimited") {
      const retryAfter = (err.headers?.["retry-after"] || 60) * 1000;
      console.log(`Rate limited. Waiting ${retryAfter / 1000}s...`);
      await new Promise((r) => setTimeout(r, retryAfter));
    }
  }

  state.lastCheck = new Date().toISOString();
  saveState(state);
}

// ── 시작 ───────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════════════╗
║  Slack Listener Started                       ║
║  Channel: ${CONFIG.channelId}                    ║
║  Poll interval: ${CONFIG.pollInterval / 1000}s (Claude 토큰 소비 0)   ║
║  Target user: ${CONFIG.targetUserId}                ║
║  Bot user: ${CONFIG.botUserId}                   ║
╚═══════════════════════════════════════════════╝
`);

poll();
setInterval(poll, CONFIG.pollInterval);

process.on("SIGINT", () => { console.log("\nSlack Listener 종료."); process.exit(0); });
process.on("SIGTERM", () => { console.log("\nSlack Listener 종료."); process.exit(0); });
