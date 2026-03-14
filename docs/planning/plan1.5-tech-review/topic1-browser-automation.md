# Topic 1: 브라우저 자동화 도구 검토

> 작성일: 2026-03-14
> 담당: browser-automation-specialist

## 1. Playwright 생태계 확장

### 1.1 playwright-extra / stealth plugin

**개요**: `playwright-extra`는 Puppeteer-extra의 플러그인 시스템을 Playwright에 적용한 모듈형 프레임워크이다. `puppeteer-extra-plugin-stealth`을 Playwright에서도 사용할 수 있도록 해준다.

**설치**:
```bash
npm install playwright-extra puppeteer-extra-plugin-stealth
```

**스텔스 패치 목록** (puppeteer-extra-plugin-stealth):
| 패치 | 설명 |
|------|------|
| `navigator.webdriver` | ES6 Proxy로 `navigator.webdriver` 속성 삭제/위장 |
| `user-agent-override` | 스텔스 UA 문자열, 언어, 플랫폼 설정 |
| `navigator.vendor` | `navigator.vendor` 값 커스텀 오버라이드 |
| `iframe.contentWindow` | HEADCHR_iframe 탐지 우회 (window.top, frameElement 수정) |
| `media.codecs` | 실제 Chrome이 지원하는 코덱으로 위장 |
| `navigator.hardwareConcurrency` | 논리 프로세서 수를 4로 설정 |
| `navigator.languages` | 커스텀 언어 목록 설정 |
| `navigator.permissions` | 권한 API 위장 |
| `navigator.plugins` | 플러그인 목록 위장 |
| `window.chrome` | chrome 객체 존재 위장 |
| `webgl.vendor` | WebGL 렌더러/벤더 정보 위장 |

**장점**:
- npm 주간 다운로드 45만+ (활발한 커뮤니티)
- TypeScript 네이티브 지원
- Playwright와 호환되는 대부분의 puppeteer-extra 플러그인 사용 가능

**한계**:
- **마지막 업데이트 2022년** -- 최신 안티봇 탐지 기법에 대응 부족
- **Runtime.Enable CDP 누출 미해결**: 현대 안티봇(Cloudflare, DataDome)이 탐지하는 `Runtime.Enable` CDP 명령 호출 패턴을 차단하지 못함
- 페이지 레벨 JavaScript 패치만 적용 (브라우저 레벨 패치 없음)

**우리 프로젝트 적합성**: 중간. Cloudflare JS Challenge 수준은 통과 가능하나, DataDome/PerimeterX 등 고급 안티봇에는 부족할 수 있음.

---

### 1.2 rebrowser-patches / rebrowser-playwright

**개요**: `rebrowser-patches`는 Puppeteer/Playwright 소스 코드를 직접 패치하여 자동화 탐지를 회피하는 브라우저 레벨 패치 모음이다. `rebrowser-playwright`는 이 패치가 적용된 Playwright의 드롭인 대체품이다.

**핵심 기술 차별점**:
- **Runtime.Enable 우회**: Playwright/Puppeteer는 실행 컨텍스트 관리를 위해 `Runtime.Enable` CDP 명령을 사용하는데, Cloudflare/DataDome 등 주요 안티봇이 이 명령 사용을 탐지함. rebrowser-patches는 이를 완전히 제거하고 격리된 ExecutionContext에서 JavaScript를 실행
- **소스 레벨 패치**: 페이지 레벨 JS 패치가 아닌 브라우저 런타임 자체를 수정
- **온디맨드 활성화/비활성화**: 패치를 필요에 따라 적용/해제 가능

**설치**:
```bash
npm install rebrowser-playwright
# 또는 기존 playwright에 패치 적용
npx rebrowser-patches patch --packageName playwright-core
```

**검증 결과**:
- Cloudflare: 통과
- DataDome: 통과
- rebrowser-bot-detector 자체 테스트: 모든 항목 통과

**장점**:
- 현재 가장 효과적인 안티봇 우회 방식
- 드롭인 대체 (기존 코드 변경 불필요)
- 활발한 유지보수 (2025년 5월 v1.52.0 릴리스)
- 무료/오픈소스

**한계**:
- Playwright 버전 업데이트 시 패치 재적용 필요
- TLS/JA3 핑거프린팅은 별도 대응 필요
- Canvas/WebGL 핑거프린팅 위장은 포함되지 않음

**우리 프로젝트 적합성**: 매우 높음. CDP "Pause & Attach" 패턴과 완전 호환되며, 무료이고 기존 Playwright 코드에 즉시 적용 가능.

---

## 2. 안티디텍트 브라우저

### 2.1 비교 표

| 항목 | Nstbrowser | Multilogin | GoLogin | MoreLogin |
|------|-----------|------------|---------|-----------|
| **시작 가격** | 무료 (10프로필) / Pro $29.90/월 | 트라이얼 &#8364;1.99 (3일) / Solo &#8364;9/월 | 무료 (3프로필) / Pro $9/월 | 무료 (2프로필) / Pro $9/월 |
| **프로필 수 (최대)** | 무제한 (Enterprise) | 1,000 | 10,000 (Custom) | 2,000+ |
| **Canvas 위장** | O | O | O | O |
| **WebGL 위장** | O | O | O | O |
| **폰트 핑거프린트** | O | O | O | O |
| **TLS JA3/JA4** | 실제 브라우저 스택 사용 | 실제 브라우저 네트워크 스택 | 부분적 | 부분적 |
| **Playwright 지원** | O (CDP 엔드포인트) | O (API-first 설계) | O (npm 패키지) | X (API 미제공) |
| **Selenium 지원** | O | O | O | O |
| **Puppeteer 지원** | O | O | O | O |
| **팀 협업** | O (유료) | O (Business) | O (Business+) | O (유료) |
| **클라우드 프로필** | O | O | O | O |
| **한국어 로케일** | O (시스템 로케일 설정) | O | O | O |

### 2.2 CDP/Playwright 호환성

**Nstbrowser**:
- CDP 엔드포인트 API를 통해 Playwright, Puppeteer, Selenium 연결 지원
- WebSocket 기반 CDP 연결로 자동화 프레임워크 통합
- API-first 설계로 프로그래밍 방식의 프로필 생성/관리 가능
- **CDP "Pause & Attach" 패턴 호환**: CDP 엔드포인트를 통해 실행 중인 브라우저에 연결/해제 가능

**Multilogin**:
- API-first 접근으로 Selenium, Puppeteer, Playwright와 통합
- 프로그래밍 방식으로 프로필 생성, 작업 자동화, 복잡한 워크플로우 구축 가능
- 모든 Pro 플랜에서 API 접근 포함
- **CDP "Pause & Attach" 패턴 호환**: WebSocket CDP를 통한 브라우저 연결 지원

**GoLogin**:
- npm 패키지(`gologin`)를 통한 Node.js 연동
- REST API로 프로필 생성/관리/실행/중지
- Selenium, Puppeteer, Playwright 등 자동화 도구 연결 지원
- **CDP "Pause & Attach" 패턴 호환**: 프로필 실행 후 CDP 연결 가능

**MoreLogin**:
- **API 미제공** (2025년 기준) -- 자동화 통합에 심각한 제약
- 수동 브라우저 조작 위주
- Playwright/CDP 프로그래밍 연동 불가
- **우리 프로젝트에 부적합**

### 2.3 비용 분석

**시나리오**: 월 500개 사이트, 사이트당 10페이지, 프로필 10~50개 필요

| 솔루션 | 월 비용 | 프로필 수 | 비고 |
|--------|---------|----------|------|
| **Nstbrowser Pro** | $29.90 | 무제한 | 3,000 환경 시작/일, 1,000시간 브라우저리스 |
| **Multilogin Solo** | ~$99 (&#8364;9/월은 10프로필) | 10~100 | 프록시 1GB 포함, 추가 &#8364;3/GB |
| **GoLogin Professional** | $49/월 ($24 연간) | 100 | API 포함, 7일 무료 체험 |
| **MoreLogin Pro** | $9/월 | 10 | API 없음, 자동화 부적합 |

**비용 효율 순위**: Nstbrowser > GoLogin (연간 결제) > Multilogin > MoreLogin

---

## 3. 헤드리스 브라우저 서비스 (Browserless, BrowserBase)

### 3.1 Browserless

**개요**: 관리형 헤드리스 브라우저 플랫폼. WebSocket CDP 엔드포인트와 REST API로 Chrome을 제공.

**가격**:
| 플랜 | 월 비용 | 단위(Units) | 비고 |
|------|---------|------------|------|
| Free | $0 | 1,000 | 캡차 해결 포함, 모든 API 접근 |
| Starter | $50 | ~10,000 (추정) | 기본 기능 |
| Scale | $200 | ~50,000 (추정) | 확장 기능 |
| Enterprise | 커스텀 | 커스텀 | 연평균 ~$2,700 |

> Unit = 최대 30초 브라우저 세션. 일반적으로 페이지당 1 Unit, 장시간 자동화는 복수 Unit 소모.

**스텔스 기능**:
- **BrowserQL (BQL)**: GraphQL 기반 "stealth-first" 자동화 API
- 전용 스텔스 라우트 (`/stealth/bql`)로 인간 유사 행동 + 봇 탐지 우회
- 내장 CAPTCHA 자동 해결

**CDP "Pause & Attach" 지원**:
- **하이브리드 자동화 모드 제공** (핵심 발견 사항)
- `Browserless.captchaFound` 이벤트: CAPTCHA 탐지 시 모든 활성 CDP 세션에 이벤트 전송
- `Browserless.solveCaptcha`: 자동 CAPTCHA 해결 시도
- `Browserless.liveURL`: 자동 해결 실패 시 일회용 URL 생성 -> 사람이 수동 개입
- LiveURL에 API 토큰 등 민감 정보 미포함
- **우리의 "Pause & Attach" 패턴과 정확히 일치하는 구현**

**장점**:
- CDP WebSocket 연결로 Playwright/Puppeteer 통합
- 내장 CAPTCHA 해결 + 수동 개입 폴백
- 스텔스 모드 내장
- Unit 기반 과금으로 예측 가능한 비용

**한계**:
- 클라우드 서비스 의존 (셀프호스팅 가능하나 별도)
- 장시간 세션 시 Unit 소모 급증
- 한국 리전 미제공 (지연시간 고려 필요)

---

### 3.2 BrowserBase

**개요**: AI 에이전트 브라우저 인프라 전문. Series B $40M 투자 유치 (2025년 6월, $300M 밸류에이션). 2025년 1,000+ 고객, 5,000만 세션 처리.

**가격**:
| 플랜 | 월 비용 | 동시 브라우저 | 비고 |
|------|---------|-------------|------|
| Free | $0 | 제한적 | 테스트/개발용 |
| Developer | ~$39 | 3 | 프록시 2GB 포함 |
| Startup | ~$100 | 증가 | 추가 기능 |
| Scale | 커스텀 | 100+ | HIPAA/SOC2, 자동 CAPTCHA, 고급 스텔스 |

**스텔스 기능**:
- **Basic Stealth Mode**: 기본 안티디텍션
- **Advanced Stealth Mode**: 커스텀 Chromium 빌드 + 실제 브라우저 핑거프린트
- 세션 녹화, CAPTCHA 해결, 프록시 관리 내장

**CDP/Playwright 호환성**:
- Puppeteer, Playwright, Selenium 모두 CDP WebSocket으로 연결
- Stagehand (자체 AI 자동화 프레임워크) 제공

**한계**:
- Advanced Stealth는 Scale 플랜 이상에서만 제공 (커스텀 가격)
- "Pause & Attach" 패턴에 대한 명시적 하이브리드 자동화 모드 미확인
- 비용이 상대적으로 높음

---

### 3.3 Browserless vs BrowserBase 비교

| 항목 | Browserless | BrowserBase |
|------|-------------|-------------|
| **시작 가격** | $50/월 | ~$39/월 |
| **스텔스 수준** | BQL 스텔스 라우트 | 커스텀 Chromium (Advanced) |
| **CAPTCHA 해결** | 내장 (자동 + 수동 폴백) | 내장 (Scale 플랜) |
| **하이브리드 자동화** | LiveURL로 수동 개입 지원 | 명시적 지원 미확인 |
| **CDP 호환** | 완전 지원 | 완전 지원 |
| **과금 모델** | Unit 기반 (30초당) | 세션 기반 |
| **우리 적합성** | **높음** (하이브리드 패턴 직접 지원) | 중간 |

---

## 4. 스크래핑 API (ScrapingBee, Apify/Crawlee)

### 4.1 ScrapingBee

**개요**: REST API 기반 웹 스크래핑 서비스. JavaScript 렌더링, 프록시 로테이션, 헤더 관리를 자동 처리.

**가격**:
| 플랜 | 월 비용 | API 크레딧 | 동시 요청 |
|------|---------|-----------|----------|
| Freelance | $49 | 250,000 | 10 |
| Startup | $99 | 1,000,000 | 50 |
| Business | $249 | 2,500,000 | 100 |
| Business+ | $599 | 8,000,000 | 200 |

**크레딧 소모 주의사항**:
- 기본 요청: 1 크레딧
- JavaScript 렌더링: **5 크레딧** (5배 비용)
- 지역 타겟팅: 추가 크레딧
- JS 렌더링 + 지역 타겟팅: 최대 **75배** 크레딧 소모
- **JS 렌더링과 지역 타겟팅은 Business($249) 이상에서만 사용 가능**

**우리 시나리오 비용 추정** (월 500 사이트 x 10 페이지 = 5,000 페이지):
- JS 렌더링 필수 (도박 사이트는 SPA/동적 콘텐츠): 5,000 x 5 = 25,000 크레딧
- Business 플랜($249)에서 충분하나, 지역 타겟팅 추가 시 크레딧 급증

**멀티스텝 플로우 지원**:
- **미지원**: ScrapingBee는 단일 페이지 요청 API로 설계됨
- 폼 작성, 로그인, 다단계 네비게이션 등 불가
- 각 요청이 독립적 (세션 유지 불가)
- **우리 프로젝트에 부적합** (다단계 폼 플로우 필수)

---

### 4.2 Apify / Crawlee

**Crawlee (오픈소스 라이브러리)**:
- Node.js/TypeScript 기반 웹 스크래핑/브라우저 자동화 라이브러리
- Playwright, Puppeteer, Cheerio 등 지원
- 프록시 로테이션, 리트라이, 큐 관리 내장
- **무료/오픈소스** (자체 인프라에서 실행)

**Apify 플랫폼 가격**:
| 플랜 | 월 비용 | 크레딧 | 컴퓨트 단가 |
|------|---------|--------|------------|
| Free | $0 | $5 크레딧 | $0.30/CU |
| Starter | $39 | $39 크레딧 | $0.30/CU |
| Scale | $199 | $199 크레딧 | $0.25/CU |
| Business | $999 | $999 크레딧 | $0.20/CU |

**우리 시나리오 비용 추정** (월 5,000 페이지):
- 브라우저 자동화 Compute Unit 소모: 페이지당 ~$0.01~0.05
- 월 예상 비용: $50~$250 (프록시 별도)
- Scale 플랜($199)에서 운영 가능

**멀티스텝 플로우 지원**:
- **지원**: Crawlee의 `PlaywrightCrawler`로 복잡한 다단계 플로우 구현 가능
- 로그인, 폼 작성, 페이지 네비게이션 등 Playwright 전체 API 사용
- 세션 유지, 쿠키 관리 내장

**장점**:
- Crawlee 자체는 무료/오픈소스
- Playwright 기반이라 기존 코드 재활용 가능
- 자동 리트라이, 큐 관리, 프록시 로테이션 내장
- Apify 플랫폼에 배포하면 인프라 관리 불필요

**한계**:
- Apify 플랫폼 사용 시 비용 발생
- CDP "Pause & Attach" 패턴: Crawlee 자체에서는 어려움 (Apify 클라우드에서 수동 개입 패턴 미지원)
- 안티봇 우회는 별도 설정 필요 (rebrowser-patches 등과 조합)

---

## 5. 의사결정 매트릭스

### 평가 기준 (1-5점, 5점이 최고)

| 솔루션 | 스텔스 수준 | CDP 호환 | Pause&Attach | 멀티스텝 | 비용 효율 | 구현 난이도 | 총점 |
|--------|-----------|---------|-------------|---------|----------|-----------|------|
| **rebrowser-playwright** (자체운영) | 4 | 5 | 5 | 5 | 5 | 4 | **28** |
| **playwright-extra + stealth** | 3 | 5 | 5 | 5 | 5 | 5 | **28** |
| **Browserless (Scale)** | 4 | 5 | 5 | 5 | 3 | 4 | **26** |
| **Nstbrowser + Playwright** | 5 | 4 | 4 | 5 | 4 | 3 | **25** |
| **BrowserBase** | 4 | 5 | 3 | 5 | 2 | 4 | **23** |
| **Crawlee (자체운영)** | 3 | 4 | 3 | 5 | 5 | 3 | **23** |
| **GoLogin + Playwright** | 4 | 4 | 4 | 4 | 4 | 3 | **23** |
| **Multilogin + Playwright** | 5 | 4 | 4 | 4 | 2 | 3 | **22** |
| **Apify (Scale)** | 3 | 3 | 2 | 4 | 3 | 4 | **19** |
| **ScrapingBee** | 3 | 1 | 1 | 1 | 3 | 5 | **14** |

### 가중치 적용 (우리 프로젝트 우선순위 반영)

우리 프로젝트의 핵심 요구사항 가중치:
- **스텔스**: x2 (불법 도박 사이트의 안티봇 회피 필수)
- **CDP 호환**: x2 (기존 아키텍처의 핵심)
- **Pause & Attach**: x2 (CAPTCHA 수동 개입 필수)
- **멀티스텝**: x1.5 (폼 작성/네비게이션 필수)
- **비용 효율**: x1 (정부 프로젝트이나 예산 고려)
- **구현 난이도**: x1 (개발 속도)

| 솔루션 | 가중 총점 |
|--------|----------|
| **rebrowser-playwright** (자체운영) | **40.5** |
| **playwright-extra + stealth** | **39.5** |
| **Browserless (Scale)** | **37.5** |
| **Nstbrowser + Playwright** | **36.0** |
| **GoLogin + Playwright** | **33.0** |
| **BrowserBase** | **31.5** |
| **Multilogin + Playwright** | **31.0** |
| **Crawlee (자체운영)** | **29.5** |
| **Apify (Scale)** | **23.0** |
| **ScrapingBee** | **17.0** |

---

## 6. 최종 추천

### 권장 전략: 계층적 접근 (Tiered Approach)

#### Tier 1: 기본 구성 (즉시 적용, 무료)

**`rebrowser-playwright` 도입**

- **이유**: 가중 점수 최고, 무료, 드롭인 대체, Runtime.Enable CDP 누출 해결
- **적용 방법**: `npm install rebrowser-playwright`로 기존 `playwright` 교체
- **효과**: Cloudflare/DataDome 수준의 안티봇 자동 우회
- **CDP "Pause & Attach" 패턴**: 완전 호환 (기존 구현 변경 불필요)
- **예상 커버리지**: 전체 사이트의 80~90%

#### Tier 2: 강화 안티봇 대응 (필요 시 추가)

**Nstbrowser 또는 Browserless 연동**

조건: Tier 1으로 우회 불가능한 사이트 발견 시

- **Option A - Nstbrowser** ($29.90/월): 안티디텍트 브라우저 프로필 + CDP 연결. Canvas/WebGL/TLS 핑거프린트 완전 격리. 비용 효율적.
- **Option B - Browserless** ($200/월 Scale): 클라우드 관리형. 내장 CAPTCHA 해결 + LiveURL 수동 개입. 인프라 관리 불필요. 하이브리드 자동화 모드가 우리 Pause & Attach 패턴과 정확히 일치.

권장: 먼저 Nstbrowser로 시작하고, 운영 부담이 크면 Browserless로 전환.

#### Tier 3: 대규모 운영 시 (향후 확장)

**Crawlee 프레임워크 도입**

- 자동 리트라이, 큐 관리, 프록시 로테이션 등 대규모 크롤링 필수 기능
- rebrowser-playwright와 조합하여 사용 가능
- 자체 인프라 운영 또는 Apify 플랫폼 배포 선택

### 비추천 솔루션

| 솔루션 | 비추천 이유 |
|--------|-----------|
| **ScrapingBee** | 멀티스텝 플로우 미지원, CDP 미지원. 단일 페이지 API로 우리 요구사항 충족 불가 |
| **MoreLogin** | API 미제공으로 자동화 통합 불가 |
| **Multilogin** | 기능은 우수하나 비용 대비 Nstbrowser/GoLogin 대비 이점 부족 |

### 구현 우선순위

```
Phase 1 (1주차): rebrowser-playwright 도입 + 기존 코드 적용
Phase 2 (2주차): 안티봇 우회 실패 사이트 목록 수집 및 분석
Phase 3 (3주차): 필요 시 Nstbrowser/Browserless Tier 2 연동
Phase 4 (지속):  Crawlee 프레임워크 점진적 도입 검토
```

### 월 예상 비용

| 단계 | 비용 | 커버리지 |
|------|------|---------|
| Tier 1만 | $0 | ~85% 사이트 |
| Tier 1 + Nstbrowser | ~$30/월 | ~95% 사이트 |
| Tier 1 + Browserless | ~$200/월 | ~98% 사이트 |
| 풀 스택 (Tier 1+2+3) | ~$230~430/월 | ~99% 사이트 |

---

### 참고 자료

- [rebrowser-patches GitHub](https://github.com/rebrowser/rebrowser-patches)
- [rebrowser-playwright GitHub](https://github.com/rebrowser/rebrowser-playwright)
- [puppeteer-extra-plugin-stealth npm](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth)
- [playwright-extra npm](https://www.npmjs.com/package/playwright-extra)
- [Nstbrowser CDP API](https://apidocs.nstbrowser.io/folder-3410333)
- [Nstbrowser 가격](https://www.nstbrowser.io/en/pricing)
- [Multilogin 가격](https://multilogin.com/help/en_US/subscription-plan-comparison)
- [GoLogin 가격](https://gologin.com/pricing/)
- [MoreLogin 가격](https://www.morelogin.com/pricing/)
- [Browserless 가격](https://www.browserless.io/pricing)
- [Browserless 하이브리드 자동화](https://docs.browserless.io/baas/interactive-browser-sessions/hybrid-automation)
- [Browserless CAPTCHA 해결](https://docs.browserless.io/baas/bot-detection/captchas)
- [BrowserBase](https://www.browserbase.com)
- [ScrapingBee 가격](https://www.scrapingbee.com/pricing/)
- [Apify 가격](https://apify.com/pricing)
- [Crawlee GitHub](https://github.com/apify/crawlee)
- [rebrowser-bot-detector](https://github.com/rebrowser/rebrowser-bot-detector)
- [TLS 핑거프린팅 우회 가이드](https://www.browserless.io/blog/tls-fingerprinting-explanation-detection-and-bypassing-it-in-playwright-and-puppeteer)
