# Task 024: Phase 2 통합 검증 체크리스트

## 문서 목적

Phase 2 UI/UX 전체 23개 페이지(화면 정의서 15개 파일)에 대한 통합 검증 체크리스트이다. 각 페이지 구현 완료 후 이 체크리스트를 기준으로 검증하여 PRD 요구사항 충족, 컴포넌트 일관성, 데이터 바인딩 정확성, 반응형/접근성 준수를 확인한다.

---

## 1. 화면 정의서 전체 목록

| # | 파일 | 페이지 | 라우트 수 | PRD |
|---|------|--------|-----------|-----|
| 1 | `011-dashboard.md` | 메인 대시보드 | 1 | FR-UI-001~004 |
| 2 | `012-sites.md` | 사이트 관리 | 4 | FR-UI-005~010 |
| 3 | `013-investigations.md` | 채증 모니터링 | 5 | FR-UI-011~014, 019 |
| 4 | `014-evidence.md` | 증거 관리 | 4 | FR-UI-015~018 |
| 5 | `015-captcha-queue.md` | CAPTCHA/OTP 수동 개입 | 2+ | FR-UI-019~021 |
| 6 | `016-review.md` | AI 분류 검토 | 2 | FR-UI-022~023 |
| 7 | `017-analytics.md` | 통계 및 분석 | 1 | FR-UI-024~026 |
| 8 | `018-reports.md` | 보고서 | 1 | FR-UI-027~028 |
| 9 | `019-settings.md` | 설정 | 4 | FR-UI-029~032 |
| 10 | `020-auth.md` | 로그인/회원가입 | 2 | FR-API-001 |
| 11 | `021-responsive-dark.md` | 반응형/다크모드 가이드 | (공통) | FR-UI-033~035 |
| 12 | `022-sms-costs.md` | SMS 비용 대시보드 | 1 | FR-SMS-018~021 |
| 13 | `023-setup-wizard.md` | 초기 설정 위저드 | 1 | 슈퍼어드민 |
| 14 | `024-validation.md` | 통합 검증 체크리스트 | (전체) | 전체 |
| 15 | `landing.md` | 랜딩 페이지 | 1 | FR-UI-036~038 |

**총 라우트 수:** 약 30개

---

## 2. PRD 요구사항 전수 검증

### A. 메인 대시보드 (FR-UI-001~004)

- [ ] FR-UI-001: KPI 카드 4개 (탐지 사이트, 채증 성공률, 진행 중 작업, 무결성 검증률)
- [ ] FR-UI-001: 전일 대비 증감률 (TrendingUp/TrendingDown 아이콘)
- [ ] FR-UI-001: 카드 클릭 시 상세 페이지 이동 (/sites, /investigations, /evidence)
- [ ] FR-UI-001: 스켈레톤 UI 로딩 상태
- [ ] FR-UI-002: 최근 활동 6가지 유형 (탐지/채증/분류/도메인/개입/증거)
- [ ] FR-UI-002: SSE 실시간 피드 (3초 이내 반영)
- [ ] FR-UI-002: 유형별 필터링
- [ ] FR-UI-002: 무한 스크롤 추가 로드
- [ ] FR-UI-003: 진행 중 채증 작업 카드 (최대 10개 + "외 N건")
- [ ] FR-UI-003: 프로그레스바 + 현재 단계/경과 시간
- [ ] FR-UI-003: SSE 0.5~1초 간격 업데이트
- [ ] FR-UI-004: 외부 서비스 상태 (SMS/CAPTCHA/프록시) + 잔액
- [ ] FR-UI-004: 3단계 상태 인디케이터 (정상/경고/오류)
- [ ] FR-UI-004: 60초 자동 갱신 + 수동 새로고침

### B. 사이트 관리 (FR-UI-005~010)

- [ ] FR-UI-005: TanStack Table 8개 컬럼 + 서버사이드 필터/정렬/페이지네이션
- [ ] FR-UI-005: URL searchParams 상태 유지
- [ ] FR-UI-006: 6개 탭 (기본 정보/WHOIS·DNS/채증 이력/도메인 이력/증거 파일/관련 사이트)
- [ ] FR-UI-007: URL 입력 폼 + Zod 실시간 검증 + 중복 체크
- [ ] FR-UI-007: 채증 옵션 (즉시/예약/큐등록) + 범위 선택
- [ ] FR-UI-008: 다중 선택 일괄 상태 변경 + 변경 사유 필수
- [ ] FR-UI-009: CSV/XLSX 드래그앤드롭 + 미리보기 + 행별 검증
- [ ] FR-UI-010: 카테고리 변경 + 태그 자동완성 추가/삭제

### C. 채증 모니터링 (FR-UI-011~014)

- [ ] FR-UI-011: 상태별 요약 카드 4개 + 작업 목록 테이블
- [ ] FR-UI-011: 재시도/취소 액션 버튼
- [ ] FR-UI-012: 3단계 스테퍼 + 세부 스텝 + 실시간 로그
- [ ] FR-UI-012: 스크린샷 실시간 추가
- [ ] FR-UI-013: 반응형 그리드 (4/2/1열) + 라이트박스
- [ ] FR-UI-014: 6개 탭 (스크린샷/HTML/네트워크/WHOIS/메타데이터/다운로드)
- [ ] FR-UI-014: 이미지 줌 + 네트워크 로그 가상화 + JSON 트리

### D. 증거 관리 (FR-UI-015~018)

- [ ] FR-UI-015: 증거 파일 테이블 + 무결성 상태 필터 + 개별/일괄 다운로드
- [ ] FR-UI-016: SHA-256/OTS/RFC3161/교차 검증 4가지 항목 결과
- [ ] FR-UI-016: "지금 검증 실행" 온디맨드 버튼
- [ ] FR-UI-017: 3종 보고서 템플릿 + Claude AI 자동 생성 + PDF 미리보기
- [ ] FR-UI-018: Chain of Custody 타임라인 + 읽기 전용 명시 + CSV 내보내기

### E. CAPTCHA/OTP (FR-UI-019~021)

- [ ] FR-UI-019: 대기 큐 카드 + 실시간 카운터 + 브라우저 알림
- [ ] FR-UI-020: CDP WebSocket Canvas 스트리밍 + 원격 입력 + 자동 감지
- [ ] FR-UI-021: Slack Webhook + 웹 푸시 + 5종 알림 유형 매트릭스

### F. AI 분류 검토 (FR-UI-022~023)

- [ ] FR-UI-022: 신뢰도 오름차순 테이블 + 사이드바 대기 건수 배지
- [ ] FR-UI-023: AI 분류 근거 (evidence 배열) + 승인/수정/반려
- [ ] FR-UI-023: 키보드 단축키 (A/E/R/→) + 자동 다음 건 이동

### G. 통계/리포트 (FR-UI-024~028)

- [ ] FR-UI-024: 4종 추이 차트 (Recharts) + 기간 선택 + CSV 내보내기
- [ ] FR-UI-025: 파이/바/도넛 차트 + 세그먼트 클릭 네비게이션
- [ ] FR-UI-026: D3.js 네트워크 그래프 (Phase 3)
- [ ] FR-UI-027: 주간/월간 보고서 자동 생성 + 크론 스케줄
- [ ] FR-UI-028: PDF/XLSX/CSV 내보내기 + 기관별 양식 3종

### H. 시스템 설정 (FR-UI-029~032)

- [ ] FR-UI-029: 사용자 CRUD + 5개 역할 + 비밀번호 초기화
- [ ] FR-UI-030: 5개 설정 탭 + API 키 마스킹 + 연결 테스트
- [ ] FR-UI-031: 키워드 CRUD + 카테고리 그루핑 + AI 자동 생성
- [ ] FR-UI-032: 감사 로그 테이블 + 필터 + 읽기 전용 + CSV 내보내기

### I. 반응형/다크모드/로딩 (FR-UI-033~035)

- [ ] FR-UI-033: 데스크톱/태블릿/모바일 3단계 레이아웃
- [ ] FR-UI-033: 터치 타겟 44x44px
- [ ] FR-UI-034: 라이트/다크/시스템 3가지 모드 + localStorage 저장
- [ ] FR-UI-034: WCAG 2.1 AA 대비비 충족
- [ ] FR-UI-035: NProgress 프로그레스바 + 스켈레톤 UI
- [ ] FR-UI-035: Error Boundary + 404 + 오프라인 배너

### J. 랜딩 페이지 (FR-UI-036~038)

- [ ] FR-UI-036: 히어로 + CTA + 인증 리디렉트
- [ ] FR-UI-037: 6개 기능 카드 + 시스템 구성도
- [ ] FR-UI-038: 4개 기관 + 푸터 (연락처/법적 고지/저작권)

### K. SMS 비용 (FR-SMS-018~021)

- [ ] FR-SMS-018: 서비스별 사용량/비용 차트 + 잔여 크레딧
- [ ] FR-SMS-019: 일일/월간 한도 설정 + 80%/100% 경고
- [ ] FR-SMS-020: 서비스별 성공률 통계
- [ ] FR-SMS-021: 비용 알림 임계치

---

## 3. 공통 컴포넌트 일관성 검증

| 컴포넌트 | 사용 페이지 | 검증 항목 |
|----------|------------|-----------|
| `PageContainer` | 모든 페이지 | title/description/actions 일관된 형식 |
| `DataTable` | sites, investigations, evidence, review, settings(users/keywords/audit-log) | 서버사이드 모드, 페이지당 20/50/100, 정렬 헤더 |
| `StatusBadge` | sites(site), investigations(investigation), evidence(verification), review(review) | type 매개변수 일관성, 색상 매핑 |
| `ConfirmDialog` | 삭제/상태변경/취소 등 파괴적 동작 | variant="destructive", 사유 입력 필수 여부 |
| `EmptyState` | 모든 목록 페이지 | 아이콘, 제목, 설명, 액션 버튼 |
| `TableSkeleton` | 모든 테이블 페이지 | rows/columns 매개변수 적절 설정 |
| `CardSkeleton` | 대시보드, KPI 카드 | lines 매개변수 |
| `toast` (Sonner) | 모든 폼 제출/액션 | 성공(toast.success)/실패(toast.error) 일관된 메시지 |

---

## 4. 데이터 바인딩 검증

| 페이지 | Mock 서비스 | API 엔드포인트 | 타입 일치 |
|--------|------------|----------------|-----------|
| 대시보드 | `mockAnalyticsService.getOverview()` | `GET /api/dashboard/summary` | `DashboardSummaryData` |
| 사이트 목록 | `mockSiteService.getAll()` | `GET /api/sites` | `PaginatedResponse<SiteListItem>` |
| 사이트 상세 | `mockSiteService.getById()` | `GET /api/sites/:id` | `ApiResponse<SiteDetailData>` |
| 채증 목록 | `mockInvestigationService.getAll()` | `GET /api/investigations` | `PaginatedResponse<InvestigationListItem>` |
| 채증 상세 | `mockInvestigationService.getById()` | `GET /api/investigations/:id` | `ApiResponse<InvestigationDetailData>` |
| 증거 목록 | `mockEvidenceService.getAll()` | `GET /api/evidence` | `PaginatedResponse<EvidenceFileItem>` |
| 증거 검증 | `mockEvidenceService.verify()` | `POST /api/evidence/:id/verify` | `ApiResponse<VerifyEvidenceResponseData>` |
| AI 검토 목록 | `mockReviewService.getAll()` | `GET /api/classification` | `PaginatedResponse<ClassificationReviewItem>` |
| 사용자 목록 | `mockUserService.getAll()` | `GET /api/users` | `PaginatedResponse<UserListItem>` |
| 감사 로그 | (mock data) | `GET /api/system/audit-log` | `PaginatedResponse<AuditLogItem>` |
| 시스템 설정 | `mockSettingsService.getAll()` | `GET /api/system/settings` | `PaginatedResponse<SystemSettingItem>` |
| 탐지 통계 | `mockAnalyticsService.getSiteStats()` | `GET /api/stats/detection` | `ApiResponse<DetectionStatsData>` |
| 채증 통계 | `mockAnalyticsService.getInvestigationStats()` | `GET /api/stats/investigation` | `ApiResponse<InvestigationStatsData>` |
| 비용 추이 | `mockAnalyticsService.getCostStats()` | `GET /api/stats/costs` | `ApiResponse<CostTrendItem[]>` |
| 카테고리 분포 | `mockAnalyticsService.getCategoryDistribution()` | `GET /api/stats/categories` | `ApiResponse<CategoryDistributionData>` |

---

## 5. 비기능 요구사항 검증

| NFR ID | 항목 | 목표값 | 검증 방법 |
|--------|------|--------|-----------|
| NFR-UI-001 | 페이지 초기 로드 | FCP 2초 이내 | Lighthouse 측정 |
| NFR-UI-002 | 테이블 렌더링 | 1,000행 500ms 이내 | Performance 프로파일링 |
| NFR-UI-003 | 실시간 업데이트 | SSE 이벤트 3초 이내 UI 반영 | 수동 테스트 |
| NFR-UI-004 | 차트 렌더링 | 1년 일별 데이터 1초 이내 | Performance 프로파일링 |
| NFR-UI-005 | 접근성 | WCAG 2.1 AA 적합 | axe-core 자동 검사 |
| NFR-UI-006 | 브라우저 호환성 | Chrome/Edge/Firefox/Safari 최신 2버전 | 수동 테스트 |
| NFR-UI-007 | 번들 크기 | gzip 200KB 이내 | `next build` 분석 |
| NFR-UI-008 | Lighthouse 점수 | P/A/BP 각 90+ | Lighthouse CI |

---

## 6. 역할별 접근 권한 검증

| 기능 영역 | SUPER_ADMIN | ADMIN | OPERATOR | INVESTIGATOR | LEGAL |
|----------|-------------|-------|----------|-------------|-------|
| 대시보드 | [ ] 전체 | [ ] 전체 | [ ] 전체 | [ ] 읽기 | [ ] 읽기 |
| 사이트 관리 | [ ] 전체 | [ ] 전체 | [ ] 생성/수정/조회 | [ ] 조회/URL등록 | [ ] 조회 |
| 채증 모니터링 | [ ] 전체 | [ ] 전체 | [ ] 전체 | [ ] 조회 | [ ] 조회 |
| 증거 관리 | [ ] 전체 | [ ] 전체 | [ ] 조회/다운로드 | [ ] 조회/다운로드 | [ ] 조회/다운로드 |
| CAPTCHA/OTP | [ ] 전체 | [ ] 전체 | [ ] 전체 | [ ] 수동 풀이 | [ ] 접근불가 |
| AI 검토 | [ ] 전체 | [ ] 전체 | [ ] 전체 | [ ] 조회 | [ ] 전체 |
| 통계/보고서 | [ ] 전체 | [ ] 전체 | [ ] 조회/내보내기 | [ ] 조회/내보내기 | [ ] 조회/내보내기 |
| 시스템 설정 | [ ] 전체 | [ ] 전체 | [ ] 키워드만 | [ ] 접근불가 | [ ] 접근불가 |

---

## 7. 페이지별 구현 완료 체크

| # | 페이지 | 와이어프레임 | 컴포넌트 | 데이터 바인딩 | 인터랙션 | 반응형 | 다크모드 | 스켈레톤 | 에러처리 |
|---|--------|-------------|----------|-------------|----------|--------|---------|---------|---------|
| 1 | 랜딩 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 | 로그인 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 | 회원가입 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4 | 설정 위저드 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5 | 대시보드 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6 | 사이트 목록 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 7 | 사이트 상세 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 8 | 사이트 등록 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 9 | 벌크 임포트 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 10 | 채증 큐 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 11 | 채증 상세 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 12 | 채증 결과 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 13 | 채증 갤러리 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 14 | CAPTCHA 큐 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 15 | 증거 목록 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 16 | 증거 검증 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 17 | 증거 보고서 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 18 | 증거 감사 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 19 | AI 검토 큐 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 20 | AI 검토 상세 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 21 | 통계/분석 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 22 | 보고서 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 23 | 설정 (시스템) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 24 | 설정 (사용자) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 25 | 설정 (키워드) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 26 | 설정 (감사로그) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 27 | SMS 비용 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
