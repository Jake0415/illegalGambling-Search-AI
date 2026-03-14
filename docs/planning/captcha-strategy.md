# CAPTCHA 대응 전략 — 실제 채증 플로우 분석

> 작성일: 2026-03-14

---

## 1. 문제 정의

불법 도박 사이트에서 **실제 회원가입 → 배팅화면 진입**까지 자동화할 때 CAPTCHA와 SMS OTP가 주요 장벽이다.

### 실제 테스트 결과 (2026-03-14)

> **핵심 발견: CAPTCHA보다 SMS OTP 인증이 실제 최대 장벽**

| 장벽 | 실제 빈도 | 난이도 | 우선순위 |
|------|----------|--------|---------|
| **SMS OTP 인증** | 거의 모든 사이트 필수 | **최상** | **1순위** |
| **도메인 호핑** | 6개 중 4개 접속 불가 | 상 | 2순위 |
| 팝업/광고 차단 | 접속 시 다수 출현 | 중 | 3순위 |
| Cloudflare/JS Challenge | 일부 사이트 | 중 (자동 통과 가능) | 4순위 |
| CAPTCHA (reCAPTCHA 등) | 예상보다 적음 | 상 | 5순위 |

### CAPTCHA 출현 시점 (이론적)

| 출현 시점 | CAPTCHA 유형 | 난이도 |
|-----------|-------------|--------|
| 사이트 첫 접속 | Cloudflare Turnstile, JS Challenge | 중 |
| 회원가입 폼 | reCAPTCHA v2, hCaptcha, 이미지 CAPTCHA | 상 |
| 로그인 | reCAPTCHA v2, 숫자/문자 CAPTCHA | 중 |
| 배팅 페이지 진입 | 간헐적 (행동 기반 트리거) | 중~상 |

---

## 2. CAPTCHA 통과 방식 — 3단계 하이브리드 전략

### 전략 개요

```
[CAPTCHA 감지]
     ↓
[1차: 자동 풀이 시도] ← CapSolver API (AI 기반, 3~9초)
     ↓ 실패 시
[2차: 보조 솔버 시도] ← 2Captcha (사람 기반, 10~60초)
     ↓ 실패 시
[3차: 수동 개입 요청] ← 테스트 앱에서 사용자가 직접 풀기
```

### 2.1 자동 풀이 — CapSolver API (1차)

**방식**: AI 기반 CAPTCHA 인식·풀이

| CAPTCHA 유형 | 처리 시간 | 비용 (1,000건) | 성공률 |
|-------------|----------|---------------|--------|
| reCAPTCHA v2 | 3~9초 | $0.80 | 95%+ |
| reCAPTCHA v3 | 즉시 | $1.00 | 99% |
| hCaptcha | 3~12초 | $0.80 | 90%+ |
| Cloudflare Turnstile | 1~5초 | $1.20 | 95%+ |
| 이미지-텍스트 | 1~3초 | $0.40 | 98% |

**Playwright 연동 방식 2가지**:

#### A. Token 모드 (API 직접 호출) — 권장
```javascript
// 1. CAPTCHA 파라미터 추출 (sitekey 등)
const sitekey = await page.getAttribute('[data-sitekey]', 'data-sitekey');

// 2. CapSolver API로 토큰 획득
const response = await capsolver.createTask({
  type: 'ReCaptchaV2TaskProxyLess',
  websiteURL: page.url(),
  websiteKey: sitekey,
});

// 3. 토큰을 페이지에 주입
await page.evaluate((token) => {
  document.getElementById('g-recaptcha-response').value = token;
}, response.solution.gRecaptchaResponse);

// 4. 폼 제출
await page.click('button[type="submit"]');
```

#### B. 브라우저 확장 모드 (Click 모드)
```javascript
// CapSolver 확장 프로그램을 Playwright 컨텍스트에 로드
const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${capsolverExtPath}`,
    `--load-extension=${capsolverExtPath}`,
  ],
});
// 확장이 CAPTCHA를 자동 감지하고 클릭으로 풀이
```

### 2.2 보조 솔버 — 2Captcha (2차 폴백)

**방식**: AI 실패 시 사람이 직접 풀이

| 항목 | 값 |
|------|-----|
| 처리 시간 | 10~60초 |
| 비용 | $1~3/1,000건 |
| 정확도 | 99% (사람 풀이) |
| 지원 유형 | 거의 모든 CAPTCHA |

CapSolver가 실패할 때만 호출하여 비용 최적화.

### 2.3 수동 개입 — "Pause & Attach" 패턴 (3차)

**핵심: 2026년 Playwright의 "Pause and Attach" 패턴**

자동 풀이가 모두 실패하면, **테스트 앱에서 사용자가 직접 CAPTCHA를 풀 수 있는 UI**를 제공한다.

#### 구현 방식: CDP(Chrome DevTools Protocol) 원격 연결

```
[자동화 봇이 CAPTCHA 감지]
     ↓
[브라우저 세션을 일시 정지]
     ↓
[테스트 앱(Next.js 대시보드)에 알림 전송]
  → "CAPTCHA 수동 풀이 필요 — 사이트: xxx.com"
  → 라이브 브라우저 화면을 대시보드에 스트리밍
     ↓
[사용자가 대시보드에서 직접 CAPTCHA 풀기]
  → CDP를 통해 원격 브라우저에 마우스/키보드 입력 전달
     ↓
[CAPTCHA 풀림 감지 → 자동화 재개]
```

#### 기술 구현

```javascript
// 1. 디버깅 포트 열고 브라우저 실행
const browser = await chromium.launch({
  headless: false,
  args: ['--remote-debugging-port=9222'],
});

// 2. CAPTCHA 감지 시 → 대시보드에 WebSocket으로 알림
if (await detectCaptcha(page)) {
  await notifyDashboard({
    type: 'CAPTCHA_MANUAL_REQUIRED',
    sessionId: session.id,
    siteUrl: page.url(),
    cdpEndpoint: 'ws://localhost:9222',
    screenshot: await page.screenshot(),  // 현재 화면 미리보기
  });

  // 3. CAPTCHA가 풀릴 때까지 대기 (타임아웃 5분)
  await waitForCaptchaSolved(page, { timeout: 300000 });
}

// 4. CAPTCHA 풀림 → 자동화 재개
await continueAutomation(page);
```

#### 대시보드 UI (Next.js)

```
┌─────────────────────────────────────────────┐
│  🔴 CAPTCHA 수동 풀이 대기 중               │
│                                              │
│  사이트: https://xxx-betting.com             │
│  유형: reCAPTCHA v2 (이미지 선택)            │
│  대기 시간: 00:42                            │
│                                              │
│  ┌─────────────────────────────────┐         │
│  │                                 │         │
│  │  [원격 브라우저 화면 스트리밍]    │         │
│  │  사용자가 직접 클릭하여 풀이     │         │
│  │                                 │         │
│  └─────────────────────────────────┘         │
│                                              │
│  [건너뛰기]  [타임아웃 연장]  [세션 종료]     │
└─────────────────────────────────────────────┘
```

---

## 3. 실제 채증 플로우 (CAPTCHA 포함)

```
[1] 사이트 접속
     ↓
[2] Cloudflare/JS Challenge 감지?
     ├─ Yes → 자동 대기 (stealth 플러그인으로 통과 시도)
     │        ├─ 통과 → [3]으로
     │        └─ 실패 → CapSolver Turnstile API → [3]으로
     └─ No  → [3]으로
     ↓
[3] 메인화면 캡처 (1단계 채증) ✅
     ↓
[4] 회원가입 페이지 진입
     ↓
[5] 가입 폼 입력 (이름, ID, 비밀번호, 전화번호)
     ↓
[6] SMS 인증 (GrizzlySMS 가상번호)
     ↓
[7] CAPTCHA 감지?
     ├─ Yes → [하이브리드 3단계 전략]
     │        ├─ 1차: CapSolver (3~9초, $0.8/1K)
     │        ├─ 2차: 2Captcha (10~60초, $1~3/1K)
     │        └─ 3차: 대시보드 수동 풀이 (사용자 개입)
     └─ No  → [8]로
     ↓
[8] 회원가입 완료 → 로그인
     ↓
[9] 배팅 메뉴 진입 → 배팅시작 화면 캡처 (2단계 채증) ✅
     ↓
[10] 배팅 종목 선택 → 배당률 확인
     ↓
[11] CAPTCHA 감지? (배팅 페이지에서 간헐적 출현)
     ├─ Yes → [하이브리드 3단계 전략]
     └─ No  → [12]로
     ↓
[12] 배팅 화면 캡처 (3단계 채증) ✅
     ↓
[13] 증거 패키징 (해시, 타임스탬프, 메타데이터)
```

---

## 4. CAPTCHA 출현 최소화 전략 (예방)

자동 풀이보다 **CAPTCHA가 아예 안 나오게 하는 것**이 비용·시간 면에서 최선이다.

| 전략 | 구현 방법 | 효과 |
|------|----------|------|
| **Stealth 플러그인** | `playwright-extra` + `stealth` 플러그인 | navigator.webdriver 숨김, WebGL 패치 |
| **레지덴셜 프록시** | IPRoyal/SOAX 레지덴셜 IP 사용 | 데이터센터 IP 차단 우회 |
| **행동 시뮬레이션** | 마우스 이동, 스크롤, 타이핑 딜레이 | 봇 탐지 점수 낮춤 |
| **쿠키/세션 재활용** | 이전 세션 쿠키 저장·복원 | 재방문 시 신뢰도 향상 |
| **브라우저 프로필** | Canvas, WebGL, 폰트 핑거프린트 다양화 | 동일 봇 식별 방지 |
| **요청 간격 랜덤화** | 2~8초 랜덤 딜레이 | 자동화 패턴 탐지 회피 |

---

## 5. 비용 분석

### 월간 예상 (사이트 500건 채증 기준)

| 항목 | 단가 | 예상 건수 | 월 비용 |
|------|------|----------|---------|
| CapSolver (1차) | $0.80/1K | ~1,500건 (사이트당 3회) | ~$1.20 |
| 2Captcha (2차 폴백) | $2.50/1K | ~150건 (10% 폴백) | ~$0.38 |
| 수동 풀이 (3차) | 인건비 | ~15건 (1% 수동) | 인건비 |
| **CAPTCHA 합계** | | | **~$1.58 + 인건비** |

CAPTCHA 비용은 전체 운영비의 극히 일부. **진짜 비용은 SMS 인증($100~300)과 프록시($100~500)**.

---

## 6. 테스트 앱 수동 개입 UI 요구사항

### 6.1 대시보드 페이지: `/investigations/captcha-queue`

| 기능 | 설명 |
|------|------|
| **대기 큐 목록** | CAPTCHA 수동 풀이 대기 중인 세션 목록 |
| **원격 브라우저 뷰어** | CDP WebSocket을 통한 실시간 브라우저 화면 |
| **마우스/키보드 전달** | 사용자 입력을 원격 브라우저에 전달 |
| **타임아웃 표시** | 남은 대기 시간 (기본 5분) |
| **건너뛰기** | 해당 사이트 채증을 스킵 |
| **알림** | 새 CAPTCHA 대기 시 브라우저 알림 + Slack 알림 |

### 6.2 모바일 대응

- **푸시 알림**: CAPTCHA 대기 발생 시 모바일 푸시 (Slack 또는 웹 푸시)
- **모바일 반응형**: 대시보드가 모바일에서도 CAPTCHA 풀이 가능
- **간단한 CAPTCHA**: 이미지 선택형은 모바일 터치로 풀이 가능

### 6.3 동시 세션 관리

```
┌─────────────────────────────────────────────┐
│  📋 CAPTCHA 수동 풀이 큐 (3건 대기 중)      │
│                                              │
│  🔴 xxx-bet.com    reCAPTCHA v2   대기 2:31  │
│  🟡 yyy-horse.net  이미지 CAPTCHA  대기 0:45  │
│  🟢 zzz-toto.com   hCaptcha       대기 0:12  │
│                                              │
│  [xxx-bet.com 풀기]                          │
└─────────────────────────────────────────────┘
```

---

## 7. 기술 스택 요약

| 구성요소 | 기술 | 용도 |
|----------|------|------|
| CAPTCHA 자동 풀이 | CapSolver API | reCAPTCHA, hCaptcha, Turnstile |
| CAPTCHA 폴백 | 2Captcha API | 자동 풀이 실패 시 사람 풀이 |
| 수동 풀이 UI | Next.js + WebSocket + CDP | 대시보드에서 원격 브라우저 제어 |
| 봇 탐지 회피 | playwright-extra + stealth | CAPTCHA 출현 자체를 줄임 |
| 알림 | Slack + Web Push API | CAPTCHA 대기 시 즉시 알림 |
