# 의사결정 로그

주요 기획 의사결정과 그 근거를 기록합니다.

## 형식

```
### [날짜] 결정 제목
- **결정**: 결정 내용
- **근거**: 결정 이유
- **영향**: 결정으로 인한 변경사항
- **상태**: 확정 / 재검토 필요
```

---

## Plan 1.5 기술 심층 리서치 결과 (2026-03-14)

### [2026-03-14] 브라우저 자동화: rebrowser-playwright Tier 1 도입
- **결정**: Playwright를 `rebrowser-playwright`로 드롭인 교체. Tier 2로 Nstbrowser($30/월) 또는 Browserless($200/월) 대기
- **근거**: Runtime.Enable CDP 유출 패치로 Cloudflare/DataDome 우회. 무료, ~85% 사이트 커버. playwright-extra/stealth보다 브라우저 레벨 패치로 효과적
- **영향**: `npm install rebrowser-playwright`로 기존 코드 즉시 교체 가능. CDP Pause&Attach 패턴 완전 호환
- **상태**: 확정

### [2026-03-14] SMS 인증: PVAPins Non-VoIP 1순위 서비스
- **결정**: PVAPins(Non-VoIP 실제 통신사 SIM) 1순위, GrizzlySMS/SMS-Activate(VoIP) 2순위 폴백
- **근거**: 불법 도박사이트는 VoIP 번호 탐지·차단 가능. Non-VoIP는 실제 통신사 SIM이므로 우회 가능성 높음 (예상 성공률 60-80% vs VoIP 30-50%)
- **영향**: SMS 비용 $700~1,400/월 (전체 운영비 최대 항목). 즉시 테스트 번호 구매하여 실제 성공률 검증 필요
- **상태**: 테스트 후 재검토 필요

### [2026-03-14] 크롤링 프레임워크: Crawlee + Apify 생태계 채택
- **결정**: Crawlee(PlaywrightCrawler) + got-scraping + fingerprint-suite 채택
- **근거**: Node.js/TypeScript 네이티브 호환, Playwright 통합, 안티블로킹·프록시 로테이션·큐 관리 내장, 22.2k GitHub stars
- **영향**: 대규모 크롤링 인프라를 자체 구현 대신 Crawlee로 구성. rebrowser-playwright와 조합
- **상태**: 확정

### [2026-03-14] LLM: Haiku 4.5 기본 모델, Sonnet 4.6 보고서 전용
- **결정**: Claude Haiku 4.5를 콘텐츠 분류/폼 탐지/CAPTCHA 탐지에 사용, Sonnet 4.6은 보고서 생성 전용
- **근거**: Haiku 4.5로 도박 사이트 분류 F1 94-95% 달성 가능 (few-shot). 건당 $0.003으로 비용 효율적. 학습 데이터 없이 즉시 시작 가능하여 ML 파이프라인 불필요
- **영향**: Phase 1~2에서 독립 ML 모델 불필요. 데이터 축적 후 XGBoost/BERT 하이브리드로 점진 전환
- **상태**: 확정

### [2026-03-14] 증거 무결성: OpenTimestamps 즉시 도입
- **결정**: OpenTimestamps(비트코인 블록체인 타임스탬핑) 즉시 채택 + RFC 3161 자체 구현으로 이중화
- **근거**: 무료, 탈중앙화, 10년 후에도 검증 가능. RFC 3161은 기존 법률 체계에서 더 넓은 인정 기반
- **영향**: 증거 패키지에 `.ots` 파일 포함. SingleFile + WARC + SHA-256 해시와 결합
- **상태**: 확정

### [2026-03-14] CAPTCHA 오픈소스: 비채택
- **결정**: 오픈소스 CAPTCHA 솔버 자체 구축하지 않고 CapSolver/2Captcha API 사용
- **근거**: 실제 테스트 결과 CAPTCHA 출현 빈도 극히 낮아 월 ~$2 비용. 오픈소스 구축 시 40시간+ 필요하여 ROI 없음
- **영향**: CAPTCHA 관련 개발 리소스를 SMS 인증 자동화에 집중
- **상태**: 확정

### [2026-03-14] Computer Use: 폴백 전용
- **결정**: Claude Computer Use는 Playwright 실패 시 폴백으로만 사용. 기본 자동화는 Playwright
- **근거**: Computer Use는 액션당 ~5초 (Playwright ~100ms, 50x 느림), 액션당 ~$0.30~0.50 (Playwright $0, 3000x 비쌈). 대규모 처리에 비실용적
- **영향**: 미지 사이트 ~10%에서만 Computer Use 호출. 월 추가 비용 $15~25
- **상태**: 확정

---

## 백엔드 아키텍처 결정 (2026-03-15)

### [2026-03-15] 백엔드 프레임워크: FastAPI (Python) 채택

- **결정**: Next.js API Routes에서 FastAPI (Python)로 백엔드 전환. 35개 API 엔드포인트를 FastAPI로 마이그레이션
- **근거**: LangChain/LangGraph와 네이티브 Python 연동 필요. AI/ML 생태계(채증 워크플로우 상태 머신, 사이트 분류, 키워드 생성, 보고서 자동 생성)가 Python 중심. FastAPI의 비동기 성능과 자동 OpenAPI 문서 생성도 이점
- **영향**:
  - 프론트엔드(Next.js)와 백엔드(FastAPI)가 분리된 구조로 전환
  - ORM: Prisma -> SQLAlchemy + Alembic (마이그레이션)
  - 인증: NextAuth.js -> FastAPI 자체 JWT 인증 또는 동등 솔루션
  - 작업 큐: BullMQ(Redis) -> Celery 또는 FastAPI BackgroundTasks (검토 필요)
  - 프로젝트 구조: `frontend/` (Next.js) + `backend/` (FastAPI) 분리 완료
- **상태**: 확정

### [2026-03-15] 데이터베이스: PostgreSQL 유지 + ORM 전환

- **결정**: PostgreSQL 유지. ORM을 Prisma에서 SQLAlchemy + Alembic으로 전환
- **근거**: PostgreSQL은 이미 선정된 DB이므로 변경 불필요. Python 백엔드 전환에 따라 ORM도 Python 네이티브인 SQLAlchemy로 변경. 기존 Prisma 스키마(21개 모델)를 SQLAlchemy 모델로 재작성
- **영향**:
  - `prisma/schema.prisma` 21개 모델 -> SQLAlchemy 모델로 전환 예정
  - Alembic으로 DB 마이그레이션 관리
  - 기존 Prisma 스키마는 참조용으로 유지
- **상태**: 확정

### [2026-03-15] 오브젝트 스토리지: MinIO (S3 호환) 확정

- **결정**: MinIO를 증거 파일 저장소로 확정. 캡처 이미지, 증거 패키지, 스크린샷, HTML 소스 등 모든 채증 산출물 저장
- **근거**: S3 호환 API로 AWS S3 전환 용이. 온프레미스 배포 가능하여 증거 데이터의 물리적 관할권 확보. 기존 service-concept에서 이미 MinIO 사용 계획이었으므로 확정
- **영향**:
  - `backend/` 에서 `boto3` (Python S3 SDK) 사용
  - 증거 패키지 구조: `evidence/{siteId}/{investigationId}/stage-{n}/{filename}`
  - Docker Compose에 MinIO 서비스 포함
- **상태**: 확정

### [2026-03-15] AI 오케스트레이션: LangChain + LangGraph 채택

- **결정**: LangChain과 LangGraph를 FastAPI 백엔드에서 활용
- **근거**: 채증 자동화 워크플로우는 복잡한 상태 머신(분기, 재시도, 수동 개입 대기)이 필요하며 LangGraph의 그래프 기반 상태 관리가 최적. LangChain은 Claude API 호출, 프롬프트 관리, 체인 구성에 표준화된 인터페이스 제공
- **영향**:
  - 사이트 분류 (도박 여부 판정) -> LangChain + Claude Haiku
  - 채증 자동화 워크플로우 (3단계 파이프라인) -> LangGraph 상태 머신
  - 검색 키워드 자동 생성/확장 -> LangChain
  - 수사 보고서 자동 생성 -> LangChain + Claude Sonnet
  - CAPTCHA 대응 분기 로직 -> LangGraph (유형 판별 -> API 풀이/수동 개입/스킵 분기)
- **상태**: 확정
