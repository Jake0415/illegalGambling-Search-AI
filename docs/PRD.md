# 제품 요구사항 정의서 (PRD)

## 불법 도박 사이트 자동 검색/채증 시스템

| 항목 | 내용 |
|------|------|
| **제품명** | illegalGambling-Search-AI (불법 도박 사이트 자동 채증 시스템) |
| **문서 버전** | 1.0 |
| **작성일** | 2026-03-14 |
| **최종 수정일** | 2026-03-14 |
| **작성자** | 기획팀 (browser-automation-specialist, sms-verification-specialist, evidence-compliance-specialist, crawler-search-specialist, frontend-ui-specialist, api-architect) |
| **문서 유형** | PRD 통합 목차 및 Executive Summary |
| **상태** | 초안 완료 |

---

## 1. Executive Summary

본 시스템은 인터넷상 불법 스포츠 도박 및 불법 경마 사이트를 AI 기반으로 자동 탐지하고, 법적 증거로 활용 가능한 3단계 스크린샷 채증을 자동 수행하는 통합 시스템이다. 국내 불법 온라인 도박 시장이 연간 수십조 원 규모로 추정되는 가운데, 기존 수사관의 수동 캡처 방식은 인력 집약적이고 증거 무결성 보장이 어려우며, 도메인 호핑(빈번한 도메인 변경)에 대한 대응이 불가능한 한계를 갖고 있다. 본 시스템은 이러한 한계를 해결하기 위해 rebrowser-playwright 기반 브라우저 자동화, PVAPins Non-VoIP SMS OTP 인증, Claude Haiku 4.5 AI 분류, OpenTimestamps/RFC 3161 이중 타임스탬프 등 최신 기술을 결합한다.

시스템은 운영자가 시드 키워드를 입력하면 유사 키워드를 자동 생성하고, Google Custom Search API 및 Crawlee 크롤링 엔진을 통해 불법 사이트를 자동 탐지한 후, 탐지된 사이트에 대해 1단계(메인화면), 2단계(회원가입/배팅시작), 3단계(실제 배팅)까지 자동 채증을 수행한다. 수집된 모든 증거는 SHA-256 해시, OpenTimestamps 비트코인 블록체인 타임스탬프, RFC 3161 PKI 타임스탬프로 무결성이 보장되며, WARC + SingleFile + 스크린샷 + 메타데이터를 포함하는 법원 제출용 증거 패키지가 자동 생성된다.

주요 사용 기관은 사행산업통합감독위원회, 경찰청 사이버수사국, 한국마사회 불법경마 감시팀, 국민체육진흥공단이며, 4개 Phase에 걸쳐 18~26주간 개발한다. Phase 1(MVP)에서 핵심 채증 파이프라인을 검증하고, Phase 4(고도화) 완료 시 월 500건 이상 불법 사이트 탐지, 3단계 채증 성공률 80% 이상(Computer Use 폴백 포함), 증거 무결성 검증 통과율 100%, 시스템 가동률 99.5% 이상을 목표로 한다. 월 운영비는 외부 서비스 기준 $867~2,012 수준이다.

---

## 2. 목차 (Table of Contents)

본 PRD는 8개 섹션 문서로 구성되며, 각 섹션은 독립적으로 참조 가능하다.

| # | 섹션명 | 파일 경로 | 요약 |
|---|--------|----------|------|
| 01 | [제품 개요 및 사용자 스토리](./PRD-sections/01-overview-and-stories.md) | `PRD-sections/01-overview-and-stories.md` | 제품 비전, 배경, 타겟 사용자, 4개 페르소나, 17개 사용자 스토리, Phase별 구현 범위, 수용 기준 |
| 02 | [채증 엔진 기능 요구사항](./PRD-sections/02-evidence-collection-engine.md) | `PRD-sections/02-evidence-collection-engine.md` | rebrowser-playwright 기반 3단계 채증, 팝업 처리, CAPTCHA 하이브리드, Computer Use 폴백 |
| 03 | [SMS 인증 자동화 기능 요구사항](./PRD-sections/03-sms-authentication.md) | `PRD-sections/03-sms-authentication.md` | PVAPins/GrizzlySMS/SMS-Activate 폴백 체인, OTP 수신/파싱, 수동 개입 연동, 비용 관리 |
| 04 | [증거 무결성 관리 기능 요구사항](./PRD-sections/04-evidence-integrity.md) | `PRD-sections/04-evidence-integrity.md` | SHA-256 해시, OpenTimestamps, RFC 3161, 증거 패키지 구조, Chain of Custody, 보고서 생성 |
| 05 | [탐지 엔진 기능 요구사항](./PRD-sections/05-detection-engine.md) | `PRD-sections/05-detection-engine.md` | 검색/크롤링 기반 탐지, Claude Haiku AI 분류, 도메인 호핑 추적, URL 패턴 분석, 스케줄링 |
| 06 | [대시보드 및 UI 기능 요구사항](./PRD-sections/06-dashboard-and-ui.md) | `PRD-sections/06-dashboard-and-ui.md` | 메인 대시보드, 사이트 관리, 채증 모니터링, 증거 관리, 수동 개입 UI, 통계/리포트 |
| 07 | [REST API 명세 기능 요구사항](./PRD-sections/07-api-specification.md) | `PRD-sections/07-api-specification.md` | RESTful API 설계, 인증/인가, RBAC, 사이트/채증/증거/탐지/통계 API, SSE/WebSocket |
| 08 | [데이터베이스 데이터 모델 요구사항](./PRD-sections/08-data-model.md) | `PRD-sections/08-data-model.md` | PostgreSQL 16 + Prisma ORM, 핵심/증거/SMS/탐지/사용자 엔티티, 인덱스/파티셔닝 전략 |

---

## 3. 요구사항 요약 (Requirements Summary)

### 3.1 섹션별 기능 요구사항 총괄

| 섹션 | 요구사항 ID 범위 | 기능 요구사항 수 | 사용자 스토리 | 주요 내용 |
|------|----------------|----------------|-------------|----------|
| 01 - 개요 및 스토리 | US-A1~A7, US-B1~B4, US-C1~C3, US-D1~D3 | - | 17개 | 4개 페르소나, 사용자 스토리, Phase 정의 |
| 02 - 채증 엔진 | FR-EC-001 ~ FR-EC-034 | 34개 | - | 3단계 채증, 팝업 처리, CAPTCHA, Computer Use |
| 03 - SMS 인증 | FR-SMS-001 ~ FR-SMS-031 | 31개 | - | 가상번호 관리, OTP 처리, 인증 오케스트레이션, 보안 |
| 04 - 증거 무결성 | FR-EV-001 ~ FR-EV-017 | 17개 | - | 해시, 타임스탬프, 증거 패키지, Chain of Custody, 보고서 |
| 05 - 탐지 엔진 | FR-DE-001 ~ FR-DE-030 | 30개 | - | 검색/크롤링 탐지, AI 분류, 도메인 추적, URL 분석 |
| 06 - 대시보드/UI | FR-UI-001 ~ FR-UI-035 | 35개 | - | 대시보드, 사이트 관리, 채증 모니터링, 증거/통계 UI |
| 07 - API 명세 | FR-API-001 ~ FR-API-049 | 49개 | - | 인증, 사이트, 채증, 증거, 탐지, 통계, 시스템 API |
| 08 - 데이터 모델 | FR-DM-001 ~ FR-DM-020 | 20개 | - | 핵심/증거/SMS/탐지/사용자 엔티티, 인덱스 |
| **합계** | | **216개** | **17개** | **총 216개 기능 요구사항 + 17개 사용자 스토리** |

### 3.2 비기능 요구사항 (NFR) 요약

| 카테고리 | ID 범위 | 개수 | 주요 내용 |
|---------|---------|------|----------|
| 채증 엔진 성능 | NFR-EC-001 ~ NFR-EC-008 | 8개 | 채증 성공률, 소요 시간, CAPTCHA 비용, 안티봇 우회율 |
| SMS 인증 성능 | (03절 내부) | 10개 | SMS 성공률, OTP 대기 시간, 파싱 정확도, 월간 비용 상한 |
| 법적 준수 | NFR-LEGAL-001 ~ NFR-LEGAL-005 | 5개 | 증거 합법성, 형사소송법 요건, 개인정보 보호, 가상번호 적법성 |
| 보안 | NFR-SEC-001 ~ NFR-SEC-003 | 3개 | 암호화 저장, RBAC, 감사 로그 변조 방지 |

---

## 4. Phase / 우선순위 분류 매트릭스

### 4.1 Phase별 요구사항 분포

| 섹션 | Phase 1 (MVP) | Phase 2 (자동 채증) | Phase 3 (AI 탐지) | Phase 4 (고도화) | 합계 |
|------|:------------:|:------------------:|:----------------:|:---------------:|:----:|
| 02 - 채증 엔진 (FR-EC) | 12 | 21 | - | 1 | 34 |
| 03 - SMS 인증 (FR-SMS) | - | 25 | 6 | - | 31 |
| 04 - 증거 무결성 (FR-EV) | 6 | 5 | - | 6 | 17 |
| 05 - 탐지 엔진 (FR-DE) | 4 | 16 | 10 | - | 30 |
| 06 - 대시보드/UI (FR-UI) | 17 | 13 | 5 | - | 35 |
| 07 - API 명세 (FR-API) | 15 | 27 | 7 | - | 49 |
| 08 - 데이터 모델 (FR-DM) | 10 | 7 | 3 | - | 20 |
| **합계** | **64** | **114** | **31** | **7** | **216** |

### 4.2 우선순위별 요구사항 분포

| 섹션 | P0 (필수) | P1 (높음) | P2 (보통) | P3 (낮음) | 합계 |
|------|:---------:|:---------:|:---------:|:---------:|:----:|
| 02 - 채증 엔진 (FR-EC) | 12 | 21 | 1 | - | 34 |
| 03 - SMS 인증 (FR-SMS) | 13 | 12 | 2 | - | 27* |
| 04 - 증거 무결성 (FR-EV) | 6 | 5 | - | 6 | 17 |
| 05 - 탐지 엔진 (FR-DE) | 5 | 13 | 8 | 2 | 28* |
| 06 - 대시보드/UI (FR-UI) | 8 | 16 | 11 | - | 35 |
| 07 - API 명세 (FR-API) | 11 | 24 | 7 | - | 42* |
| 08 - 데이터 모델 (FR-DM) | 10 | 7 | 3 | - | 20 |

> *일부 섹션의 우선순위별 합계와 전체 합계에 차이가 있는 경우, 해당 섹션 문서의 상세 분류를 참조

### 4.3 Phase별 일정 및 KPI 목표

| Phase | 기간 | 목표 | 핵심 KPI |
|-------|------|------|----------|
| **Phase 1: MVP** | 4~6주 | rebrowser-playwright 기반 핵심 채증 파이프라인 검증 | 1단계 채증 성공률 95%, URL 입력 후 60초 이내 완료, 해시 검증 100%, AI 분류 F1 90%+ |
| **Phase 2: 자동 채증** | 4~6주 | SMS 인증 자동화 및 2~3단계 채증 파이프라인 완성 | 3단계 채증 성공률 70%+, 소요 시간 10분 이내, SMS 인증 성공률 60%+, 월 500건 처리 |
| **Phase 3: AI 탐지** | 6~8주 | Claude few-shot 기반 자동 탐지 파이프라인 구축 | 월 500건 자동 탐지, AI 분류 Precision 95%+, 도메인 호핑 추적 60%+ |
| **Phase 4: 고도화** | 4~6주 | Computer Use 폴백, MCP 아키텍처, SNS 모니터링 | 전체 채증 성공률 80%+, LLM 비용 $15/월 이하, 시스템 가동률 99.5%+ |

---

## 5. 용어 사전 (Glossary)

| 용어 | 영문 / 약어 | 설명 |
|------|------------|------|
| **채증** | Evidence Collection | 불법 사이트의 화면, HTML, 네트워크 트래픽 등을 법적 증거로 활용 가능한 형태로 수집하는 행위 |
| **도메인 호핑** | Domain Hopping | 불법 도박 사이트가 단속을 회피하기 위해 도메인을 빈번하게 변경하는 행위 |
| **SMS OTP** | SMS One-Time Password | 일회용 비밀번호를 SMS로 전송하여 본인 인증을 수행하는 방식 |
| **Non-VoIP** | Non-Voice over IP | 실제 통신사 SIM 카드 기반 전화번호 (VoIP 번호 대비 차단 확률 낮음) |
| **CAPTCHA** | Completely Automated Public Turing test | 사람과 자동화 프로그램을 구별하기 위한 챌린지-응답 테스트 |
| **WARC** | Web ARChive (ISO 28500) | 웹 아카이브 표준 포맷. HTTP 요청/응답 원본을 충실도 높게 보존 |
| **SingleFile** | SingleFile CLI | 웹페이지의 모든 리소스(CSS, 이미지, JS)를 포함하는 단일 HTML 파일 생성 도구 |
| **OpenTimestamps** | OTS | 비트코인 블록체인을 활용한 무료 탈중앙화 타임스탬프 프로토콜 |
| **RFC 3161** | Internet X.509 PKI Time-Stamp Protocol | PKI 기반 타임스탬프 국제 표준 프로토콜 |
| **SHA-256** | Secure Hash Algorithm 256-bit (FIPS 180-4) | 파일 무결성 검증을 위한 암호학적 해시 함수 |
| **Chain of Custody** | 증거 관리 연속성 | 증거 수집부터 법정 제출까지 모든 접근/변경 이력을 추적하는 체계 |
| **CDP** | Chrome DevTools Protocol | Chrome 브라우저의 원격 디버깅 프로토콜 |
| **Crawlee** | Crawlee Framework | Apify에서 개발한 Node.js 웹 크롤링/스크래핑 프레임워크 |
| **rebrowser-playwright** | rebrowser-playwright | Playwright의 드롭인 교체 라이브러리. Runtime.Enable CDP 유출을 패치하여 안티봇 탐지 우회 |
| **fingerprint-suite** | fingerprint-suite (Apify) | 브라우저 핑거프린트(Canvas, WebGL, 폰트 등) 생성 및 주입 라이브러리 |
| **got-scraping** | got-scraping (Apify) | TLS 핑거프린트를 실제 브라우저와 동일하게 모방하는 HTTP 클라이언트 |
| **BullMQ** | BullMQ | Redis 기반 Node.js 작업 큐 라이브러리 |
| **few-shot** | Few-Shot Learning | 소수의 예시만으로 AI 모델이 분류/생성 작업을 수행하는 학습 방식 |
| **F1 스코어** | F1 Score | 정밀도(Precision)와 재현율(Recall)의 조화 평균. 분류 성능 지표 |
| **CapSolver** | CapSolver | CAPTCHA 자동 풀이 API 서비스 (reCAPTCHA, hCaptcha, Turnstile 지원) |
| **2Captcha** | 2Captcha | 사람이 직접 풀이하는 CAPTCHA 해결 API 서비스 (폴백용) |
| **PVAPins** | PVAPins | Non-VoIP 가상 전화번호 제공 서비스 (실제 통신사 SIM 기반) |
| **GrizzlySMS** | GrizzlySMS | VoIP 기반 가상 전화번호 제공 서비스 (PVAPins 폴백용) |
| **Computer Use** | Claude Computer Use | Anthropic의 Claude 모델이 스크린샷 기반으로 컴퓨터를 조작하는 기능 |
| **MCP** | Model Context Protocol | LLM과 외부 도구 간 표준 통신 프로토콜. 토큰 사용 최적화에 활용 |
| **WORM** | Write-Once-Read-Many | 한 번 기록하면 수정/삭제가 불가능한 저장소 모드. 증거 변조 방지용 |
| **RBAC** | Role-Based Access Control | 역할 기반 접근 제어. 사용자 역할에 따라 시스템 기능 접근을 제한 |
| **TSA** | Timestamp Authority | RFC 3161에서 타임스탬프를 발급하는 신뢰 기관 |

---

## 6. 기술 스택 요약 (Technology Stack)

### 6.1 프론트엔드

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js (App Router + Turbopack) | 15.5.3 | 서버 컴포넌트, 스트리밍 SSR, Server Actions |
| UI 런타임 | React + TypeScript | 19.1.0 / TS 5 | 프론트엔드 UI 렌더링 |
| UI 컴포넌트 | shadcn/ui (new-york style) + Radix UI | latest | 접근성 기본 제공, 커스터마이징 용이 |
| 스타일링 | TailwindCSS | v4 | 유틸리티 기반 CSS, 다크 모드 |
| 데이터 테이블 | TanStack Table | v8 | 서버사이드 정렬/필터/페이지네이션 |
| 차트/시각화 | Recharts | latest | 통계 차트, 추이 그래프 |
| 네트워크 그래프 | D3.js / Cytoscape.js | latest | 도메인 호핑 네트워크 시각화 |
| 폼 관리 | React Hook Form + Zod | latest | 스키마 기반 유효성 검증 |
| 상태 관리 | Zustand + TanStack Query | latest / v5 | 클라이언트/서버 상태 분리 |
| 아이콘 | Lucide Icons | latest | 경량, Tree-shaking 지원 |

### 6.2 백엔드

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| API | Next.js Route Handlers | 15.5.3 | RESTful API, Server Actions |
| 인증 | NextAuth.js (Auth.js) | v5 | JWT 인증, RBAC |
| ORM | Prisma | 6.x | 타입 안전 쿼리, 마이그레이션 관리 |
| 데이터베이스 | PostgreSQL | 16 | 주 데이터 저장소 |
| 캐시/큐 | Redis + BullMQ | 7.x | 작업 큐, 세션 캐시, 실시간 상태 |
| 파일 저장소 | S3 / MinIO | - | 증거 파일 저장 (스크린샷, HTML, WARC) |
| 실시간 통신 | SSE / WebSocket | - | 채증 진행 상황, CAPTCHA 큐 업데이트 |

### 6.3 브라우저 자동화 및 크롤링

| 영역 | 기술 | 용도 |
|------|------|------|
| 브라우저 자동화 (Tier 1) | rebrowser-playwright | CDP 유출 패치, 안티봇 우회 (~85% 커버) |
| 브라우저 자동화 (Tier 2) | Nstbrowser ($30/월, 선택) | 안티디텍트 프로필, 고도 핑거프린트 격리 |
| 크롤링 프레임워크 | Crawlee (PlaywrightCrawler) | 대규모 크롤링, 자동 스케일링, 프록시 로테이션 |
| HTTP 클라이언트 | got-scraping | TLS 핑거프린트 모방, 경량 HTTP 요청 |
| 핑거프린트 관리 | fingerprint-suite | Canvas/WebGL 핑거프린트 생성 및 주입 |
| 프록시 | IPRoyal / SOAX | 레지덴셜 프록시 로테이션 |

### 6.4 AI / LLM

| 영역 | 기술 | 용도 | 예상 비용 |
|------|------|------|----------|
| 콘텐츠 분류 | Claude Haiku 4.5 (few-shot) | 불법 도박 사이트 분류 (F1 94-95%) | ~$15/월 (500사이트, 배치 API + 캐싱) |
| 폼/CAPTCHA 탐지 | Claude Haiku 4.5 Vision | 폼 필드 자동 탐지, CAPTCHA 유형 식별 | ~$7.50/월 (2,500건) |
| 보고서 생성 | Claude Sonnet 4.6 | 한국어 수사 보고서 자동 생성 | ~$0.045/건 |
| Computer Use (폴백) | Claude Sonnet 4.6 Computer Use | Playwright 실패 시 폴백 (~10% 사이트) | ~$15~25/월 |
| ML 모델 (Phase 3) | XGBoost / KLUE-BERT / URLBERT | 1차 필터링, URL 패턴 분류 | ONNX Runtime 추론 |

### 6.5 SMS / CAPTCHA 외부 서비스

| 영역 | 기술 | 용도 | 예상 비용 |
|------|------|------|----------|
| SMS 1순위 | PVAPins (Non-VoIP) | 실제 통신사 SIM 기반 +82 번호 | $357~1,428/월 |
| SMS 2순위 | GrizzlySMS (VoIP) | VoIP 폴백 번호 | ~$1,075/월 (전체 사용 시) |
| SMS 3순위 | SMS-Activate (VoIP) | 2차 폴백 | ~$625~1,875/월 (전체 사용 시) |
| CAPTCHA 1순위 | CapSolver | reCAPTCHA, hCaptcha, Turnstile 자동 풀이 | ~$1.20/월 |
| CAPTCHA 2순위 | 2Captcha | 사람 풀이 기반 폴백 | ~$0.38/월 |

### 6.6 증거 무결성

| 영역 | 기술 | 용도 |
|------|------|------|
| 해시 | SHA-256 (Node.js crypto) | 파일 무결성 검증 (FIPS 180-4) |
| 타임스탬프 1 | OpenTimestamps | 비트코인 블록체인 기반 무료 타임스탬프 |
| 타임스탬프 2 | RFC 3161 (자체 경량 TSA 클라이언트) | PKI 기반 타임스탬프 이중화 |
| 웹 아카이브 | warcio.js (WARC, ISO 28500) | HTTP 트래픽 원본 보존 |
| HTML 보존 | SingleFile CLI | 단일 HTML 파일 생성 (오프라인 열람) |

---

## 7. 주요 아키텍처 의사결정 (Key Architectural Decisions)

> 상세 내용: [`docs/planning/decisions.md`](./planning/decisions.md)

| # | 의사결정 | 결정 내용 | 근거 | 상태 |
|---|---------|----------|------|------|
| 1 | **브라우저 자동화** | rebrowser-playwright를 Playwright 드롭인 교체로 도입 (Tier 1). Nstbrowser ($30/월) Tier 2 대기 | Runtime.Enable CDP 유출 패치로 Cloudflare/DataDome 우회. 무료, ~85% 사이트 커버. `npm install rebrowser-playwright`로 즉시 교체 가능 | 확정 |
| 2 | **SMS 인증 서비스** | PVAPins Non-VoIP 1순위, GrizzlySMS/SMS-Activate VoIP 2순위 폴백 | 불법 도박사이트는 VoIP 번호 탐지/차단 가능. Non-VoIP는 실제 통신사 SIM이므로 우회 가능성 높음 (예상 성공률 60-80%) | 테스트 후 재검토 |
| 3 | **크롤링 프레임워크** | Crawlee + got-scraping + fingerprint-suite (Apify 생태계) 채택 | Node.js/TypeScript 네이티브 호환, Playwright 통합, 안티블로킹/프록시 로테이션/큐 관리 내장, 22.2k GitHub stars | 확정 |
| 4 | **AI 분류 모델** | Claude Haiku 4.5 few-shot 기본 모델, Sonnet 4.6 보고서 전용 | Haiku 4.5로 도박 사이트 분류 F1 94-95% 달성 가능. 건당 $0.003. 학습 데이터 없이 즉시 시작 가능하여 ML 파이프라인 불필요 | 확정 |
| 5 | **증거 무결성** | OpenTimestamps 즉시 도입 + RFC 3161 자체 구현으로 이중화 | OpenTimestamps: 무료, 탈중앙화, 10년 후 검증 가능. RFC 3161: 기존 법률 체계에서 넓은 법적 인정 기반 | 확정 |
| 6 | **CAPTCHA 솔버** | CapSolver/2Captcha API 사용 (오픈소스 자체 구축 비채택) | 실제 테스트 결과 CAPTCHA 출현 빈도 극히 낮아 월 ~$2 비용. 오픈소스 구축 시 40시간+ 필요, ROI 없음 | 확정 |
| 7 | **Computer Use** | 폴백 전용으로만 사용. 기본 자동화는 Playwright | 액션당 ~5초 (Playwright 대비 50x 느림), 액션당 ~$0.30~0.50 (3000x 비쌈). 미지 사이트 ~10%에서만 호출 | 확정 |

---

## 8. 섹션 간 의존성 매트릭스 (Cross-Reference Matrix)

아래 매트릭스는 각 섹션이 다른 섹션의 어떤 요구사항에 의존하는지를 나타낸다.

| 의존 방향 (행 → 열 참조) | 01 개요 | 02 채증 | 03 SMS | 04 증거 | 05 탐지 | 06 UI | 07 API | 08 데이터모델 |
|------------------------|:------:|:------:|:------:|:------:|:------:|:-----:|:------:|:----------:|
| **01 개요** | - | | | | | | | |
| **02 채증 엔진** | US-A3,A6 | - | FR-SMS 연계 (2단계 회원가입) | FR-EV 연계 (해시/타임스탬프) | | | | |
| **03 SMS 인증** | US-A6 | FR-EC-007~009 (폼 탐지) | - | FR-EV-011 (감사 로그) | | | | |
| **04 증거 무결성** | US-D1~D3 | FR-EC-003~006 (캡처 결과) | FR-SMS-030~031 (법적 로깅) | - | | | | |
| **05 탐지 엔진** | US-A1,A2 | | | | - | | | FR-DM-001 (sites) |
| **06 대시보드/UI** | US-A3~A7, US-B1~B4, US-C1~C3, US-D1~D3 | FR-EC-025,032 (모니터링/CAPTCHA 큐) | FR-SMS-018~021 (비용 대시보드) | FR-EV-003,009,015,016 (검증/보고서) | FR-DE-013,030 (검토 큐/모니터링) | - | FR-API 전체 (데이터 페칭) | |
| **07 API 명세** | | FR-EC 전체 (채증 실행 API) | FR-SMS 전체 (SMS 설정 API) | FR-EV 전체 (증거 관리 API) | FR-DE 전체 (탐지 실행 API) | FR-UI 전체 (프론트엔드 호출) | - | FR-DM 전체 (Prisma 스키마) |
| **08 데이터 모델** | | FR-EC-024 (메타데이터) | FR-SMS 데이터 모델 | FR-EV-010~012 (감사 로그) | FR-DE-029 (탐지 결과 저장) | | FR-API 전체 (ORM 매핑) | - |

### 핵심 의존성 흐름

```
탐지 엔진(05) → 사이트 등록 → 채증 엔진(02) → SMS 인증(03) 연계
                                    ↓
                              증거 무결성(04) → 해시/타임스탬프 생성
                                    ↓
                              데이터 모델(08) ← API(07) ← 대시보드(06)
```

---

## 9. 월 예상 운영 비용 요약

| 비용 항목 | 월 예상 비용 (USD) | 비고 |
|----------|:-----------------:|------|
| SMS 인증 (PVAPins + 폴백) | $700 ~ 1,400 | 전체 운영비 최대 항목. 500건/월 기준 |
| 프록시 (IPRoyal/SOAX) | $100 ~ 500 | 레지덴셜 프록시 로테이션 |
| Claude Haiku 4.5 (분류/폼/CAPTCHA) | ~$22.50 | 배치 API + 프롬프트 캐싱 적용 |
| Claude Sonnet 4.6 (보고서 + Computer Use) | ~$15 ~ 25 | Computer Use 폴백 포함 |
| Google Custom Search API | ~$50 | 10,000 쿼리/월 기준 |
| CAPTCHA 솔버 (CapSolver + 2Captcha) | ~$2 | 출현 빈도 낮음 |
| Nstbrowser (Tier 2, 선택) | $0 ~ 30 | 필요 시 활성화 |
| **합계** | **$867 ~ 2,012** | **SMS 인증이 전체 비용의 70~80% 차지** |

---

## 10. 부록 (Appendix)

### 10.1 관련 기획 문서 목록

| 문서 | 경로 | 설명 |
|------|------|------|
| 서비스 컨셉 기획서 | [`docs/planning/service-concept.md`](./planning/service-concept.md) | 초기 서비스 컨셉, 시스템 구조, Phase 정의, KPI 목표 |
| 기술 리서치 보고서 | [`docs/planning/research-report.md`](./planning/research-report.md) | 불법 도박 시장 현황, 기술 장벽, 법률/규제 분석 |
| 기술 심층 리서치 종합 보고서 | [`docs/planning/plan1.5-tech-review/consolidated-report.md`](./planning/plan1.5-tech-review/consolidated-report.md) | 브라우저 자동화, SMS 인증, 오픈소스, LLM 통합 종합 분석 |
| 브라우저 자동화 리서치 | [`docs/planning/plan1.5-tech-review/topic1-browser-automation.md`](./planning/plan1.5-tech-review/topic1-browser-automation.md) | rebrowser-playwright, stealth 플러그인, 안티봇 우회 분석 |
| 한국 SMS 인증 리서치 | [`docs/planning/plan1.5-tech-review/topic2-korean-verification.md`](./planning/plan1.5-tech-review/topic2-korean-verification.md) | PVAPins, GrizzlySMS, SMS-Activate, Non-VoIP vs VoIP 비교 |
| 오픈소스 솔루션 리서치 | [`docs/planning/plan1.5-tech-review/topic3-opensource-solutions.md`](./planning/plan1.5-tech-review/topic3-opensource-solutions.md) | Crawlee, SingleFile, warcio, OpenTimestamps 분석 |
| Claude LLM 통합 리서치 | [`docs/planning/plan1.5-tech-review/topic4-claude-llm-integration.md`](./planning/plan1.5-tech-review/topic4-claude-llm-integration.md) | Claude 모델 선택, 비용 최적화, Computer Use 분석 |
| 의사결정 로그 | [`docs/planning/decisions.md`](./planning/decisions.md) | Plan 1.5 기술 심층 리서치 결과에 따른 주요 의사결정 기록 |
| CAPTCHA 전략 | [`docs/planning/captcha-strategy.md`](./planning/captcha-strategy.md) | CAPTCHA 하이브리드 처리 전략 (CapSolver + 2Captcha + 수동 개입) |
| Playwright 테스트 보고서 | [`docs/planning/playwright-test-report.md`](./planning/playwright-test-report.md) | 실제 불법 도박 사이트 접속 테스트 결과 (Wego88, TotoHot 등) |
| 진행 현황 | [`docs/planning/progress.md`](./planning/progress.md) | 프로젝트 진행 상황 추적 |

### 10.2 개발 가이드 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| 프로젝트 구조 | [`docs/guides/project-structure.md`](./guides/project-structure.md) | 디렉토리 구조, 파일 네이밍 규칙 |
| 스타일링 가이드 | [`docs/guides/styling-guide.md`](./guides/styling-guide.md) | TailwindCSS v4, shadcn/ui 스타일링 규칙 |
| 컴포넌트 패턴 | [`docs/guides/component-patterns.md`](./guides/component-patterns.md) | 서버/클라이언트 컴포넌트 분리, 데이터 페칭 패턴 |
| Next.js 15 가이드 | [`docs/guides/nextjs-15.md`](./guides/nextjs-15.md) | Next.js 15.5.3 App Router 전문 가이드 |
| 폼 처리 가이드 | [`docs/guides/forms-react-hook-form.md`](./guides/forms-react-hook-form.md) | React Hook Form + Zod + Server Actions 통합 가이드 |

### 10.3 법적 근거 요약

| 법률/규정 | 관련 조항 | 적용 범위 |
|----------|----------|----------|
| 형사소송법 | 제313조 (진술서 등의 증거능력), 제292조의2 (디지털 증거) | 디지털 증거 수집 및 법정 제출 |
| 형법 | 제246조~247조 (도박 관련 조항) | 불법 도박 수사 근거 |
| 국민체육진흥법 | 불법 사행행위 규정 | 불법 스포츠 토토 단속 근거 |
| 개인정보보호법 | 제3조, 제15조, 제29조 | 개인정보 최소 수집, 안전조치 의무 |
| 정보통신망법 | 제44조의5 | 가상번호 사용 법적 검토 필요 |
| 전기통신사업법 | 제32조의3, 제83조 | 가상번호 사용 적법성 검토 |
| 통신비밀보호법 | 제13조 | SMS 수집 관련 법적 근거 |
| 대검찰청 예규 | "디지털 증거의 수집/분석 및 관리 규정" | 증거 수집, 보관, 분석, 제출 절차 |
| 법원 행정규칙 | "디지털 증거의 처리 등에 관한 규칙" | 법원 제출용 디지털 증거 처리 기준 |

---

## 11. 문서 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-03-14 | 기획팀 | PRD 통합 문서 초안 완료 (8개 섹션 작성 완료) |

---

> **참고**: 본 문서는 PRD의 진입점(Entry Point) 문서로서, 각 섹션의 상세 요구사항은 위 목차의 링크를 통해 해당 섹션 문서에서 확인할 수 있다. 전체 시스템의 아키텍처, 비용, 일정에 대한 포괄적 이해를 위해 본 문서를 먼저 참조한 후, 필요한 섹션을 상세 열람하는 것을 권장한다.
