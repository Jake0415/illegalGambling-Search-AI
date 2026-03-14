# 개발 로드맵 (ROADMAP)

> **프로젝트**: illegalGambling-Search-AI (불법 도박 사이트 자동 검색/채증 시스템)
> **작성일**: 2026-03-14 (백엔드 아키텍처 반영: 2026-03-15)
> **PRD 기준**: v1.1 (216개 기능 요구사항, 17개 사용자 스토리, 21개 DB 테이블, 49개 API 엔드포인트)
> **백엔드 스택**: FastAPI (Python) + SQLAlchemy + LangChain/LangGraph + PostgreSQL + MinIO
> **프론트엔드 스택**: Next.js 15 (App Router) + React 19 + shadcn/ui
> **Task 파일**: `/tasks/XXX-task-name.md` 형식으로 관리

---

## 개발 Phase 개요

| Phase | 명칭 | 기간 | Task 수 | 핵심 목표 |
|-------|------|------|---------|----------|
| **Phase 1** | 애플리케이션 골격 구축 | 2주 | Task 001~010 | 라우트 구조, 타입 정의, DB 스키마, 레이아웃 골격 |
| **Phase 2** | UI/UX 완성 (더미 데이터) | 4주 (정의서 1주 + 구현 3주) | Task 011~024 | 화면 정의서 작성 후 UI 구현, 반응형, 역할별 메뉴, 공통 컴포넌트 |
| **Phase 3** | 핵심 기능 구현 (FastAPI 백엔드) | 5~6주 | Task 025~044 | FastAPI 서버, SQLAlchemy DB 연동, 인증/RBAC, REST API, LangGraph 채증 파이프라인, 증거 무결성 |
| **Phase 4** | 고급 기능 및 최적화 | 4~5주 | Task 045~056 | SMS 자동 인증, AI 탐지, 실시간 모니터링, 네트워크 시각화, 배포 |

---

## Phase 1: 애플리케이션 골격 구축 (2주)

> **목표**: 전체 애플리케이션의 뼈대를 세운다. 라우트, 타입, 스키마, 레이아웃이 완성되어 이후 Phase에서 병렬 개발이 가능한 기반을 마련한다.

### Task 001: 생성 — 전체 라우트 구조 및 빈 페이지

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | 없음 |
| **PRD 참조** | FR-UI-001~035 (06절 전체 라우트 구조) |

**구현 사항:**
- [ ] 1. **22개 라우트 파일 생성**: PRD 06절 기반 `app/` 디렉토리 하위에 모든 `page.tsx` 생성 (빈 컴포넌트 + 페이지 제목만)
  ```
  /                              → app/(dashboard)/page.tsx
  /sites                         → app/(dashboard)/sites/page.tsx
  /sites/[id]                    → app/(dashboard)/sites/[id]/page.tsx
  /sites/new                     → app/(dashboard)/sites/new/page.tsx
  /sites/import                  → app/(dashboard)/sites/import/page.tsx
  /investigations                → app/(dashboard)/investigations/page.tsx
  /investigations/[id]           → app/(dashboard)/investigations/[id]/page.tsx
  /investigations/gallery        → app/(dashboard)/investigations/gallery/page.tsx
  /investigations/[id]/results   → app/(dashboard)/investigations/[id]/results/page.tsx
  /investigations/captcha-queue  → app/(dashboard)/investigations/captcha-queue/page.tsx
  /evidence                      → app/(dashboard)/evidence/page.tsx
  /evidence/[id]/verify          → app/(dashboard)/evidence/[id]/verify/page.tsx
  /evidence/[id]/report          → app/(dashboard)/evidence/[id]/report/page.tsx
  /evidence/[id]/audit           → app/(dashboard)/evidence/[id]/audit/page.tsx
  /review                        → app/(dashboard)/review/page.tsx
  /review/[id]                   → app/(dashboard)/review/[id]/page.tsx
  /analytics                     → app/(dashboard)/analytics/page.tsx
  /reports                       → app/(dashboard)/reports/page.tsx
  /settings                      → app/(dashboard)/settings/page.tsx
  /settings/users                → app/(dashboard)/settings/users/page.tsx
  /settings/keywords             → app/(dashboard)/settings/keywords/page.tsx
  /settings/audit-log            → app/(dashboard)/settings/audit-log/page.tsx
  /setup                         → app/setup/page.tsx
  /login                         → app/(auth)/login/page.tsx (기존 유지)
  /signup                        → app/(auth)/signup/page.tsx (기존 유지)
  ```
- [ ] 2. **라우트 그룹 레이아웃 분리**: `(dashboard)` 그룹에 인증 필요 레이아웃, `(auth)` 그룹에 비인증 레이아웃, `/setup`은 독립 레이아웃 적용
- [ ] 3. **각 빈 페이지에 메타데이터 설정**: `generateMetadata()` 또는 `export const metadata`로 페이지별 title 설정
- [ ] 4. **`not-found.tsx`, `error.tsx`, `loading.tsx` 글로벌 파일 생성**: App Router 에러/로딩 핸들링 골격

---

### Task 002: 정의 — TypeScript 인터페이스 및 타입 체계

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | 없음 |
| **PRD 참조** | FR-DM-001~020 (08절), FR-API-001~049 (07절) |

**구현 사항:**
- [ ] 1. **도메인 타입 정의** (`src/types/domain.ts`): `Site`, `Investigation`, `EvidenceFile`, `HashRecord`, `Timestamp`, `AuditLog`, `SmsNumber`, `SmsMessage`, `ManualIntervention`, `Keyword`, `DetectionResult`, `ClassificationResult`, `DomainHistory`, `DomainCluster`, `User`, `SystemSetting`, `PopupPattern` 인터페이스
- [ ] 2. **Enum 타입 정의** (`src/types/enums.ts`): `SiteStatus`, `SiteCategory`, `InvestigationStatus`, `EvidenceFileType`, `HashAlgorithm`, `VerificationStatus`, `TimestampType`, `AuditAction`, `SmsProvider`, `SmsNumberStatus`, `InterventionType`, `InterventionStatus`, `DetectionSource`, `ClassificationModel`, `ReviewStatus`, `DomainStatus`, `UserRole` 등 PRD 08절 전체 enum
- [ ] 3. **API 요청/응답 타입 정의** (`src/types/api.ts`): 공통 응답 래퍼(`ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`), 각 엔드포인트별 Request/Response DTO
- [ ] 4. **폼 스키마 타입 정의** (`src/types/forms.ts`): Zod 스키마로 로그인, 사이트 등록, 채증 실행, 사용자 생성, 시스템 설정 등 폼 유효성 검증 스키마 정의
- [ ] 5. **타입 barrel export** (`src/types/index.ts`): 모든 타입 모듈의 재수출

---

### Task 003: 설계 — Prisma 스키마 정의

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 002 |
| **PRD 참조** | FR-DM-001~020 (08절 전체) |

**구현 사항:**
- [ ] 1. **Prisma 스키마 작성** (`prisma/schema.prisma`): PRD 08절의 21개 테이블 전체 스키마를 단일 파일에 정의. UUID v7, snake_case 매핑, 소프트 삭제, 감사 필드, JSON 필드, Enum 타입 모두 반영
- [ ] 2. **핵심 엔티티 (A절)**: `Site`, `Investigation`, `EvidenceFile` 모델 + 관계 정의 + 인덱스
- [ ] 3. **증거 무결성 (B절)**: `HashRecord`, `Timestamp`, `AuditLog` 모델 (해시 체인 `prevHash` 필드 포함)
- [ ] 4. **SMS/수동개입/탐지/도메인/사용자/설정/팝업 (C~I절)**: `SmsNumber`, `SmsMessage`, `ManualInterventionQueue`, `Keyword`, `DetectionResult`, `ClassificationResult`, `DomainHistory`, `DomainCluster`, `SiteDomainCluster`, `User`, `Account`, `Session`, `VerificationToken`, `SystemSetting`, `PopupPattern` 모델
- [ ] 5. **인덱스 전략 (J절)**: FR-DM-019 기준 모든 단일/복합 인덱스 정의
- [ ] 6. **Seed 스크립트 골격** (`prisma/seed.ts`): 초기 슈퍼어드민 계정, 기본 시스템 설정 키, 초기 키워드 시드 데이터 템플릿 작성 (실제 DB 연동은 Phase 3)

---

### Task 004: 구축 — 대시보드 공통 레이아웃 골격

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 001 |
| **PRD 참조** | FR-UI-033 (반응형), FR-UI-034 (로딩/에러), FR-UI-035 (접근성) |

**구현 사항:**
- [ ] 1. **접이식 사이드바 컴포넌트** (`src/components/layout/sidebar.tsx`): 대시보드 좌측 네비게이션. 섹션별 메뉴 그룹 (사이트, 채증, 증거, AI 검토, 분석, 설정). 접기/펴기 토글, 로고, 현재 사용자 정보 표시
- [ ] 2. **대시보드 헤더 컴포넌트** (`src/components/layout/dashboard-header.tsx`): 페이지 타이틀, 브레드크럼, 사용자 드롭다운 (프로필, 설정, 로그아웃), 알림 벨 아이콘
- [ ] 3. **대시보드 레이아웃** (`app/(dashboard)/layout.tsx`): 사이드바 + 헤더 + 메인 콘텐츠 영역 조합. 반응형 (모바일에서 사이드바 숨김, 햄버거 메뉴)
- [ ] 4. **역할별 메뉴 가시성 구조**: 사이드바 메뉴 항목에 `requiredRole` 속성 부여. 현재 사용자 역할에 따라 표시/숨김 (더미 역할 사용)
- [ ] 5. **인증 레이아웃** (`app/(auth)/layout.tsx`): 로그인/회원가입 페이지용 중앙 정렬 카드 레이아웃
- [ ] 6. **초기 설정 위저드 레이아웃** (`app/setup/layout.tsx`): 단계별 위저드 UI 골격 (사이드바 없음, 스텝 인디케이터)

---

### Task 005: 구축 — 공통 UI 컴포넌트 기반 구성

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 004 |
| **PRD 참조** | FR-UI-033, FR-UI-034, FR-UI-035 |

**구현 사항:**
- [ ] 1. **데이터 테이블 기반 컴포넌트** (`src/components/common/data-table.tsx`): TanStack Table v8 래퍼. 서버사이드 정렬/필터/페이지네이션 지원, 컬럼 정의 타입 안전성
- [ ] 2. **상태 뱃지 컴포넌트** (`src/components/common/status-badge.tsx`): `SiteStatus`, `InvestigationStatus`, `VerificationStatus` 등 enum별 색상/아이콘 매핑
- [ ] 3. **페이지 컨테이너 컴포넌트** (`src/components/common/page-container.tsx`): 페이지 타이틀, 설명, 액션 버튼 영역, 콘텐츠 영역을 표준화
- [ ] 4. **로딩/에러/빈상태 컴포넌트**: `LoadingSkeleton`, `ErrorBoundary`, `EmptyState` 공통 컴포넌트
- [ ] 5. **확인 다이얼로그 컴포넌트** (`src/components/common/confirm-dialog.tsx`): 삭제, 실행 등 위험 액션 확인용

---

### Task 006: 정의 — 환경 변수 템플릿 및 설정

| 항목 | 내용 |
|------|------|
| **예상 소요** | 1일 |
| **선행 Task** | 없음 |
| **PRD 참조** | PRD 전체 기술 스택 |

**구현 사항:**
- [ ] 1. **`.env.example` 작성**: 모든 환경 변수 키와 설명 주석. DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, S3/MinIO 설정, Claude API Key, PVAPins/GrizzlySMS/SMS-Activate API Key, CapSolver/2Captcha API Key, Google Custom Search API Key, Slack Webhook URL, 프록시 설정
- [ ] 2. **`src/lib/env.ts`**: Zod 기반 환경 변수 유효성 검증 스키마. 서버/클라이언트 환경 변수 분리
- [ ] 3. **`src/lib/constants.ts`**: 시스템 상수 정의 (기본 타임아웃, 최대 재시도, 페이지네이션 기본값, 역할/권한 매핑 등)

---

### Task 007: 구축 — API Route Handler 골격

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 002 |
| **PRD 참조** | FR-API-001~049 (07절) |

**구현 사항:**
- [ ] 1. **API 디렉토리 구조 생성**: `app/api/` 하위 49개 엔드포인트의 `route.ts` 파일 생성 (빈 핸들러 + TODO 주석)
  ```
  app/api/auth/login/route.ts          (FR-API-001)
  app/api/auth/logout/route.ts         (FR-API-002)
  app/api/auth/me/route.ts             (FR-API-003)
  app/api/sites/route.ts               (FR-API-005~006)
  app/api/sites/[id]/route.ts          (FR-API-007~009)
  app/api/sites/import/route.ts        (FR-API-010)
  app/api/investigations/route.ts      (FR-API-011~012)
  app/api/investigations/[id]/route.ts (FR-API-013~015)
  app/api/investigations/[id]/results/route.ts (FR-API-016)
  app/api/investigations/captcha-queue/route.ts (FR-API-017~018)
  app/api/evidence/route.ts            (FR-API-019)
  app/api/evidence/[id]/route.ts       (FR-API-020)
  app/api/evidence/[id]/verify/route.ts (FR-API-021)
  app/api/evidence/[id]/download/route.ts (FR-API-022)
  app/api/evidence/[id]/report/route.ts (FR-API-023)
  app/api/review/route.ts              (FR-API-024~025)
  app/api/review/[id]/route.ts         (FR-API-026)
  app/api/detection/search/route.ts    (FR-API-027)
  app/api/detection/crawl/route.ts     (FR-API-028)
  app/api/detection/classify/route.ts  (FR-API-029)
  app/api/detection/domains/route.ts   (FR-API-030~031)
  app/api/detection/keywords/route.ts  (FR-API-032~033)
  app/api/analytics/overview/route.ts  (FR-API-034)
  app/api/analytics/sites/route.ts     (FR-API-035)
  app/api/analytics/investigations/route.ts (FR-API-036)
  app/api/analytics/costs/route.ts     (FR-API-037)
  app/api/reports/route.ts             (FR-API-038~039)
  app/api/reports/[id]/route.ts        (FR-API-040)
  app/api/settings/route.ts            (FR-API-041~042)
  app/api/settings/users/route.ts      (FR-API-043~044)
  app/api/settings/users/[id]/route.ts (FR-API-045)
  app/api/system/health/route.ts       (FR-API-046)
  app/api/sms/webhook/route.ts         (FR-SMS-008)
  app/api/sse/investigations/route.ts  (FR-API-047)
  ```
- [ ] 2. **API 공통 유틸리티**: 응답 래퍼(`apiResponse`, `apiError`), 미들웨어 체인(`withAuth`, `withRole`, `withValidation`), Rate Limiter 골격
- [ ] 3. **Zod 유효성 검증 스키마**: 각 엔드포인트의 요청 Body/Query 스키마 정의 (`src/lib/validations/`)

---

### Task 008: 정의 — 더미 데이터 및 Mock 서비스

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 002 |
| **PRD 참조** | 전체 |

**구현 사항:**
- [ ] 1. **더미 데이터 생성** (`src/lib/mock-data/`): 사이트 목록 30건, 채증 세션 50건, 증거 파일 100건, 감사 로그 200건, 사용자 10명 (역할별), 키워드 50개, 분류 결과 30건, 도메인 이력 등
- [ ] 2. **Mock API 핸들러**: Phase 2 UI 개발 시 사용할 인메모리 데이터 기반 CRUD 모의 구현
- [ ] 3. **더미 사용자 세션**: 4개 역할(`super_admin`, `admin`, `operator`, `investigator`, `legal`)별 모의 세션 데이터. 역할 전환 테스트용 UI 토글 포함
- [ ] 4. **더미 통계 데이터**: 대시보드 차트용 시계열 데이터 (일별 탐지 건수, 채증 성공률 추이, 비용 추이 등)

---

### Task 009: 구축 — 슈퍼어드민 초기 설정 위저드 골격

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 004 |
| **PRD 참조** | 슈퍼어드민 계정 구조, `/setup` 라우트 |

**구현 사항:**
- [ ] 1. **위저드 스텝 구조**: Step 1 (슈퍼어드민 계정 생성) -> Step 2 (DB 연결 설정) -> Step 3 (외부 서비스 API 키 입력) -> Step 4 (기본 시스템 설정) -> Step 5 (설정 확인 및 완료)
- [ ] 2. **스텝 인디케이터 컴포넌트**: 진행 상태 시각화 (완료/현재/대기)
- [ ] 3. **각 스텝 폼 UI 골격**: React Hook Form + Zod 스키마로 폼 골격만 구성 (실제 제출 로직은 Phase 3)
- [ ] 4. **`/setup` 접근 제어 로직**: 시스템 초기 상태(DB에 사용자 0명)일 때만 접근 가능. 설정 완료 후 자동 리디렉션

---

### Task 010: 정의 — 네비게이션 및 권한 매핑 설정

| 항목 | 내용 |
|------|------|
| **예상 소요** | 1일 |
| **선행 Task** | Task 004 |
| **PRD 참조** | FR-API-004 (RBAC), 슈퍼어드민 계정 구조 |

**구현 사항:**
- [ ] 1. **네비게이션 설정 파일** (`src/config/navigation.ts`): 사이드바 메뉴 항목 정의. 각 항목에 `href`, `icon`, `label`, `requiredRoles`, `children` 속성
- [ ] 2. **권한 매핑 설정** (`src/config/permissions.ts`): 5개 역할(`super_admin`, `admin`, `operator`, `investigator`, `legal`) x 리소스별 CRUD 권한 매트릭스
- [ ] 3. **메뉴 계층 구조**: 최상위 메뉴 (대시보드, 사이트, 채증, 증거, AI 검토, 분석, 보고서, 설정) + 하위 메뉴 정의

---

## Phase 2: UI/UX 완성 (더미 데이터) (4주: 정의서 1주 + 구현 3주)

> **목표**: 모든 페이지의 UI를 더미 데이터로 완성한다. 실제 백엔드 연동 없이 전체 사용자 경험을 검증할 수 있는 프로토타입 수준의 UI를 구축한다.
>
> **프로세스**: Phase 2는 2단계(Stage)로 진행한다. Stage 1에서 화면 정의서를 먼저 작성하고, Stage 2에서 정의서 기반으로 코드를 구현한다.

### Stage 1: UI/UX 화면 정의서 작성 (1주)

> **목표**: UI 코드 구현 전에 각 페이지의 UI/UX를 텍스트 기반으로 설계한다. 화면 정의서는 개발자와 기획자 간 커뮤니케이션 도구이자, 구현 시 참조하는 설계 문서 역할을 한다.
>
> **산출물 위치**: `docs/ui-specs/` 디렉토리에 14개 화면 정의서

**화면 정의서에 포함할 항목:**
- 페이지 목적 (사용자 니즈)
- 레이아웃 구조 (ASCII 와이어프레임)
- 컴포넌트 목록 (shadcn/ui + 커스텀)
- 데이터 바인딩 (mock 서비스/API 매핑)
- 사용자 인터랙션 (클릭, 필터, 정렬, 모달 등)
- PRD 요구사항 매핑 (FR-UI-xxx)

**작성 순서 (패턴별 묶음):**

| Round | 유형 | 대상 페이지 | 화면 정의서 파일 | 예상 소요 |
|-------|------|------------|-----------------|----------|
| Round 1 | 데이터 테이블 페이지 | 사이트 목록/상세, 채증 큐/결과, 증거 목록, 검토 큐, 설정 | `docs/ui-specs/sites.md`, `docs/ui-specs/investigations.md`, `docs/ui-specs/evidence.md`, `docs/ui-specs/review.md`, `docs/ui-specs/settings.md` | 2일 |
| Round 2 | 대시보드/카드 페이지 | 메인 대시보드, SMS 비용 대시보드 | `docs/ui-specs/dashboard.md`, `docs/ui-specs/sms-cost.md` | 0.5일 |
| Round 3 | 차트/시각화 | 통계 대시보드 | `docs/ui-specs/analytics.md` | 0.5일 |
| Round 4 | 폼/특수 페이지 | CAPTCHA 수동 개입, 보고서, 로그인/회원가입, 초기 설정 위저드 | `docs/ui-specs/captcha-queue.md`, `docs/ui-specs/reports.md`, `docs/ui-specs/auth.md`, `docs/ui-specs/setup-wizard.md` | 1일 |
| Round 5 | 공통/검증 | 반응형+다크모드 공통 규칙, 통합 검증 체크리스트 | `docs/ui-specs/responsive-darkmode.md`, `docs/ui-specs/integration-checklist.md` | 1일 |

---

### Stage 2: UI 코드 구현 (3주)

> **목표**: Stage 1에서 작성한 화면 정의서를 기반으로 모든 페이지의 UI를 코드로 구현한다. 각 Task 구현 시 해당 화면 정의서(`docs/ui-specs/`)를 참조한다.

### Task 011: 구현 — 메인 대시보드 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-001 (KPI 카드), FR-UI-002 (활동 피드), FR-UI-003 (채증 모니터링 미니), FR-UI-004 (외부 서비스 상태) |

**구현 사항:**
- [ ] 1. **KPI 요약 카드 4종**: 총 등록 사이트, 오늘 채증 완료, 채증 성공률, 대기 중 작업 수. 전일 대비 증감 표시
- [ ] 2. **최근 활동 피드**: 최근 채증 완료/실패, 신규 사이트 탐지, 수동 개입 요청 등 이벤트 타임라인 (더미 데이터)
- [ ] 3. **채증 진행 현황 미니 위젯**: 현재 진행 중인 채증 수, 대기 큐 크기, 최근 1시간 성공/실패 카운트
- [ ] 4. **외부 서비스 상태 카드**: SMS 잔여 크레딧, 프록시 상태, CAPTCHA 솔버 잔액 (더미)
- [ ] 5. **반응형 그리드 레이아웃**: 데스크톱 4열, 태블릿 2열, 모바일 1열

---

### Task 012: 구현 — 사이트 관리 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-005 (사이트 목록), FR-UI-006 (사이트 상세), FR-UI-007 (수동 URL 등록), FR-UI-008 (사이트 수정), FR-UI-009 (벌크 임포트), FR-UI-010 (카테고리/태그) |

**구현 사항:**
- [ ] 1. **사이트 목록 페이지** (`/sites`): TanStack Table. 컬럼: URL, 도메인, 상태, 카테고리, 신뢰도, 최초 탐지일, 최근 체크일. 상태/카테고리 필터, 검색, 정렬, 페이지네이션
- [ ] 2. **사이트 상세 페이지** (`/sites/[id]`): 사이트 기본 정보, WHOIS/DNS, 채증 이력 목록, 분류 결과, 도메인 이력 타임라인, 관련 클러스터, 메모/태그
- [ ] 3. **수동 URL 등록 폼** (`/sites/new`): URL 입력, 카테고리 선택, 메모. React Hook Form + Zod 유효성 검증
- [ ] 4. **벌크 URL 임포트** (`/sites/import`): CSV/TXT 파일 업로드 또는 텍스트 영역 직접 입력. 미리보기 테이블, 중복 검사 결과 표시
- [ ] 5. **사이트 수정 다이얼로그**: 상태 변경, 카테고리 변경, 메모 수정, 태그 관리

---

### Task 013: 구현 — 채증 모니터링 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-011 (채증 큐), FR-UI-012 (세션 상세), FR-UI-013 (갤러리), FR-UI-014 (결과 상세) |

**구현 사항:**
- [ ] 1. **채증 작업 큐 페이지** (`/investigations`): TanStack Table. 컬럼: 사이트 URL, 상태, 현재 단계, 시작 시각, 소요 시간, 재시도 횟수. 상태 필터 (대기/진행/완료/실패). 채증 실행/취소 버튼
- [ ] 2. **채증 세션 상세 페이지** (`/investigations/[id]`): 3단계 파이프라인 시각화 (스텝 인디케이터), 각 단계별 상태/결과/스크린샷 미리보기, 에러 로그, 메타데이터 (프록시, 핑거프린트), 타임라인
- [ ] 3. **채증 결과 갤러리** (`/investigations/gallery`): 스크린샷 썸네일 그리드, 사이트별/단계별/날짜별 필터, 라이트박스 뷰
- [ ] 4. **채증 결과 상세** (`/investigations/[id]/results`): 단계별 탭 (1단계/2단계/3단계). 각 탭에 스크린샷 뷰어, HTML 소스 뷰, 네트워크 로그, WHOIS/DNS 정보, 메타데이터 JSON

---

### Task 014: 구현 — 증거 관리 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-015 (증거 목록), FR-UI-016 (무결성 검증), FR-UI-017 (보고서), FR-UI-018 (감사 로그) |

**구현 사항:**
- [ ] 1. **증거 패키지 목록** (`/evidence`): TanStack Table. 컬럼: 사이트, 채증 세션, 파일 수, 총 크기, 해시 상태, 타임스탬프 상태, 생성일. 다운로드 버튼, 벌크 선택
- [ ] 2. **증거 무결성 검증 페이지** (`/evidence/[id]/verify`): 파일별 해시 검증 결과 표 (파일명, 원본 해시, 재계산 해시, 일치 여부). OTS/RFC3161 타임스탬프 검증 상태. 전체 패키지 검증 실행 버튼
- [ ] 3. **증거 보고서 페이지** (`/evidence/[id]/report`): 보고서 미리보기 (사이트 개요, 채증 과정, 증거 목록, 스크린샷). 보고서 생성 버튼, PDF 다운로드 버튼
- [ ] 4. **증거 감사 로그 페이지** (`/evidence/[id]/audit`): 타임라인 형식. 수집 -> 해시 생성 -> 타임스탬프 -> 접근 이력. 각 이벤트에 시각, 행위자, 상세 정보

---

### Task 015: 구현 — CAPTCHA/OTP 수동 개입 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-019 (CAPTCHA 큐), FR-UI-020 (원격 브라우저), FR-UI-021 (알림 설정), FR-EC-031~033 |

**구현 사항:**
- [ ] 1. **CAPTCHA/OTP 대기 큐** (`/investigations/captcha-queue`): 대기 항목 목록 (유형, 사이트 URL, 대기 시간, 스크린샷 미리보기). 우선순위 정렬, 건너뛰기/타임아웃 연장 버튼
- [ ] 2. **원격 브라우저 뷰어 영역**: CDP WebSocket 기반 원격 브라우저 스트리밍 UI 골격 (Phase 3에서 실제 연동). 빈 캔버스 + "연결 대기 중" 상태 표시
- [ ] 3. **수동 OTP 입력 폼**: OTP 코드 직접 입력 필드, "인증 완료" 버튼
- [ ] 4. **알림 설정 페이지 영역**: 웹 푸시 알림 구독 토글, Slack 알림 설정 (웹훅 URL 입력)

---

### Task 016: 구현 — AI 분류 검토 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-022 (검토 큐), FR-UI-023 (상세 검토), FR-DE-013 |

**구현 사항:**
- [ ] 1. **AI 분류 검토 큐** (`/review`): TanStack Table. 컬럼: 사이트 URL, AI 분류 결과, 신뢰도, 모델, 생성일. 검토 상태 필터 (대기/승인/거부). 저신뢰(< 0.7) 항목 하이라이트
- [ ] 2. **분류 상세 검토** (`/review/[id]`): 사이트 스크린샷, AI 분류 결과 (카테고리, 신뢰도, 근거 목록), 사이트 HTML 미리보기. 승인/수정/거부 액션 버튼, 카테고리 재분류 드롭다운

---

### Task 017: 구현 — 통계 및 분석 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-024 (추이 차트), FR-UI-025 (분포 차트), FR-UI-026 (네트워크 시각화) |

**구현 사항:**
- [ ] 1. **통계 대시보드** (`/analytics`): 기간 선택기 (일/주/월/분기), KPI 요약 카드 (탐지 건수, 채증 성공률, SMS 비용, AI 분류 건수)
- [ ] 2. **추이 차트** (Recharts): 일별/주별 탐지 건수 추이, 채증 성공률 추이, 비용 추이 라인 차트 (더미 시계열 데이터)
- [ ] 3. **분포 차트** (Recharts): 카테고리별 사이트 분포 파이 차트, 상태별 분포 바 차트, 탐지 소스별 분포
- [ ] 4. **네트워크 시각화 골격**: D3.js 또는 Cytoscape.js 기반 도메인 관계 그래프 (더미 노드/엣지). 줌/팬, 노드 클릭 시 사이트 상세 링크

---

### Task 018: 구현 — 보고서 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-027 (보고서 목록), FR-UI-028 (내보내기) |

**구현 사항:**
- [ ] 1. **정기 보고서 목록** (`/reports`): 보고서 제목, 기간, 생성일, 생성자, 형식 (PDF/Excel). 보고서 미리보기, 다운로드 버튼
- [ ] 2. **보고서 생성 폼**: 기간 선택, 보고서 유형 선택, 포함 항목 체크리스트, 템플릿 선택 드롭다운
- [ ] 3. **내보내기 기능 UI**: PDF/Excel/CSV 형식 선택 다이얼로그, 내보내기 진행 상태 표시

---

### Task 019: 구현 — 설정 페이지 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 005, Task 008 |
| **PRD 참조** | FR-UI-029 (사용자 관리), FR-UI-030 (시스템 설정), FR-UI-031 (키워드 관리), FR-UI-032 (감사 로그) |

**구현 사항:**
- [ ] 1. **시스템 설정** (`/settings`): 탭 기반 설정 그룹 (채증 파이프라인, SMS 서비스, 프록시, CAPTCHA, 비용 한도, 알림). 각 탭에 키-값 설정 폼
- [ ] 2. **사용자/역할 관리** (`/settings/users`): 사용자 목록 테이블 (이름, 이메일, 역할, 상태, 최근 로그인). 사용자 생성/편집 다이얼로그, 역할 변경 드롭다운, 비활성화 토글
- [ ] 3. **키워드 관리** (`/settings/keywords`): 키워드 목록 테이블 (키워드, 카테고리, 탐지 건수, 상태). 키워드 추가/편집/삭제. "AI 유사 키워드 생성" 버튼 (UI만, 기능은 Phase 3)
- [ ] 4. **감사 로그 뷰어** (`/settings/audit-log`): TanStack Table. 컬럼: 시각, 행위자, 액션, 대상, IP. 날짜 범위/액션 유형/행위자 필터

---

### Task 020: 구현 — 로그인/회원가입 페이지 리팩토링

| 항목 | 내용 |
|------|------|
| **예상 소요** | 1일 |
| **선행 Task** | Task 004 |
| **PRD 참조** | FR-API-001 (로그인), `/login`, `/signup` 라우트 |

**구현 사항:**
- [ ] 1. **로그인 페이지 리팩토링**: 기존 `login-form` 컴포넌트를 React Hook Form + Zod로 전환. 이메일/비밀번호 유효성 검증, 에러 메시지, 로딩 상태
- [ ] 2. **회원가입 페이지 리팩토링**: 이름, 이메일, 비밀번호, 비밀번호 확인 폼. 비밀번호 강도 표시
- [ ] 3. **인증 레이아웃 통합**: `(auth)` 그룹 레이아웃에 로고, 제품 소개 텍스트, 카드 래퍼 적용

---

### Task 021: 구현 — 반응형 디자인 및 다크 모드

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 011~019 |
| **PRD 참조** | FR-UI-033 (반응형), FR-UI-035 (접근성) |

**구현 사항:**
- [ ] 1. **반응형 브레이크포인트 검증**: 모든 페이지에 대해 모바일(375px), 태블릿(768px), 데스크톱(1280px+) 3개 브레이크포인트 검증
- [ ] 2. **모바일 사이드바**: 햄버거 메뉴 토글, 오버레이 사이드바, 외부 클릭 닫기
- [ ] 3. **다크 모드 지원**: TailwindCSS v4 다크 모드 설정, 시스템 설정 자동 감지 + 수동 토글
- [ ] 4. **접근성 기본**: 키보드 네비게이션, aria-label, 포커스 표시, 색상 대비

---

### Task 022: 구현 — SMS 비용 대시보드 UI

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 011, Task 008 |
| **PRD 참조** | FR-SMS-018 (비용 대시보드), FR-SMS-019 (한도 설정), FR-SMS-020 (성공률), FR-SMS-021 (비용 알림) |

**구현 사항:**
- [ ] 1. **SMS 사용량/비용 대시보드 위젯**: 서비스별(PVAPins/GrizzlySMS/SMS-Activate) 사용량 차트, 누적 비용, 잔여 크레딧 (더미)
- [ ] 2. **한도 설정 UI**: 일일/월간 사용 한도, 비용 한도, 임계치 알림 설정 폼
- [ ] 3. **서비스별 성공률 차트**: 번호 발급 성공률, OTP 수신 성공률, 전체 인증 성공률 바 차트

---

### Task 023: 구현 — 초기 설정 위저드 UI 완성

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 009 |
| **PRD 참조** | 슈퍼어드민 계정 구조 |

**구현 사항:**
- [ ] 1. **Step 1 UI**: 슈퍼어드민 이메일, 비밀번호, 이름 입력 폼. 비밀번호 강도 검증
- [ ] 2. **Step 2 UI**: PostgreSQL 연결 문자열 입력, Redis 연결 문자열 입력, 연결 테스트 버튼 (UI만)
- [ ] 3. **Step 3 UI**: Claude API Key, SMS 서비스 API Key, CAPTCHA 서비스 API Key, Google Search API Key 입력 폼. 각 키 검증 버튼 (UI만)
- [ ] 4. **Step 4 UI**: 동시 브라우저 수, 기본 프록시 설정, 비용 한도, 알림 설정 폼
- [ ] 5. **Step 5 UI**: 전체 설정 요약 카드, "설정 완료" 버튼, 성공 화면

---

### Task 024: 검증 — Phase 2 통합 검증 및 UI 리뷰

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 011~023 |
| **PRD 참조** | 전체 UI 요구사항 |

**구현 사항:**
- [ ] 1. **전체 페이지 네비게이션 검증**: 사이드바 메뉴에서 모든 22개 페이지로 정상 이동 확인
- [ ] 2. **역할별 메뉴 가시성 검증**: 5개 역할에 대해 접근 가능/불가 메뉴 확인
- [ ] 3. **반응형 검증**: 모바일/태블릿/데스크톱 3개 뷰포트에서 모든 페이지 레이아웃 확인
- [ ] 4. **`npm run check-all` 통과**: ESLint, Prettier, TypeScript 검사 전체 통과
- [ ] 5. **`npm run build` 성공**: 프로덕션 빌드 정상 완료 확인

---

## Phase 3: 핵심 기능 구현 — FastAPI 백엔드 (5~6주)

> **목표**: FastAPI (Python) 백엔드를 구축하고 핵심 비즈니스 로직을 구현한다. SQLAlchemy + PostgreSQL DB 연동, JWT 인증/RBAC, REST API (35개 엔드포인트), LangGraph 기반 채증 파이프라인, 증거 무결성 등 시스템의 핵심 기능이 동작하는 상태를 만든다.
>
> **아키텍처 변경 (2026-03-15 결정)**: 기존 Next.js API Routes + Prisma 기반에서 FastAPI + SQLAlchemy + LangChain/LangGraph로 전환. Next.js는 프론트엔드 전용으로 유지하며, FastAPI 백엔드와 REST API로 통신한다.

### Task 025: 연동 — FastAPI 프로젝트 초기화 + PostgreSQL + SQLAlchemy 데이터베이스 연동

| 항목 | 내용 |
|------|------|
| **예상 소요** | 4일 |
| **선행 Task** | Task 003 (Prisma 스키마 참조용) |
| **PRD 참조** | FR-DM-001~020 |

**구현 사항:**
- [ ] 1. **FastAPI 프로젝트 초기화** (`backend/`): FastAPI + Uvicorn 설정, 프로젝트 구조 (`backend/app/`, `backend/app/models/`, `backend/app/api/`, `backend/app/services/`), pyproject.toml 또는 requirements.txt
- [ ] 2. **SQLAlchemy 모델 정의**: 기존 Prisma 스키마(21개 모델) 기반으로 SQLAlchemy 모델 재작성. UUID v7, snake_case, 소프트 삭제, 감사 필드, JSON 필드, Enum 타입 반영
- [ ] 3. **Alembic 마이그레이션 설정**: `alembic init`, 초기 마이그레이션 생성 및 실행으로 PostgreSQL에 전체 스키마 반영
- [ ] 4. **DB 세션 관리**: 비동기 SQLAlchemy (`asyncpg`), 세션 의존성 주입 (`get_db`), 커넥션 풀 설정
- [ ] 5. **Seed 스크립트 실행**: 슈퍼어드민 계정 (bcrypt 해시), 기본 시스템 설정, 초기 키워드 50개
- [ ] 6. **audit_logs 테이블 INSERT-only 권한 설정**: raw SQL로 `REVOKE UPDATE, DELETE` 실행
- [ ] 7. **Redis 연결 설정** (`backend/app/core/redis.py`): 작업 큐용, 세션 캐시용 Redis 클라이언트

**테스트 체크리스트:**
- [ ] Alembic migrate 정상 실행 확인
- [ ] Seed 데이터 정상 삽입 확인
- [ ] audit_logs UPDATE/DELETE 시도 시 권한 오류 확인
- [ ] FastAPI `/docs` (Swagger UI) 접속 확인

---

### Task 026: 구현 — FastAPI JWT 인증 시스템

| 항목 | 내용 |
|------|------|
| **예상 소요** | 4일 |
| **선행 Task** | Task 025 |
| **PRD 참조** | FR-API-001~004, FR-DM-015~016, NFR-SEC-002 |

**구현 사항:**
- [ ] 1. **FastAPI JWT 인증 설정** (`backend/app/core/auth.py`): `python-jose` + `passlib[bcrypt]`, access_token 1시간, refresh_token 7일, OAuth2PasswordBearer
- [ ] 2. **로그인 API** (`POST /api/auth/login`): bcrypt 비밀번호 비교, 로그인 실패 카운터 (Redis TTL), 5회 실패 시 15분 잠금, 감사 로그 기록
- [ ] 3. **RBAC 미들웨어** (`backend/app/core/permissions.py`): FastAPI Depends 기반 `require_roles(*roles)` 의존성. JWT에서 역할 추출, 권한 검증, 권한 부족 시 403 + 감사 로그
- [ ] 4. **`/setup` 초기 설정 위저드 API**: DB에 사용자 0명일 때만 접근 가능. 슈퍼어드민 생성 엔드포인트. 시스템 설정 DB 저장
- [ ] 5. **5개 역할 체계 구현**: `super_admin`, `admin`, `operator`, `investigator`, `legal` 역할별 권한 매핑을 DB `system_settings`에 저장

**테스트 체크리스트:**
- [ ] 유효한 자격증명으로 로그인 성공 (JWT 발급)
- [ ] 잘못된 비밀번호 5회 입력 시 계정 잠금
- [ ] 역할별 API 접근 제어 정상 동작
- [ ] `/setup` 초기 설정 완료 후 재접근 차단

---

### Task 027: 구현 — 사이트 관리 REST API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 025, Task 026 |
| **PRD 참조** | FR-API-005~010 |

**구현 사항:**
- [ ] 1. **사이트 목록 조회** (`GET /api/sites`): 커서 기반 페이지네이션, 상태/카테고리/검색 필터, 정렬 (FastAPI + SQLAlchemy)
- [ ] 2. **사이트 등록** (`POST /api/sites`): URL 정규화, 중복 검사, 도메인 추출, AI 분류 큐 등록
- [ ] 3. **사이트 상세/수정/삭제** (`GET/PATCH/DELETE /api/sites/{id}`): 소프트 삭제, 감사 로그
- [ ] 4. **벌크 URL 임포트** (`POST /api/sites/import`): CSV 파싱, 중복 제거, 일괄 등록
- [ ] 5. **Next.js 프론트엔드에서 FastAPI 연동**: 더미 데이터를 FastAPI REST API 호출로 교체

**테스트 체크리스트:**
- [ ] 사이트 CRUD 전체 플로우 동작 확인
- [ ] 중복 URL 등록 시 409 Conflict 반환
- [ ] 벌크 임포트 100건 정상 처리

---

### Task 028: 구현 — 채증 작업 관리 REST API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 027 |
| **PRD 참조** | FR-API-011~018, FR-EC-022~024 |

**구현 사항:**
- [ ] 1. **채증 세션 생성/목록/상세** (`POST/GET /api/investigations`, `GET /api/investigations/[id]`): Celery 작업 큐 등록, 상태 관리
- [ ] 2. **채증 실행/취소** (`POST /api/investigations/[id]/execute`, `POST /api/investigations/[id]/cancel`)
- [ ] 3. **채증 결과 조회** (`GET /api/investigations/[id]/results`): 단계별 증거 파일 목록, 메타데이터
- [ ] 4. **CAPTCHA 큐 API** (`GET/POST /api/investigations/captcha-queue`): 수동 개입 대기 목록, 해결 처리
- [ ] 5. **SSE 스트리밍** (`GET /api/sse/investigations`): 채증 진행 상태 실시간 스트리밍

**테스트 체크리스트:**
- [ ] 채증 세션 생성 -> 큐 등록 확인
- [ ] 채증 취소 시 상태 변경 확인
- [ ] SSE 스트리밍 연결/수신 정상 동작

---

### Task 029: 구현 — 증거 관리 REST API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 028 |
| **PRD 참조** | FR-API-019~023, FR-EV-001~003 |

**구현 사항:**
- [ ] 1. **증거 목록/상세** (`GET /api/evidence`, `GET /api/evidence/[id]`)
- [ ] 2. **증거 무결성 검증** (`POST /api/evidence/[id]/verify`): SHA-256 재계산, 매니페스트 대조, OTS/RFC3161 검증
- [ ] 3. **증거 패키지 다운로드** (`GET /api/evidence/[id]/download`): ZIP 패키징, S3 스트리밍
- [ ] 4. **증거 보고서 생성** (`POST /api/evidence/[id]/report`): 보고서 생성 큐 등록 (Claude Sonnet 연동은 Phase 4)
- [ ] 5. **감사 로그 자동 기록**: 증거 접근/다운로드/검증 시 audit_logs 자동 INSERT

**테스트 체크리스트:**
- [ ] 해시 검증 통과 확인 (VALID)
- [ ] 파일 변조 후 해시 검증 실패 확인 (INVALID)
- [ ] 증거 다운로드 시 감사 로그 기록 확인

---

### Task 030: 구현 — 사용자 관리 및 감사 로그 API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 026 |
| **PRD 참조** | FR-API-043~045, FR-DM-006, FR-UI-029, FR-UI-032 |

**구현 사항:**
- [ ] 1. **사용자 CRUD API**: 생성 (관리자만), 목록 조회, 상세, 수정, 비활성화. 비밀번호 변경
- [ ] 2. **역할 변경 API**: 슈퍼어드민/관리자만 역할 변경 가능, 기존 토큰 즉시 무효화
- [ ] 3. **감사 로그 조회 API** (`GET /api/settings/audit-log`): 날짜/액션/행위자 필터, 해시 체인 무결성 검증
- [ ] 4. **감사 로그 해시 체인**: 각 INSERT 시 직전 레코드 해시 계산 -> `prev_hash` 저장. 체인 검증 API

**테스트 체크리스트:**
- [ ] 역할별 사용자 CRUD 권한 제한 확인
- [ ] 감사 로그 해시 체인 무결성 검증 통과
- [ ] audit_logs 테이블 UPDATE/DELETE 차단 확인

---

### Task 031: 구현 — 시스템 설정 API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 025, Task 026 |
| **PRD 참조** | FR-API-041~042, FR-DM-017 |

**구현 사항:**
- [ ] 1. **시스템 설정 조회/수정 API** (`GET/PATCH /api/settings`): 키-값 CRUD, Redis 캐시 무효화
- [ ] 2. **설정 변경 감사 로그**: 변경 전/후 값을 audit_logs에 기록
- [ ] 3. **설정 페이지 DB 연동**: `/settings` 페이지에서 실제 DB 설정값 표시/수정

---

### Task 032: 구현 — S3/MinIO 파일 저장소 연동

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 025 |
| **PRD 참조** | FR-EV-009 (증거 패키지 구조), FR-DM-003 |

**구현 사항:**
- [ ] 1. **MinIO 클라이언트 설정** (`backend/app/core/storage.py`): `boto3` 기반, MinIO/S3 호환
- [ ] 2. **파일 업로드/다운로드 유틸리티**: 증거 파일 업로드, 스트리밍 다운로드, 서명된 URL 생성 (presigned URL)
- [ ] 3. **증거 패키지 디렉토리 구조**: `evidence/{siteId}/{investigationId}/stage-{n}/{filename}` 경로 규칙
- [ ] 4. **파일 업로드 시 SHA-256 해시 자동 생성**: 스트리밍 해시 계산, DB 기록
- [ ] 5. **Docker Compose에 MinIO 서비스 추가**: MinIO 컨테이너, 초기 버킷 생성 스크립트

---

### Task 033: 구현 — rebrowser-playwright 기반 1단계 채증 엔진

| 항목 | 내용 |
|------|------|
| **예상 소요** | 5일 |
| **선행 Task** | Task 028, Task 032 |
| **PRD 참조** | FR-EC-001~006, FR-EC-019~024 |

**구현 사항:**
- [ ] 1. **rebrowser-playwright 설치 및 기본 설정**: CDP 유출 패치 확인, playwright-stealth 연동
- [ ] 2. **사이트 접속**: URL 접속, 재시도 로직 (최대 3회, 프록시 로테이션), 타임아웃 (30초)
- [ ] 3. **Cloudflare/JS Challenge 자동 통과**: 챌린지 페이지 감지, 자동 대기
- [ ] 4. **1단계 채증 수행**: 풀페이지 스크린샷 (PNG), HTML 소스 저장, 네트워크 요청 로그, WHOIS/DNS 수집
- [ ] 5. **채증 결과 저장**: S3 업로드, SHA-256 해시 생성, metadata.json 생성, collection_log.json 기록
- [ ] 6. **브라우저 인스턴스 풀 관리**: 동시 실행 수 제한 (기본 5), 유휴 인스턴스 정리, 메모리 모니터링
- [ ] 7. **행동 시뮬레이션**: 마우스 베지어 곡선, 타이핑 딜레이, 랜덤 대기

**테스트 체크리스트:**
- [ ] 실제 웹사이트 1단계 채증 성공 확인
- [ ] 스크린샷/HTML/네트워크 로그 파일 정상 생성
- [ ] SHA-256 해시 검증 통과
- [ ] 접속 실패 시 재시도 로직 동작

---

### Task 034: 구현 — Celery 채증 작업 큐 (또는 FastAPI BackgroundTasks)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 025, Task 033 |
| **PRD 참조** | FR-EC-022~023, FR-DE-023~027 |

**구현 사항:**
- [ ] 1. **Celery + Redis 큐 설정** (`backend/app/core/celery.py`): 채증 큐 (`investigation-queue`), 탐지 큐 (`detection-queue`), 알림 큐 (`notification-queue`)
- [ ] 2. **워커 구현**: 큐에서 작업 소비 -> 1단계 채증 엔진 호출 -> 결과 저장 -> 상태 업데이트
- [ ] 3. **재시도 전략**: 지수 백오프 (10초, 30초, 90초), 최대 3회, 프록시 변경
- [ ] 4. **우선순위 큐**: P1(긴급) > P2(높음) > P3(보통) > P4(낮음), FIFO 내 정렬
- [ ] 5. **큐 모니터링**: Flower (Celery 모니터링) 또는 커스텀 대시보드 위젯에서 큐 상태 표시

**테스트 체크리스트:**
- [ ] 작업 등록 -> 소비 -> 완료 플로우 확인
- [ ] 실패 작업 재시도 3회 후 permanent_failed 상태
- [ ] 우선순위 작업이 먼저 처리됨 확인

---

### Task 035: 구현 — 증거 무결성 시스템 (SHA-256 + OpenTimestamps)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 032 |
| **PRD 참조** | FR-EV-001~004, FR-EV-010~012 |

**구현 사항:**
- [ ] 1. **SHA-256 해시 자동 생성**: 파일 저장과 원자적 해시 계산, hash_manifest.sha256 생성 (GNU coreutils 호환)
- [ ] 2. **OpenTimestamps 연동**: `opentimestamps-client` Python 클라이언트, .ots 파일 생성, 캘린더 서버 연결, 비트코인 블록 확인 상태 추적
- [ ] 3. **해시 무결성 검증**: 파일 해시 재계산 -> 매니페스트 대조 -> VERIFIED/TAMPERED/MISSING 상태
- [ ] 4. **metadata.json 자동 생성**: URL, 수집 시각(UTC), 접속 IP, 프록시 정보, 브라우저 정보
- [ ] 5. **collection_log.json 감사 로그**: 수집 시작~완료 전 과정 이벤트 기록, 밀리초 정밀도

**테스트 체크리스트:**
- [ ] 해시 매니페스트 `sha256sum --check` 검증 통과
- [ ] OpenTimestamps .ots 파일 생성 및 `ots verify` 통과
- [ ] 파일 1바이트 변조 후 해시 검증 실패 확인

---

### Task 036: 구현 — LangChain + Claude Haiku 4.5 AI 콘텐츠 분류

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-DE-010~013 |

**구현 사항:**
- [ ] 1. **LangChain Claude 클라이언트** (`backend/app/services/llm/classifier.py`): `langchain-anthropic` ChatAnthropic, 프롬프트 캐싱 설정
- [ ] 2. **도박 사이트 분류 체인**: LangChain PromptTemplate + StructuredOutputParser. 시스템 프롬프트 (전문가 역할, 한국어 도박 용어 사전), 5개 카테고리 정의, 10개 few-shot 예시
- [ ] 3. **구조화된 출력**: `{category, confidence, evidence[]}` JSON 응답, Pydantic 모델 검증
- [ ] 4. **저신뢰 결과 검토 큐**: 신뢰도 < 0.7 결과 자동 검토 큐 등록
- [ ] 5. **분류 결과 DB 저장**: classification_results 테이블, sites.confidenceScore 업데이트

**테스트 체크리스트:**
- [ ] 알려진 도박 사이트 HTML로 분류 정확도 확인
- [ ] 정상 사이트 HTML로 비도박 분류 확인
- [ ] 저신뢰 결과 검토 큐 등록 확인

---

### Task 037: 구현 — 탐지 결과 통합 저장 및 사이트 등록 파이프라인

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 027, Task 036 |
| **PRD 참조** | FR-DE-029, FR-DE-004 |

**구현 사항:**
- [ ] 1. **탐지 결과 저장**: 탐지 출처별(검색/크롤링/수동/커뮤니티) 통합 저장
- [ ] 2. **URL 정규화 및 중복 제거**: Python `url-normalize` 또는 자체 정규화 유틸리티, 동일 도메인/URL 중복 감지
- [ ] 3. **자동 채증 큐 등록**: 신규 사이트 등록 시 채증 큐에 자동 등록
- [ ] 4. **화이트리스트**: 합법 사이트 도메인 화이트리스트 관리, 자동 제외

---

### Task 038: 구현 — 통계/분석 API

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 027, Task 028 |
| **PRD 참조** | FR-API-034~037 |

**구현 사항:**
- [ ] 1. **통계 개요 API** (`GET /api/analytics/overview`): KPI 집계 (총 사이트, 채증 건수, 성공률, 비용)
- [ ] 2. **사이트 통계 API** (`GET /api/analytics/sites`): 카테고리별/상태별 분포, 기간별 추이
- [ ] 3. **채증 통계 API** (`GET /api/analytics/investigations`): 성공률 추이, 단계별 완료율
- [ ] 4. **비용 통계 API** (`GET /api/analytics/costs`): SMS/프록시/CAPTCHA 서비스별 비용 집계

---

### Task 039: 구현 — 대시보드/UI 실제 API 연동

| 항목 | 내용 |
|------|------|
| **예상 소요** | 4일 |
| **선행 Task** | Task 027~038 |
| **PRD 참조** | FR-UI-001~035 전체 |

**구현 사항:**
- [ ] 1. **TanStack Query 설정**: 쿼리 클라이언트, FastAPI 백엔드 호출 API 훅 패턴 (`useSites`, `useInvestigations`, `useEvidence` 등)
- [ ] 2. **FastAPI 프록시 또는 CORS 설정**: Next.js -> FastAPI 백엔드 통신 구성 (개발: CORS, 프로덕션: 리버스 프록시)
- [ ] 3. **모든 페이지 더미 데이터 -> FastAPI REST API 전환**: 사이트 관리, 채증 모니터링, 증거 관리, 설정 페이지
- [ ] 4. **폼 제출 -> FastAPI API 연동**: 사이트 등록, 채증 실행, 사용자 생성, 시스템 설정 변경
- [ ] 5. **SSE 실시간 연동**: FastAPI SSE 엔드포인트 -> 대시보드 활동 피드, 채증 진행 상태 실시간 업데이트

---

### Task 040: 구현 — RFC 3161 TSA 타임스탬프 클라이언트

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 035 |
| **PRD 참조** | FR-EV-005~006 |

**구현 사항:**
- [ ] 1. **경량 RFC 3161 TSA 클라이언트**: TimeStampReq 생성, TSA 서버 전송, TimeStampResp 파싱
- [ ] 2. **TSA 서버 설정**: FreeTSA.org (1순위), DigiCert (폴백), 서버 장애 시 폴백
- [ ] 3. **이중 타임스탬프 교차 검증**: OTS와 RFC 3161 시간값 비교, 허용 범위(10분) 초과 시 경고
- [ ] 4. **증거 패키지에 .tsr 파일 포함**: 증거 패키지 표준 구조에 RFC 3161 타임스탬프 추가

**테스트 체크리스트:**
- [ ] FreeTSA.org에서 타임스탬프 응답 수신 확인
- [ ] TSA 응답 디지털 서명 검증 통과
- [ ] OTS-RFC3161 교차 검증 CONSISTENT 확인

---

### Task 041: 구현 — SingleFile + WARC 증거 보존

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-EV-007~009 |

**구현 사항:**
- [ ] 1. **SingleFile CLI 연동**: 웹페이지 -> 단일 HTML 파일 생성, Playwright 세션 공유
- [ ] 2. **WARC 기록**: Python `warcio` 라이브러리로 CDP 네트워크 이벤트 기반 WARC 생성, gzip 압축
- [ ] 3. **증거 패키지 자동 생성**: 표준 디렉토리 구조 자동 생성 + ZIP 패키징
- [ ] 4. **패키지 완전성 검사**: 필수 파일 누락 시 INCOMPLETE 상태 표시

**테스트 체크리스트:**
- [ ] SingleFile HTML을 오프라인에서 열어 원본과 비교
- [ ] WARC 파일 ReplayWeb.page에서 재현 확인
- [ ] 증거 패키지 ZIP 다운로드 및 구조 확인

---

### Task 042: 구현 — 팝업/광고 자동 처리

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-EC-015~018, FR-DM-018 |

**구현 사항:**
- [ ] 1. **팝업 자동 감지/닫기**: dialog, CSS 오버레이, 프로모션 팝업 감지 후 닫기 버튼 탐색/클릭
- [ ] 2. **iframe 광고 처리**: 광고 iframe 감지, 내부 닫기 버튼 탐색 또는 DOM 제거
- [ ] 3. **사이트별 팝업 패턴 어댑터**: popup_patterns DB 저장, 재방문 시 즉시 적용
- [ ] 4. **Claude Vision 범용 처리**: 새로운 팝업 패턴 -> Claude Haiku Vision 분석 -> 어댑터 자동 추가

**테스트 체크리스트:**
- [ ] 팝업이 있는 사이트에서 팝업 자동 닫기 확인
- [ ] 팝업 패턴 DB 저장 및 재방문 시 즉시 처리 확인

---

### Task 043: 구현 — 알림 시스템 (Slack + Web Push)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 028 |
| **PRD 참조** | FR-EC-026, FR-EC-033, FR-SMS-021, FR-SMS-023 |

**구현 사항:**
- [ ] 1. **Slack Webhook 연동**: 채증 완료/실패, CAPTCHA/OTP 수동 개입 요청, 비용 임계치 알림
- [ ] 2. **Web Push 알림**: Service Worker 등록, 푸시 구독, 대시보드 알림 벨
- [ ] 3. **알림 설정 관리**: 알림 유형별 활성화/비활성화, Slack 채널/웹훅 URL 설정

---

### Task 044: 검증 — Phase 3 통합 테스트

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 025~043 |
| **PRD 참조** | Phase 1 MVP KPI |

**구현 사항:**
- [ ] 1. **1단계 채증 E2E 테스트**: URL 입력 -> 채증 큐 등록 -> 1단계 채증 실행 -> 결과 저장 -> 해시 검증 -> 타임스탬프 적용
- [ ] 2. **인증/RBAC E2E 테스트**: 로그인 -> 역할별 페이지 접근 -> API 권한 제한
- [ ] 3. **KPI 검증**: 1단계 채증 성공률 95%+, 60초 이내 완료, 해시 검증 100%, AI 분류 F1 90%+
- [ ] 4. **`npm run check-all` 및 `npm run build` 통과**

---

## Phase 4: 고급 기능 및 최적화 (4~5주)

> **목표**: SMS 자동 인증, AI 탐지 엔진, 실시간 모니터링, 네트워크 시각화, 성능 최적화를 완성하여 프로덕션 배포 가능한 상태를 만든다.

### Task 045: 구현 — SMS 자동 인증 엔진

| 항목 | 내용 |
|------|------|
| **예상 소요** | 5일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-SMS-001~017 |

**구현 사항:**
- [ ] 1. **PVAPins Non-VoIP API 연동**: +82 번호 발급, OTP 수신 폴링/Webhook
- [ ] 2. **GrizzlySMS/SMS-Activate 폴백 연동**: 자동 폴백 체인 (PVAPins -> GrizzlySMS -> SMS-Activate -> 수동 개입)
- [ ] 3. **OTP 메시지 파싱**: 정규식 기반 4~8자리 인증코드 추출, 한국어 패턴 대응
- [ ] 4. **인증 플로우 오케스트레이션**: 전화번호 필드 탐지 -> 번호 발급 -> 폼 입력 -> OTP 수신 -> 코드 입력 -> 검증
- [ ] 5. **번호 풀 관리**: 사용 이력 추적, 30일 재사용 방지, 블랙리스트
- [ ] 6. **실패 사유별 분기 처리**: NUMBER_BLOCKED, OTP_TIMEOUT, CODE_EXPIRED, FORMAT_REJECTED, API_ERROR

**테스트 체크리스트:**
- [ ] PVAPins 번호 발급 및 OTP 수신 성공
- [ ] 폴백 체인 전환 정상 동작
- [ ] OTP 메시지 파싱 정확도 99%+

---

### Task 046: 구현 — 2단계/3단계 채증 엔진

| 항목 | 내용 |
|------|------|
| **예상 소요** | 5일 |
| **선행 Task** | Task 045, Task 042 |
| **PRD 참조** | FR-EC-007~014 |

**구현 사항:**
- [ ] 1. **Claude Vision 기반 폼 필드 자동 탐지**: 회원가입 폼 스크린샷 분석, 필드 위치/유형 JSON 반환
- [ ] 2. **회원가입 폼 자동 입력**: 랜덤 아이디/비밀번호 생성, 인간 유사 타이핑 딜레이
- [ ] 3. **2단계 채증**: 회원가입 완료, 배팅 메뉴 이동, 입금/충전 안내 캡처
- [ ] 4. **3단계 채증**: 배팅 종목 목록, 배팅 폼/배당률, 최소 금액 배팅 실행 캡처
- [ ] 5. **3단계 파이프라인 오케스트레이션**: 1->2->3 순차 실행, 단계별 성공/실패/스킵 관리

**테스트 체크리스트:**
- [ ] 회원가입 폼 자동 입력 성공 확인
- [ ] 3단계 채증 파이프라인 완료 확인
- [ ] 각 단계별 스크린샷/해시 정상 생성

---

### Task 047: 구현 — CAPTCHA 하이브리드 솔버

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-EC-027~033 |

**구현 사항:**
- [ ] 1. **CAPTCHA 유형 탐지**: Claude Vision으로 reCAPTCHA/hCaptcha/Turnstile/이미지/슬라이더 분류
- [ ] 2. **CapSolver API 연동** (1순위): Token 모드 풀이, sitekey 자동 추출
- [ ] 3. **2Captcha 폴백** (2순위): CapSolver 실패 시 자동 전환
- [ ] 4. **CDP Pause & Attach 수동 개입** (3순위): 브라우저 세션 일시정지, WebSocket 스트리밍
- [ ] 5. **CAPTCHA 큐 대시보드 연동**: 수동 개입 대기/해결/만료 상태 관리

**테스트 체크리스트:**
- [ ] CAPTCHA 유형 탐지 정확도 90%+
- [ ] CapSolver -> 2Captcha 폴백 전환 정상 동작
- [ ] 수동 개입 후 자동화 재개 확인

---

### Task 048: 구현 — Scrapy + scrapy-playwright 크롤링 인프라

| 항목 | 내용 |
|------|------|
| **예상 소요** | 4일 |
| **선행 Task** | Task 033 |
| **PRD 참조** | FR-DE-005~009, FR-DE-028 |

**구현 사항:**
- [ ] 1. **Scrapy + scrapy-playwright 설정** (`backend/app/crawler/`): Scrapy 프로젝트 초기화, scrapy-playwright 플러그인으로 Playwright 브라우저 통합, 비동기 I/O
- [ ] 2. **httpx + curl_cffi HTTP 크롤러**: TLS 핑거프린트 모방, 경량 HTTP 요청 (Python 네이티브)
- [ ] 3. **playwright-stealth 연동**: Canvas/WebGL 핑거프린트 관리, 안티봇 탐지 우회
- [ ] 4. **프록시 로테이션**: Scrapy 미들웨어 기반 프록시 로테이션, IPRoyal/SOAX 연동
- [ ] 5. **링크 분석 기반 관련 사이트 추적**: Scrapy LinkExtractor + BFS 3단계 깊이, 외부 링크 추출

---

### Task 049: 구현 — 검색 기반 탐지 및 키워드 관리

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 048 (Scrapy 크롤링 인프라) |
| **PRD 참조** | FR-DE-001~004, FR-DE-002 |

**구현 사항:**
- [ ] 1. **Google Custom Search API 연동**: 키워드 기반 검색, 페이징 (최대 100건)
- [ ] 2. **키워드 세트 관리**: CRUD, 카테고리 분류, 활성/비활성, 탐지 건수 통계
- [ ] 3. **키워드 조합 전략**: AND/NOT 조합, 템플릿, 조합별 정밀도 추적
- [ ] 4. **Claude Haiku 유사 키워드 자동 생성**: 시드 키워드 -> 10개+ 유사 키워드 자동 확장
- [ ] 5. **탐지 결과 -> 사이트 등록 파이프라인**: 중복 제거, AI 분류, 채증 큐 등록

---

### Task 050: 구현 — 도메인 호핑 추적

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 048 |
| **PRD 참조** | FR-DE-015~019 |

**구현 사항:**
- [ ] 1. **도메인 생존 체크**: 30분~1시간 간격 크론, DNS/HTTP/TCP 체크
- [ ] 2. **DNS 변경 모니터링**: A/CNAME/NS 레코드 변경 감지, IP 대역 그룹핑
- [ ] 3. **리디렉트 체인 추적**: HTTP 301/302, JS redirect, meta refresh (최대 10단계)
- [ ] 4. **도메인 클러스터링**: IP/WHOIS/디자인 유사도 기반 동일 운영자 그룹핑

---

### Task 051: 구현 — 크론 스케줄 자동 실행

| 항목 | 내용 |
|------|------|
| **예상 소요** | 2일 |
| **선행 Task** | Task 049, Task 050 |
| **PRD 참조** | FR-DE-024, US-A4 |

**구현 사항:**
- [ ] 1. **Celery Beat 기반 크론 스케줄**: 키워드 탐지 (매일), 도메인 체크 (30분), 사이트 재검증 (주 1회)
- [ ] 2. **스케줄 관리 대시보드 연동**: 스케줄 설정/변경/실행 이력
- [ ] 3. **Slack 자동 보고**: 스케줄 실행 결과 (탐지 건수, 신규 적재, 채증 성공/실패) Slack 전송

---

### Task 052: 구현 — 실시간 모니터링 (SSE/WebSocket)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 034, Task 039 |
| **PRD 참조** | FR-EC-025, FR-UI-002~003, FR-UI-012 |

**구현 사항:**
- [ ] 1. **SSE 채증 진행 스트리밍**: 채증 상태 변경, 큐 크기, 성공/실패 이벤트
- [ ] 2. **WebSocket 채증 세션 상세**: 실시간 단계 진행, 에러 발생, 스크린샷 업데이트
- [ ] 3. **대시보드 실시간 반영**: KPI 카드, 활동 피드, 채증 모니터링 위젯 실시간 갱신

---

### Task 053: 구현 — 네트워크 시각화 (D3.js)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 050 |
| **PRD 참조** | FR-UI-026, FR-DE-008~009, FR-DE-019 |

**구현 사항:**
- [ ] 1. **D3.js/Cytoscape.js 기반 네트워크 그래프**: 도메인 노드, 관계 엣지, 클러스터 그룹핑
- [ ] 2. **인터랙션**: 줌/팬, 노드 클릭 -> 사이트 상세, 클러스터 하이라이트
- [ ] 3. **실제 도메인 클러스터 데이터 연동**: DB 클러스터 데이터 -> 그래프 렌더링

---

### Task 054: 구현 — 보고서 자동 생성 (Claude Sonnet 4.6)

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 036, Task 041 |
| **PRD 참조** | FR-EV-015~017, US-A7 |

**구현 사항:**
- [ ] 1. **Claude Sonnet 4.6 보고서 생성**: 채증 결과 -> 한국어 수사 보고서 자동 생성
- [ ] 2. **PDF 변환**: Python `WeasyPrint` 또는 `reportlab`으로 법원 제출용 PDF 생성, A4 규격, 목차/색인
- [ ] 3. **보고서 템플릿 관리**: 기관별/용도별 템플릿 3종 이상
- [ ] 4. **정기 보고서 자동 생성**: 크론 스케줄 기반 월간/분기 보고서, 이메일/Slack 전송

---

### Task 055: 구현 — Computer Use 폴백 및 성능 최적화

| 항목 | 내용 |
|------|------|
| **예상 소요** | 4일 |
| **선행 Task** | Task 046 |
| **PRD 참조** | FR-EC-034, Phase 4 KPI |

**구현 사항:**
- [ ] 1. **Claude Computer Use 폴백**: Playwright 실패 시 Sonnet 4.6 Computer Use 모드 전환
- [ ] 2. **비용 관리**: Computer Use 호출 빈도 모니터링, 월 $25 이내 제한
- [ ] 3. **성능 최적화**: 브라우저 메모리 사용량 최적화, DB 쿼리 N+1 해결, Redis 캐시 전략
- [ ] 4. **증거 파일 암호화**: AES-256-GCM at-rest 암호화, TLS 1.3 in-transit 암호화

---

### Task 056: 검증 — 최종 통합 테스트 및 배포 준비

| 항목 | 내용 |
|------|------|
| **예상 소요** | 3일 |
| **선행 Task** | Task 045~055 |
| **PRD 참조** | Phase 4 KPI, 전체 시스템 수용 기준 |

**구현 사항:**
- [ ] 1. **전체 파이프라인 E2E 테스트**: URL 입력 -> 탐지 -> AI 분류 -> 3단계 채증 -> 증거 패키지 -> 보고서 생성
- [ ] 2. **KPI 검증**: 3단계 채증 성공률 70%+, SMS 인증 성공률 60%+, 증거 무결성 100%, 시스템 가동률 99.5%+
- [ ] 3. **보안 검점**: RBAC 전 역할 테스트, 감사 로그 변조 방지, 증거 암호화 검증
- [ ] 4. **배포 구성**: Docker Compose (Next.js + FastAPI + PostgreSQL + Redis + MinIO + Celery Worker), 환경 변수 프로덕션 설정
- [ ] 5. **운영 문서 작성**: 배포 가이드, 모니터링 설정, 장애 대응 절차

---

## 의존성 맵 요약

```
Phase 1 (골격)
  Task 001 (라우트) ─────────────────────→ Task 004 (레이아웃) → Task 005 (공통 컴포넌트)
  Task 002 (타입) → Task 003 (Prisma) ──→ Task 007 (API 골격)
  Task 002 (타입) → Task 008 (더미 데이터)
  Task 006 (환경변수)
  Task 009 (위저드 골격), Task 010 (네비게이션)

Phase 2 (UI)
  Task 005 + 008 → Task 011~019 (각 페이지 UI 병렬 개발)
  Task 020 (로그인 리팩토링)
  Task 011~019 → Task 021 (반응형)
  Task 024 (통합 검증)

Phase 3 (핵심 기능 — FastAPI 백엔드)
  Task 003 → Task 025 (FastAPI 초기화 + SQLAlchemy DB 연동) → Task 026 (JWT 인증)
  Task 026 → Task 027~031 (각 FastAPI 라우터 병렬 개발)
  Task 025 → Task 032 (MinIO) → Task 033 (1단계 채증)
  Task 033 → Task 034 (Celery), Task 035 (증거 무결성), Task 036 (LangChain AI 분류)
  Task 033 → Task 041 (SingleFile/WARC), Task 042 (팝업 처리)
  Task 035 → Task 040 (RFC 3161)
  Task 027~038 → Task 039 (Next.js ↔ FastAPI 연동)
  Task 044 (통합 테스트)

Phase 4 (고급 기능)
  Task 033 → Task 045 (SMS) → Task 046 (2/3단계 채증)
  Task 033 → Task 047 (CAPTCHA), Task 048 (Scrapy)
  Task 048 → Task 049 (검색 탐지), Task 050 (도메인 추적)
  Task 049 + 050 → Task 051 (스케줄)
  Task 034 + 039 → Task 052 (실시간)
  Task 050 → Task 053 (네트워크 시각화)
  Task 036 + 041 → Task 054 (보고서)
  Task 046 → Task 055 (Computer Use + 최적화)
  Task 056 (최종 테스트/배포)
```

---

## PRD 요구사항 매핑

### Phase 1 (골격) - Task 001~010

| Task | 매핑 PRD 요구사항 |
|------|------------------|
| 001 | FR-UI-001~035 (라우트 구조) |
| 002 | FR-DM-001~020, FR-API-001~049 (타입) |
| 003 | FR-DM-001~020 (스키마) |
| 004 | FR-UI-033~035 (레이아웃) |
| 005 | FR-UI-033~035 (공통 컴포넌트) |
| 006 | 전체 기술 스택 (환경 변수) |
| 007 | FR-API-001~049 (API 골격) |
| 008 | 전체 (더미 데이터) |
| 009 | 슈퍼어드민 구조 (/setup) |
| 010 | FR-API-004 (RBAC 매핑) |

### Phase 2 (UI) - Task 011~024

| Task | 매핑 PRD 요구사항 |
|------|------------------|
| 011 | FR-UI-001~004 |
| 012 | FR-UI-005~010 |
| 013 | FR-UI-011~014 |
| 014 | FR-UI-015~018 |
| 015 | FR-UI-019~021, FR-EC-031~033 |
| 016 | FR-UI-022~023, FR-DE-013 |
| 017 | FR-UI-024~026 |
| 018 | FR-UI-027~028 |
| 019 | FR-UI-029~032 |
| 020 | FR-API-001 |
| 021 | FR-UI-033, FR-UI-035 |
| 022 | FR-SMS-018~021 |
| 023 | 슈퍼어드민 구조 |
| 024 | 전체 UI 검증 |

### Phase 3 (핵심 기능) - Task 025~044

| Task | 매핑 PRD 요구사항 |
|------|------------------|
| 025 | FR-DM-001~020 |
| 026 | FR-API-001~004, FR-DM-015~016, NFR-SEC-002 |
| 027 | FR-API-005~010 |
| 028 | FR-API-011~018, FR-EC-022~024 |
| 029 | FR-API-019~023, FR-EV-001~003 |
| 030 | FR-API-043~045, FR-DM-006 |
| 031 | FR-API-041~042, FR-DM-017 |
| 032 | FR-EV-009, FR-DM-003 |
| 033 | FR-EC-001~006, FR-EC-019~024 |
| 034 | FR-EC-022~023, FR-DE-023~027 |
| 035 | FR-EV-001~004, FR-EV-010~012 |
| 036 | FR-DE-010~013 |
| 037 | FR-DE-029, FR-DE-004 |
| 038 | FR-API-034~037 |
| 039 | FR-UI-001~035 (API 연동) |
| 040 | FR-EV-005~006 |
| 041 | FR-EV-007~009 |
| 042 | FR-EC-015~018, FR-DM-018 |
| 043 | FR-EC-026, FR-EC-033, FR-SMS-021~023 |
| 044 | Phase 1 MVP KPI |

### Phase 4 (고급 기능) - Task 045~056

| Task | 매핑 PRD 요구사항 |
|------|------------------|
| 045 | FR-SMS-001~017 |
| 046 | FR-EC-007~014 |
| 047 | FR-EC-027~033 |
| 048 | FR-DE-005~009, FR-DE-028 |
| 049 | FR-DE-001~004 |
| 050 | FR-DE-015~019 |
| 051 | FR-DE-024, US-A4 |
| 052 | FR-EC-025, FR-UI-002~003, FR-UI-012 |
| 053 | FR-UI-026, FR-DE-008~009, FR-DE-019 |
| 054 | FR-EV-015~017, US-A7 |
| 055 | FR-EC-034 |
| 056 | Phase 4 KPI, 전체 수용 기준 |

---

## KPI 목표 (Phase별)

| 지표 | Phase 3 완료 | Phase 4 완료 |
|------|-------------|-------------|
| 1단계 채증 성공률 | 95%+ | 95%+ |
| 3단계 채증 성공률 | - | 70%+ (Computer Use 폴백 시 80%+) |
| 해시 검증 통과율 | 100% | 100% |
| AI 분류 F1 | 90%+ | 94%+ |
| SMS 인증 성공률 | - | 60%+ (PVAPins 단독) |
| 월 자동 탐지 | - | 500건+ |
| 채증 소요 시간 (3단계) | - | 10분 이내 |
| 시스템 가동률 | - | 99.5%+ |
| 월 운영비 | - | $867~2,012 |

---

## Task 파일 관리

- **경로**: `/tasks/XXX-task-name.md`
- **템플릿**: `/tasks/000-sample.md` 참조
- **명명 규칙**: `Task XXX: [동사] + [대상] + [목적]`
- **각 Task 범위**: 1~2주 내 완료 가능한 단위
- **구현 사항**: 3~7개 구체적 항목
- **API/비즈니스 로직 Task**: Playwright MCP 테스트 체크리스트 필수
