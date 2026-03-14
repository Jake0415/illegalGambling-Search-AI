# Plan 1.5 통합 보고서 — 기술 심층 리서치 취합

> 작성일: 2026-03-14
> 작성: team-leader (4개 전문가 리뷰 취합)

---

## 핵심 요약

### Topic 1: 브라우저 자동화
**`rebrowser-playwright`를 Tier 1으로 즉시 도입** (무료, 드롭인 교체). Runtime.Enable CDP 유출을 패치하여 Cloudflare/DataDome 수준 안티봇을 우회. ~85% 사이트 커버. 강화 필요 시 Nstbrowser($30/월) 또는 Browserless($200/월)로 Tier 2 확장.

### Topic 2: 한국 본인인증
**SMS OTP가 유일한 자동화 경로**. PASS/아이핀/카카오/네이버는 실제 통신사 가입 필수 → 순환 의존성. 불법 도박사이트는 정식 인증 API 사용 불가하므로 대부분 단순 SMS OTP 채택. PVAPins(Non-VoIP) 1순위, GrizzlySMS/SMS-Activate 2순위. 법적 검토 필요.

### Topic 3: 오픈소스 솔루션
**Crawlee + fingerprint-suite + got-scraping** (Apify 생태계) 즉시 채택. OpenTimestamps(무료 블록체인 타임스탬핑) + SingleFile CLI(증거 HTML) + WARC 저장. CAPTCHA 오픈소스는 비채택 ($2/월 API가 더 효율적). ML 탐지는 데이터 축적 후 2단계 도입.

### Topic 4: Claude LLM 연동
**Haiku 4.5 기본 모델** — 콘텐츠 분류(F1 94-95%), 폼 필드 탐지, CAPTCHA 유형 탐지에 사용. Sonnet 4.6은 보고서 생성 전용. **MVP 월 ~$25.50** (배치 API 시 ~$15). Computer Use는 폴백 전용 (Playwright 대비 50x 느리고 3000x 비쌈). MCP 아키텍처는 중기 목표.

---

## 1. 브라우저 자동화 전략 (Topic 1)

### 채택 결정

| 구성 | 도구 | 비용 | 역할 |
|------|------|------|------|
| **Tier 1 (기본)** | rebrowser-playwright | $0 | Playwright 드롭인 교체, CDP 유출 패치, ~85% 커버 |
| **Tier 2 (강화)** | Nstbrowser | $30/월 | 안티디텍트 프로필, Canvas/WebGL/TLS 핑거프린트 격리 |
| **Tier 2 (대안)** | Browserless | $200/월 | 클라우드 관리형, LiveURL로 Pause&Attach 직접 지원 |
| **Tier 3 (확장)** | Crawlee | $0 | 대규모 크롤링 인프라 (큐, 리트라이, 프록시 로테이션) |

### 비채택

| 도구 | 사유 |
|------|------|
| ScrapingBee | 멀티스텝 플로우 미지원 |
| MoreLogin | API 미제공, 자동화 통합 불가 |
| Multilogin | Nstbrowser 대비 비용 효율 낮음 |

### 교차 검토
- Topic 3의 **fingerprint-suite**가 rebrowser-playwright와 조합되어 Canvas/WebGL 핑거프린트 관리 보완
- Topic 4의 **Computer Use**는 rebrowser-playwright 실패 시 폴백으로 연계

---

## 2. 한국 본인인증 전략 (Topic 2)

### 인증 방식 우선순위 체인

```
Primary     → PVAPins Non-VoIP ($0.50~2.00/건, 성공률 ~70%)
Fallback 1  → GrizzlySMS / SMS-Activate VoIP ($0.86~1.00/건, 성공률 ~40%)
Fallback 2  → 수사용 실제 선불 SIM 카드 풀 (100% 성공, 물리적 부담)
Manual      → Slack 알림 → 담당자 직접 인증 (5분 응답 목표)
```

### 핵심 발견

| 인증 방식 | 자동화 가능 | 도박사이트 사용 | 결론 |
|-----------|-----------|---------------|------|
| **SMS OTP** | **가능** | **대부분** | **유일한 경로** |
| PASS 앱 | 실제 SIM 필수 | 거의 없음 (정식 계약 불가) | 비실용적 |
| 통신사 인증 | 불가 (가입자 DB 대조) | 거의 없음 | 불가 |
| 아이핀 | SMS 필요 (순환 의존) | 없음 (정식 계약 불가) | 불가 |
| 카카오/네이버 | 전화번호 필요 (순환 의존) | 없음 (정식 계약 불가) | 불가 |
| ARS | 음성 수신 불가 | 거의 없음 (금융기관 전용) | 불가 |

### 비용 추정 (500건/월)

- PVAPins 중심 (성공률 70%): ~$500~1,000/월
- GrizzlySMS 폴백 포함: 추가 ~$200~400/월
- **총 SMS 인증 비용: ~$700~1,400/월** (전체 운영비 최대 항목)

### 법적 고려
- 기회제공형 수사에 해당 가능 (이미 운영 중인 불법 사이트)
- 직접 판례 없음 → **수사기관 법무팀 사전 확인 권장**
- 즉시 실행: PVAPins + GrizzlySMS 테스트 번호 1~2개 구매 → 실제 OTP 수신 테스트

### 교차 검토
- Topic 4의 **폼 필드 자동 탐지**(Claude Vision)가 미지 사이트의 전화번호 입력 필드를 자동 식별하여 SMS 인증 플로우에 연계

---

## 3. 오픈소스 채택 목록 (Topic 3)

### 채택 vs 자체 구현 결정

| 도구 | 결정 | 우선순위 | 근거 |
|------|------|---------|------|
| **Crawlee** | 채택 | P0 | Node.js 네이티브, Playwright 통합, 22.2k stars |
| **got-scraping** | 채택 | P0 | HTTP 수준 TLS 핑거프린트 모방 |
| **fingerprint-suite** | 채택 | P0 | Playwright 핑거프린트 주입, Crawlee 생태계 |
| **OpenTimestamps** | 채택 | P0 | 무료 비트코인 타임스탬프, 증거 무결성 |
| **SingleFile CLI** | 채택 | P1 | 단일 HTML 증거 파일 생성 |
| **WARC (warcio.js)** | 자체 구현 | P1 | WARC 저장 파이프라인 라이브러리 활용 |
| **RFC 3161** | 자체 구현 | P1 | 경량 TSA 클라이언트, OpenTimestamps와 이중화 |
| **CapSolver/2Captcha** | 채택 (API) | P1 | $2/월, 오픈소스 ROI 없음 |
| **URLBERT/URLTran** | 2단계 채택 | P2 | 데이터 축적 후 파인튜닝 |
| CAPTCHA 오픈소스 | 비채택 | - | 월 $2 API vs 40시간+ 구축 비용 |
| Autopsy/Sleuth Kit | 비채택 | - | 디스크 포렌식, 웹 증거 목적 불일치 |
| Colly/node-crawler | 비채택 | - | JS 렌더링/안티봇 미지원 |

### 증거 패키지 구조 (권장)

```
evidence_package/
  evidence.warc.gz          # WARC 원본 트래픽
  screenshot.png            # 시각적 증거
  page.html                 # SingleFile 단일 HTML
  metadata.json             # URL, 타임스탬프, 해시, 수집 조건
  hash_manifest.sha256      # SHA-256 해시 목록
  timestamp_proof.ots       # OpenTimestamps 인증
  collection_log.json       # 수집 과정 로그
```

### 교차 검토
- Crawlee + rebrowser-playwright(Topic 1) 조합으로 스텔스 크롤링 인프라 구성
- OpenTimestamps는 Topic 4의 증거 보고서 생성과 연계하여 보고서에도 타임스탬프 적용

---

## 4. LLM 연동 아키텍처 (Topic 4)

### 용도별 모델 배정

| 용도 | 모델 | 건당 비용 | 근거 |
|------|------|----------|------|
| 콘텐츠 분류 | Haiku 4.5 | $0.003 | Few-shot F1 94-95%, 최저 비용 |
| 폼 필드 탐지 | Haiku 4.5 | $0.003 | Vision API, 구조화 출력 |
| CAPTCHA 유형 탐지 | Haiku 4.5 | $0.003 | 탐지만 (풀이는 ToS 위반) |
| 워크플로우 결정 | Haiku 4.5 | $0.003 | 간단한 조건 분기 |
| 증거 보고서 | Sonnet 4.6 | $0.045 | 한국어 문서 생성 품질 |
| Computer Use 폴백 | Sonnet 4.6 | $0.30~0.50 | 미지 사이트 10%만 |

### 월 비용 시뮬레이션 (500사이트)

| 시나리오 | 월 비용 |
|---------|---------|
| MVP (Haiku 중심) | $15.00 |
| 권장 (Haiku + Sonnet 혼합) | $30.00 |
| 배치 API + 프롬프트 캐싱 적용 | **$12~15** |
| Computer Use 폴백 포함 | +$15~25 |

### 핵심 원칙
1. **CAPTCHA "풀이"에 Claude 사용 금지** — Anthropic ToS 위반
2. **Playwright 우선, Computer Use 보조** — 결정론적 작업은 Playwright
3. **MCP 아키텍처 중기 목표** — 워크플로우 중심 설계로 토큰 98.7% 절감
4. **배치 API + 프롬프트 캐싱 필수** — 60~70% 비용 절감

---

## 5. 수정된 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐     │
│  │ 대시보드  │ │ 사이트   │ │ 채증결과 │ │ CAPTCHA 수동 개입   │     │
│  │          │ │ 관리     │ │ 조회     │ │ (CDP Pause&Attach) │     │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js API Routes)                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐
│   탐지 엔진     │  │   채증 엔진     │  │   Claude LLM 계층       │
│  ┌───────────┐ │  │  ┌───────────┐ │  │  ┌──────────────────┐  │
│  │ Crawlee   │ │  │  │rebrowser- │ │  │  │ Haiku 4.5        │  │
│  │ (크롤링)  │ │  │  │playwright │ │  │  │ - 콘텐츠 분류     │  │
│  │ got-      │ │  │  │ (자동화)  │ │  │  │ - 폼 필드 탐지    │  │
│  │ scraping  │ │  │  │fingerprint│ │  │  │ - CAPTCHA 탐지    │  │
│  │ (HTTP)    │ │  │  │-suite     │ │  │  ├──────────────────┤  │
│  └───────────┘ │  │  └───────────┘ │  │  │ Sonnet 4.6       │  │
└────────────────┘  │  ┌───────────┐ │  │  │ - 보고서 생성     │  │
                    │  │CapSolver  │ │  │  │ - Computer Use   │  │
                    │  │(CAPTCHA)  │ │  │  └──────────────────┘  │
                    │  └───────────┘ │  └────────────────────────┘
                    │  ┌───────────┐ │
                    │  │ PVAPins   │ │
                    │  │(SMS OTP)  │ │
                    │  └───────────┘ │
                    └────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     증거 무결성 계층                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ SHA-256   │  │OpenTime-  │  │ RFC 3161  │  │ SingleFile     │  │
│  │ 해시      │  │stamps     │  │ TSA       │  │ + WARC 저장    │  │
│  └───────────┘  └───────────┘  └───────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Data Layer                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐      │
│  │  PostgreSQL   │  │  Redis/BullMQ│  │  S3/MinIO            │      │
│  │  (메인 DB)    │  │  (큐/캐시)   │  │  (증거 저장)          │      │
│  └──────────────┘  └──────────────┘  └──────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. 수정된 비용 분석

### 월 운영비 (500사이트/월 기준)

| 항목 | Plan 1 추정 | Plan 1.5 수정 | 변동 |
|------|-----------|-------------|------|
| SMS 인증 | $100~300 | **$700~1,400** | ↑ 성공률 반영 시 비용 증가 |
| 프록시 | $100~500 | $100~500 | 동일 |
| CAPTCHA | $50~200 | **~$2** | ↓↓ 실제 빈도 반영 |
| Claude LLM | (미포함) | **$15~30** | 신규 |
| 검색 API | $50 | $50 | 동일 |
| 브라우저 자동화 | (미포함) | **$0~30** | Tier 1 무료, Tier 2 시 $30 |
| 타임스탬프 | 무료 | 무료 | 동일 |
| **합계** | **$450~1,050** | **$867~2,012** | SMS 비용 증가가 주 요인 |

> **SMS 인증이 전체 운영비의 50~70%를 차지**. SMS 서비스 가격 협상 및 Non-VoIP 성공률 테스트가 비용 최적화의 핵심.

---

## 7. PRD(Plan 2)에 미치는 영향

### 신규 요구사항
1. **rebrowser-playwright 기반 채증 엔진** — Playwright 대체 명시
2. **Crawlee + fingerprint-suite 크롤링 인프라** — Phase 1에서 도입
3. **Claude Haiku 4.5 콘텐츠 분류 API** — ML 모델 대신 즉시 시작
4. **Claude Vision 폼 필드 자동 탐지** — 사이트별 어댑터 패턴 감소
5. **OpenTimestamps + RFC 3161 이중 타임스탬프** — 증거 무결성
6. **SingleFile + WARC 증거 패키지** — 법적 증거력 강화
7. **PVAPins Non-VoIP SMS API 연동** — 최우선 SMS 서비스
8. **CAPTCHA 유형 탐지 라우터** — Claude Vision + CapSolver/2Captcha

### 수정 요구사항
- MVP Phase 2에서 **SMS 인증을 CAPTCHA보다 우선** (이미 반영됨)
- AI 분류 모델을 Phase 3에서 **Claude few-shot → ML 하이브리드 단계적 전환**으로 변경
- **Computer Use는 Phase 4로 연기** (비용/속도 제약)

### 삭제 고려
- 독립 ML 분류 모델 (Phase 1~2에서는 불필요, Claude로 대체)
- 독립 CAPTCHA 유형 판별 로직 (Claude Vision으로 대체)

---

## 8. 의사결정 로그

`docs/planning/decisions.md`에 기록된 기술 의사결정 요약:

| # | 결정 | 근거 |
|---|------|------|
| 1 | rebrowser-playwright Tier 1 도입 | 무료, CDP 유출 패치, ~85% 커버리지 |
| 2 | PVAPins Non-VoIP 1순위 SMS 서비스 | 실제 통신사 SIM, VoIP 탐지 우회 |
| 3 | Crawlee + Apify 생태계 채택 | Node.js 네이티브, Playwright 통합 |
| 4 | Haiku 4.5 기본 LLM 모델 | $15~30/월, F1 94-95%, 학습 데이터 불필요 |
| 5 | OpenTimestamps 즉시 도입 | 무료 블록체인 타임스탬프 |
| 6 | CAPTCHA 오픈소스 비채택 | $2/월 API vs 40시간+ 구축 |
| 7 | Computer Use는 폴백 전용 | Playwright 대비 50x 느리고 비용 3000x |

상세: [`docs/planning/decisions.md`](../decisions.md)

---

## 부록: 개별 리뷰 문서

| 토픽 | 담당 | 문서 |
|------|------|------|
| Topic 1: 브라우저 자동화 | browser-automation-specialist | [`topic1-browser-automation.md`](topic1-browser-automation.md) |
| Topic 2: 한국 본인인증 | sms-verification-specialist | [`topic2-korean-verification.md`](topic2-korean-verification.md) |
| Topic 3: 오픈소스 솔루션 | crawler-search-specialist + investigation-architect | [`topic3-opensource-solutions.md`](topic3-opensource-solutions.md) |
| Topic 4: Claude LLM 연동 | team-leader | [`topic4-claude-llm-integration.md`](topic4-claude-llm-integration.md) |
