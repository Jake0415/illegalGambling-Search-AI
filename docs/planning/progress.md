# 기획 진행 상황

## 현재 단계

- **단계**: Plan 3 - PRD v1.1 검증 완료 / ROADMAP 업데이트 완료
- **상태**: PRD v1.1-ROADMAP 정합성 검증 완료 (조건부 통과)
- **최종 업데이트**: 2026-03-15

## 완료된 작업

### Plan 1: 서비스 리서치 및 컨셉 기획 (2026-03-14)

#### 1단계: 웹 리서치 - 완료
- [x] 유사 서비스/제품 조사 (KAIST Gamble Tracker, UK Gambling Commission 등)
- [x] 활용 가능한 기술/도구 조사 (Playwright, CAPTCHA 솔버, SMS 서비스, 프록시 등)
- [x] 한국 법률/규제 조사 (형법, 국민체육진흥법, 디지털 증거 수집 가이드라인)
- [x] 기술 트렌드 조사 (AI 탐지, 안티봇 우회, 브라우저 핑거프린팅)

#### 2단계: 리서치 결과 정리 - 완료
- [x] `docs/planning/research-report.md` 작성 완료

#### 3단계: 서비스 구성 기획 - 완료
- [x] `docs/planning/service-concept.md` 작성 완료

#### 4단계: progress.md 업데이트 - 완료
- [x] 현재 문서

#### 5단계: Slack 보고 - 완료
- [x] Slack #claude-status 채널에 Gate Review 보고 전송 (ts: 1773448216.995769)

#### 6단계: 테스트 결과 기획 문서 반영 - 완료
- [x] `service-concept.md` — 섹션 2 (핵심 기능) 테스트 결과 반영 (SMS OTP 우선, 팝업 처리, 도메인 호핑)
- [x] `service-concept.md` — 섹션 5 (외부 서비스) 비용 재산정 (CAPTCHA 비용 하향, SMS/프록시 우선순위 상향)
- [x] `service-concept.md` — 섹션 6 (MVP) Phase 2 우선순위 재조정 (SMS 인증 > CAPTCHA)
- [x] `service-concept.md` — 섹션 7.1 (기술 리스크) 우선순위 재조정 (SMS OTP, 도메인 호핑 1~2위)
- [x] `service-concept.md` — 중복 섹션 번호 수정 (2.4 중복 → 2.6 대시보드)
- [x] `research-report.md` — 섹션 5 (실제 사이트 접속 테스트 결과) 신규 추가
- [x] `research-report.md` — 결론 업데이트 (CAPTCHA 비중 하향, SMS OTP/도메인 호핑 최대 리스크)

### Plan 1.5: 기술 심층 리서치 (2026-03-14)

#### Topic 1: Playwright 유사 솔루션 검토 (browser-automation-specialist) - 완료
- [x] playwright-extra / stealth plugin 평가
- [x] rebrowser-patches / rebrowser-playwright 평가
- [x] 안티디텍트 브라우저 비교 (Nstbrowser, Multilogin, GoLogin, MoreLogin)
- [x] 헤드리스 브라우저 서비스 (Browserless, BrowserBase) 평가
- [x] 스크래핑 API (ScrapingBee, Apify/Crawlee) 평가
- [x] 의사결정 매트릭스 + 최종 추천

#### Topic 2: 한국 본인인증 방법 검토 (sms-verification-specialist) - 완료
- [x] SMS OTP 가상번호 서비스 6개 비교 (GrizzlySMS, PVAPins, SMS-Activate, 5sim, SMSOnline, Quackr)
- [x] PASS 앱, 통신사 인증, 아이핀, 카카오/네이버, ARS 평가
- [x] 법적 고려사항 분석
- [x] 우선순위 체인 최종 추천

#### Topic 3: 오픈소스 솔루션 검토 (crawler-search-specialist + investigation-architect) - 완료
- [x] 웹 크롤링 프레임워크 비교 (Crawlee, Scrapy, Colly, node-crawler)
- [x] CAPTCHA 풀이 오픈소스 ROI 분석
- [x] 안티봇 우회 라이브러리 비교
- [x] 디지털 증거 수집 도구 (Autopsy, Webrecorder, SingleFile) 평가
- [x] 도박/불법 사이트 탐지 학술 연구 조사
- [x] 증거 무결성 도구 (OpenTimestamps, RFC 3161) 평가
- [x] 채택 vs 자체 구현 의사결정 표

#### Topic 4: Claude LLM 연동 검토 (team-leader) - 완료
- [x] 사이트 콘텐츠 분류 능력 평가 (F1 94-95%)
- [x] Claude vs 전통 ML 비교
- [x] 폼 필드 자동 탐지 (Vision API)
- [x] CAPTCHA 분석 (탐지 vs 풀이, ToS)
- [x] 증거 보고서 생성
- [x] API 가격·모델 선택 + 월 비용 시뮬레이션
- [x] Computer Use 평가 (폴백 전용 결정)
- [x] MCP 연동 아키텍처

#### 팀장 취합 - 완료
- [x] 4개 토픽 교차 검토
- [x] 통합 보고서 작성 (`docs/planning/plan1.5-tech-review/consolidated-report.md`)
- [x] 기술 의사결정 7건 기록 (`docs/planning/decisions.md`)
- [x] progress.md 업데이트

## 산출물

| 문서 | 경로 | 상태 |
|------|------|------|
| 리서치 보고서 | `docs/planning/research-report.md` | 완료 (테스트 결과 반영) |
| 서비스 컨셉 | `docs/planning/service-concept.md` | 완료 (테스트 결과 전면 반영) |
| CAPTCHA 대응 전략 | `docs/planning/captcha-strategy.md` | 완료 (실제 테스트 반영) |
| Playwright 테스트 보고서 | `docs/planning/playwright-test-report.md` | 완료 |
| 진행 상황 | `docs/planning/progress.md` | 완료 |
| **[Plan 1.5]** Topic 1: 브라우저 자동화 | `docs/planning/plan1.5-tech-review/topic1-browser-automation.md` | 완료 |
| **[Plan 1.5]** Topic 2: 한국 본인인증 | `docs/planning/plan1.5-tech-review/topic2-korean-verification.md` | 완료 |
| **[Plan 1.5]** Topic 3: 오픈소스 솔루션 | `docs/planning/plan1.5-tech-review/topic3-opensource-solutions.md` | 완료 |
| **[Plan 1.5]** Topic 4: Claude LLM 연동 | `docs/planning/plan1.5-tech-review/topic4-claude-llm-integration.md` | 완료 |
| **[Plan 1.5]** 통합 보고서 | `docs/planning/plan1.5-tech-review/consolidated-report.md` | 완료 |
| 의사결정 로그 | `docs/planning/decisions.md` | 완료 (11건 기록: 7건 기술 리서치 + 4건 백엔드 아키텍처) |
| **[검증]** PRD-ROADMAP 정합성 보고서 | `docs/planning/prd-roadmap-validation-report.md` | 완료 (조건부 통과) |
| **[Plan 2]** 통합 PRD | `docs/PRD.md` | 완료 |
| **[Plan 2]** 제품 개요 및 스토리 | `docs/PRD-sections/01-overview-and-stories.md` | 완료 |
| **[Plan 2]** 채증 엔진 PRD | `docs/PRD-sections/02-evidence-collection-engine.md` | 완료 |
| **[Plan 2]** SMS 인증 PRD | `docs/PRD-sections/03-sms-authentication.md` | 완료 |
| **[Plan 2]** 증거 무결성 PRD | `docs/PRD-sections/04-evidence-integrity.md` | 완료 |
| **[Plan 2]** 탐지 엔진 PRD | `docs/PRD-sections/05-detection-engine.md` | 완료 |
| **[Plan 2]** 대시보드/UI PRD | `docs/PRD-sections/06-dashboard-and-ui.md` | 완료 |
| **[Plan 2]** API 명세 PRD | `docs/PRD-sections/07-api-specification.md` | 완료 |
| **[Plan 2]** 데이터 모델 PRD | `docs/PRD-sections/08-data-model.md` | 완료 |

## Slack 답글 추적

- **마지막 처리 답글 ts**: 1773440707.477799
- **채널**: C0AHUT40AE5

## 이메일 전송 이력

| 날짜 | 제목 | 수신자 | 상태 |
|------|------|--------|------|
| 2026-03-14 | Slack-이메일 연동 테스트 보고서 | yhk71261@gmail.com | 전송 완료 |

### Plan 2: PRD 작성 (2026-03-14)

#### Phase A: 핵심 기능 요구사항 - 완료
- [x] `docs/PRD-sections/01-overview-and-stories.md` — 제품 개요, 4개 페르소나, 17개 사용자 스토리
- [x] `docs/PRD-sections/02-evidence-collection-engine.md` — 채증 엔진 (FR-EC-001~034, 34개 요구사항)
- [x] `docs/PRD-sections/03-sms-authentication.md` — SMS 인증 자동화 (FR-SMS-001~031, 31개 요구사항)
- [x] `docs/PRD-sections/04-evidence-integrity.md` — 증거 무결성 (FR-EV-001~017, 17개 요구사항)
- [x] `docs/PRD-sections/05-detection-engine.md` — 탐지 엔진 (FR-DE-001~030, 30개 요구사항)

#### Phase B: 대시보드/API/데이터모델 + 통합 - 완료
- [x] `docs/PRD-sections/06-dashboard-and-ui.md` — 대시보드/UI (FR-UI-001~035, 35개 요구사항)
- [x] `docs/PRD-sections/07-api-specification.md` — REST API 명세 (FR-API-001~049, 49개 요구사항)
- [x] `docs/PRD-sections/08-data-model.md` — 데이터 모델 (FR-DM-001~020, 20개 요구사항, 21개 테이블)
- [x] 8개 섹션 교차 검토 — 역할 정의, enum 일관성, 참조 오류 5건 수정
- [x] `docs/PRD.md` — 통합 PRD (목차, 요약, 용어집, 교차 참조 매트릭스)

#### PRD 통계 요약
- **총 기능 요구사항**: 216개 (FR-EC 34 + FR-SMS 31 + FR-EV 17 + FR-DE 30 + FR-UI 35 + FR-API 49 + FR-DM 20)
- **사용자 스토리**: 17개 (4개 페르소나)
- **데이터 테이블**: 21개
- **API 엔드포인트**: 49개
- **의사결정**: 11건 (decisions.md) — 7건 기술 리서치 + 4건 백엔드 아키텍처

### 백엔드 아키텍처 결정 (2026-03-15)

- [x] FastAPI (Python) 백엔드 프레임워크 결정 — LangChain/LangGraph 네이티브 연동
- [x] PostgreSQL 유지, ORM을 Prisma -> SQLAlchemy + Alembic으로 전환 결정
- [x] MinIO (S3 호환) 오브젝트 스토리지 확정
- [x] LangChain + LangGraph AI 오케스트레이션 채택
- [x] 프로젝트 구조 분리: `frontend/` (Next.js) + `backend/` (FastAPI)
- [x] 관련 기획 문서 업데이트 (decisions.md 4건, ROADMAP.md, service-concept.md, progress.md)

#### LangChain/LangGraph 활용 포인트

| 활용처 | 기술 | 설명 |
| ------ | ---- | ---- |
| 사이트 분류 | LangChain + Claude Haiku | 도박 여부 판정, F1 94-95% |
| 채증 워크플로우 | LangGraph 상태 머신 | 3단계 파이프라인, 분기/재시도/수동 개입 |
| 키워드 생성 | LangChain | 시드 키워드 -> 유사 키워드 자동 확장 |
| 보고서 생성 | LangChain + Claude Sonnet | 한국어 수사 보고서 자동 생성 |
| CAPTCHA 판단 | LangGraph 분기 로직 | 유형 판별 -> API/수동/스킵 분기 |

### PRD v1.1 - ROADMAP 정합성 검증 (2026-03-15)

- [x] PRD v1.1 분석 (기술 스택 전환, 아키텍처 결정 #8~#12)
- [x] ROADMAP Phase 3/4 업데이트 (구 기술 참조 10건 수정)
  - BullMQ -> Celery, Crawlee -> Scrapy+scrapy-playwright, fingerprint-suite -> playwright-stealth
  - warcio.js -> Python warcio, opentimestamps JS -> Python, @react-pdf -> WeasyPrint/reportlab
  - normalize-url -> Python url-normalize, BullMQ repeat -> Celery Beat
- [x] PRD-ROADMAP 교차 검증 (216개 요구사항 매핑 확인, 구 기술 잔존 0건)
- [x] 검증 보고서 작성 (`docs/planning/prd-roadmap-validation-report.md`)
- **판정**: 조건부 통과 (Major Issue 2건: LangGraph Task 명시성, rebrowser-playwright Python 호환성)

## 다음 단계

- **Phase 2 준비: UI/UX 화면 정의서 작성** (`docs/ui-specs/`, 1주)
  - [ ] Round 1: 데이터 테이블 페이지 5개 (사이트, 채증, 증거, 검토, 설정)
  - [ ] Round 2: 대시보드/카드 페이지 2개 (메인 대시보드, SMS 비용)
  - [ ] Round 3: 차트/시각화 1개 (통계)
  - [ ] Round 4: 폼/특수 페이지 4개 (CAPTCHA, 보고서, 로그인, 위저드)
  - [ ] Round 5: 공통 2개 (반응형+다크모드, 통합 검증)
  - 산출물: 14개 화면 정의서 (`docs/ui-specs/*.md`)
  - 각 정의서 포함 항목: 페이지 목적, ASCII 와이어프레임, 컴포넌트 목록, 데이터 바인딩, 인터랙션, PRD 매핑(FR-UI-xxx)

- Plan 3: 기술 설계 (아키텍처, DB, API 상세 설계)
  - 시스템 아키텍처 설계 (컴포넌트 다이어그램, 시퀀스 다이어그램)
  - **SQLAlchemy 모델 설계** (Prisma 스키마 21개 모델 기반 전환)
  - **FastAPI 라우터 구조 설계** (35개 엔드포인트)
  - **LangGraph 워크플로우 그래프 설계** (채증 파이프라인 상태 머신)
  - CI/CD 파이프라인 설계
  - 개발 환경 구성 (Docker Compose: Next.js + FastAPI + PostgreSQL + Redis + MinIO)
