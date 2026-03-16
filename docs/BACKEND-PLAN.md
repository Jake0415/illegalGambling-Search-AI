# 백엔드 개발 계획서

> **프로젝트**: illegalGambling-Search-AI (불법 도박 사이트 자동 검색/채증 시스템)
> **작성일**: 2026-03-16
> **버전**: v1.0
> **PRD 기준**: v1.2 (219개 기능 요구사항, 49개 API 엔드포인트, 21개 DB 테이블)
> **현재 상태**: Phase 2 완료 (프론트엔드 UI 14개 페이지 + 35개 API route 스켈레톤)

---

## 목차

1. [현재 상태 분석](#1-현재-상태-분석)
2. [아키텍처 설계](#2-아키텍처-설계)
3. [기술 스택 상세](#3-기술-스택-상세)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [데이터베이스 설계](#5-데이터베이스-설계)
6. [API 엔드포인트 명세](#6-api-엔드포인트-명세)
7. [인증 및 권한 설계](#7-인증-및-권한-설계)
8. [통신 패턴 (Next.js ↔ FastAPI)](#8-통신-패턴)
9. [Phase별 구현 계획](#9-phase별-구현-계획)
10. [로컬 개발 환경](#10-로컬-개발-환경)
11. [배포 전략](#11-배포-전략)
12. [환경 변수 명세](#12-환경-변수-명세)
13. [검증 및 테스트 전략](#13-검증-및-테스트-전략)

---

## 1. 현재 상태 분석

### 1.1 완성된 것 (Phase 1-2)

| 영역 | 상태 | 상세 |
|------|------|------|
| **프론트엔드 UI** | ✅ 완료 | 14개 핵심 페이지 + 랜딩 페이지, shadcn/ui, 반응형, 다크모드 |
| **타입 시스템** | ✅ 완료 | `types/domain.ts` (21개 엔티티), `types/api.ts` (49개 DTO), `types/enums.ts` (18개 enum), `types/forms.ts` (12개 Zod 스키마) |
| **API Route 스켈레톤** | ✅ 완료 | 35개 `route.ts` 파일 (mock 데이터 반환, `TODO: Phase 3` 주석) |
| **Mock 데이터** | ✅ 완료 | 30개 사이트, 50개 채증, 사용자, 통계 등 `server/mock/` 디렉토리 |
| **Mock 서비스** | ✅ 완료 | `server/mock/services/` 에 CRUD, 페이지네이션, 필터링 로직 구현 |
| **Prisma 스키마** | ✅ 완료 | `prisma/schema.prisma` 에 21개 모델 정의 (마이그레이션 참조용) |
| **응답 유틸** | ✅ 완료 | `apiSuccess()`, `apiError()`, `apiPaginated()` 헬퍼 함수 |

### 1.2 미완성 (Phase 3에서 구현)

| 영역 | 상태 | 필요한 작업 |
|------|------|------------|
| **FastAPI 백엔드** | ❌ 없음 | Python 프로젝트 전체 구축 |
| **실제 DB 연동** | ❌ 없음 | Supabase PostgreSQL + SQLAlchemy |
| **인증 시스템** | ❌ 없음 | JWT 발급/검증, RBAC, 로그인 잠금 |
| **파일 저장소** | ❌ 없음 | MinIO 설정, 증거 파일 관리 |
| **비동기 작업** | ❌ 없음 | Celery + Redis 워커 |
| **채증 엔진** | ❌ 없음 | rebrowser-playwright 3단계 파이프라인 |
| **AI 분류** | ❌ 없음 | Claude Haiku + LangChain |
| **외부 서비스** | ❌ 없음 | SMS, CAPTCHA, 프록시, Google Search |

---

## 2. 아키텍처 설계

### 2.1 전체 시스템 구성

```
┌──────────────────────────────────────────────────────────────┐
│                        사용자 (Browser)                       │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Vercel (프론트엔드 호스팅)                        │
│                                                              │
│  Next.js 15 (App Router)                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  서버 컴포넌트 / API Routes (프록시)                    │  │
│  │  - 기존 35개 route.ts → FastAPI 프록시로 전환          │  │
│  │  - JWT 토큰 서버사이드 관리 (httpOnly cookie)          │  │
│  │  - 환경변수: FASTAPI_URL                               │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ fetch(FASTAPI_URL + '/api/v1/...')
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  VPS (백엔드 서버)                             │
│                  Docker Compose 환경                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Nginx / Caddy (Reverse Proxy)                       │    │
│  │  - HTTPS 자동 인증서 (Let's Encrypt)                  │    │
│  │  - api.yourdomain.com → FastAPI :8000                │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  FastAPI (Python 3.12+, Uvicorn)                     │    │
│  │                                                      │    │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │    │
│  │  │ Auth/RBAC  │ │ REST API   │ │ SSE Streaming    │ │    │
│  │  │ JWT 발급   │ │ 49개 엔드  │ │ 채증 실시간 상태 │ │    │
│  │  │ bcrypt     │ │ 포인트     │ │                  │ │    │
│  │  └────────────┘ └────────────┘ └──────────────────┘ │    │
│  │                      │                               │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │ Services Layer (비즈니스 로직)                  │  │    │
│  │  │ site_service, investigation_service,           │  │    │
│  │  │ evidence_service, auth_service,                │  │    │
│  │  │ audit_service, analytics_service               │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│  ┌──────────┐  ┌────────┴───────┐  ┌──────────────────────┐ │
│  │ Redis 7  │  │ Celery Worker  │  │ MinIO                │ │
│  │          │  │                │  │ (S3 호환 저장소)      │ │
│  │ - 작업큐 │  │ - 채증 실행    │  │ - 증거 파일 저장     │ │
│  │ - 캐시   │  │ - 탐지 스캔    │  │ - WORM 모드          │ │
│  │ - 세션   │  │ - 보고서 생성  │  │ - presigned URL      │ │
│  │ - 토큰   │  │ - AI 분류      │  │                      │ │
│  │   블랙    │  │                │  │                      │ │
│  │   리스트  │  │ ┌────────────┐│  │                      │ │
│  └──────────┘  │ │Playwright  ││  │                      │ │
│                │ │(채증 엔진) ││  │                      │ │
│                │ └────────────┘│  │                      │ │
│                │ ┌────────────┐│  │                      │ │
│                │ │LangChain   ││  │                      │ │
│                │ │(AI 분류)   ││  │                      │ │
│                │ └────────────┘│  │                      │ │
│                └───────────────┘  └──────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │ postgresql+asyncpg (SSL)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Supabase (관리형 PostgreSQL)                      │
│                                                              │
│  - PostgreSQL 16 (DB만 사용, Auth/Storage 미사용)             │
│  - PgBouncer 포트 6543 (Connection Pooling)                  │
│  - SSL 필수 연결                                              │
│  - 21개 테이블, 30+ 인덱스                                    │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 데이터 흐름

```
[사용자 액션]
    │
    ▼
[Next.js API Route] ──fetch──> [FastAPI /api/v1/*]
    │                                │
    │                        ┌───────┴───────────┐
    │                        ▼                   ▼
    │               [즉시 응답 가능]      [비동기 작업 필요]
    │                   │                    │
    │                   ▼                    ▼
    │           [SQLAlchemy 쿼리]    [Celery 큐 등록]
    │                   │                    │
    │                   ▼                    ▼
    │           [Supabase PG]       [Celery Worker]
    │                   │                    │
    │                   ▼              ┌─────┴──────┐
    │              [응답 반환]         │            │
    │                              [Playwright] [LangChain]
    │                                  │            │
    │                              [MinIO 저장] [DB 업데이트]
    │                                  │
    ◄──── SSE 실시간 진행 상태 ────────┘
```

### 2.3 핵심 설계 결정

| 결정 | 선택 | 대안 | 선택 이유 |
|------|------|------|----------|
| API 프레임워크 | FastAPI (Python) | Next.js API Routes | 채증 엔진(Playwright), AI(LangChain), 크롤링(Scrapy) 모두 Python 생태계. 비동기 고성능, 자동 OpenAPI 문서 |
| DB 접근 방식 | Supabase PG를 SQLAlchemy로 직접 연결 | Supabase Client SDK | ORM 기반 복잡한 쿼리, 마이그레이션 관리, 트랜잭션 제어가 필요 |
| 인증 | FastAPI JWT 직접 구현 | Supabase Auth | RBAC 5개 역할, 로그인 잠금, 감사 로그 등 커스텀 요구사항이 많음 |
| 파일 저장소 | MinIO (자체 운영) | Supabase Storage | WORM 모드(증거 변조 방지) 필요, S3 호환 API, 비용 효율적 |
| 비동기 작업 | Celery + Redis | FastAPI BackgroundTasks | 재시도, 우선순위, 분산 처리, 모니터링(Flower) 필요 |
| 프론트-백 통신 | Next.js API Routes 프록시 | 프론트에서 직접 호출 | 기존 route.ts 최소 변경, JWT 서버사이드 관리, CORS 단순화 |
| 패키지 관리 | uv + pyproject.toml | pip + requirements.txt | 빠른 설치, lockfile 지원, PEP 표준 준수 |

---

## 3. 기술 스택 상세

### 3.1 백엔드 핵심

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| API 프레임워크 | FastAPI | 0.115+ | REST API, 자동 OpenAPI 문서, 의존성 주입 |
| ASGI 서버 | Uvicorn | 0.32+ | 프로덕션 ASGI 서버 |
| ORM | SQLAlchemy | 2.x | 비동기 DB 세션, Mapped 어노테이션 |
| DB 마이그레이션 | Alembic | 1.14+ | 스키마 버전 관리 |
| DB 드라이버 (비동기) | asyncpg | 0.30+ | SQLAlchemy async 연결 |
| DB 드라이버 (동기) | psycopg2-binary | 2.9+ | Alembic 마이그레이션용 |
| 유효성 검증 | Pydantic | v2 | 요청/응답 스키마, 환경변수 관리 |
| 인증 | python-jose | 3.3+ | JWT 토큰 생성/검증 |
| 비밀번호 | passlib[bcrypt] | 1.7+ | bcrypt 해싱 (cost factor 12) |
| HTTP 클라이언트 | httpx | 0.28+ | 외부 API 호출 (비동기) |

### 3.2 인프라

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 데이터베이스 | Supabase PostgreSQL | 16 | 주 데이터 저장소 (관리형) |
| 캐시/큐 브로커 | Redis | 7.x | Celery 브로커, 세션 캐시, 토큰 블랙리스트 |
| 비동기 작업 | Celery | 5.4+ | 채증/탐지/보고서 백그라운드 작업 |
| 파일 저장소 | MinIO | latest | S3 호환 증거 파일 저장 (WORM 모드) |
| S3 SDK | boto3 | 1.35+ | MinIO/S3 클라이언트 |
| 컨테이너 | Docker + Docker Compose | 27+ | 로컬 개발 및 프로덕션 배포 |

### 3.3 채증 엔진 (Phase 3-D)

| 영역 | 기술 | 용도 |
|------|------|------|
| 브라우저 자동화 | rebrowser-playwright | 안티봇 우회 Playwright (CDP 유출 패치) |
| 핑거프린트 격리 | playwright-stealth | 브라우저 핑거프린트 관리 |
| 크롤링 | Scrapy + scrapy-playwright | 도메인 호핑 탐지, WHOIS/DNS 수집 |
| AI 분류 | LangChain + langchain-anthropic | Claude Haiku 4.5 분류 체인 |
| AI 오케스트레이션 | LangGraph | 채증 파이프라인 상태 머신 |

### 3.4 외부 서비스 (Phase 4)

| 서비스 | 용도 | 월 예상 비용 |
|--------|------|-------------|
| Claude API (Haiku/Sonnet) | AI 분류, 보고서 생성 | ~$25 |
| Google Custom Search | 불법 도박 사이트 탐지 | ~$50 |
| PVAPins (Non-VoIP SMS) | SMS 인증 자동화 (1순위) | $400~1,400 |
| GrizzlySMS / SMS-Activate | SMS 폴백 (2,3순위) | $625~1,875 |
| CapSolver / 2Captcha | CAPTCHA 자동 풀이 | ~$2 |
| IPRoyal / SOAX | 레지덴셜 프록시 로테이션 | $100~500 |

---

## 4. 프로젝트 구조

```
backend/
├── pyproject.toml              # 의존성 + 프로젝트 설정 (uv)
├── alembic.ini                 # Alembic 설정
├── Dockerfile                  # FastAPI 서버 컨테이너
├── docker-compose.yml          # 로컬: FastAPI + Redis + MinIO + (PG)
├── .env.example                # 환경변수 템플릿
│
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 앱, CORS, 미들웨어, 라우터 등록
│   ├── config.py               # Pydantic Settings (환경변수 로드/검증)
│   │
│   ├── core/                   # 인프라 계층
│   │   ├── __init__.py
│   │   ├── database.py         # AsyncEngine, AsyncSession, get_db()
│   │   ├── redis.py            # Redis 클라이언트 (aioredis)
│   │   ├── storage.py          # MinIO 클라이언트 (boto3), presigned URL
│   │   ├── auth.py             # JWT 생성/검증, OAuth2PasswordBearer
│   │   ├── permissions.py      # RBAC 의존성 (require_roles)
│   │   └── security.py         # bcrypt 해싱, 로그인 실패 카운터
│   │
│   ├── models/                 # SQLAlchemy 모델 (← Prisma 스키마 변환)
│   │   ├── __init__.py         # 모든 모델 import (Alembic용)
│   │   ├── base.py             # DeclarativeBase, TimestampMixin, SoftDeleteMixin
│   │   ├── enums.py            # Python Enum (← frontend/src/types/enums.ts)
│   │   ├── user.py             # User, Session
│   │   ├── site.py             # Site
│   │   ├── investigation.py    # Investigation
│   │   ├── evidence.py         # EvidenceFile, HashRecord, Timestamp
│   │   ├── audit.py            # AuditLog
│   │   ├── sms.py              # SmsNumber, SmsMessage
│   │   ├── intervention.py     # ManualInterventionQueue
│   │   ├── detection.py        # Keyword, DetectionResult, ClassificationResult
│   │   ├── domain.py           # DomainHistory, DomainCluster, SiteDomainCluster
│   │   └── system.py           # SystemSetting, PopupPattern
│   │
│   ├── schemas/                # Pydantic v2 스키마 (← frontend/src/types/api.ts)
│   │   ├── __init__.py
│   │   ├── common.py           # ApiResponse[T], PaginatedResponse[T], ApiError
│   │   ├── auth.py             # LoginRequest, LoginResponse, CurrentUserData
│   │   ├── site.py             # CreateSiteRequest, SiteListItem, SiteDetailData
│   │   ├── investigation.py    # CreateInvestigationRequest, InvestigationListItem
│   │   ├── evidence.py         # EvidenceFileItem, VerifyEvidenceResponse
│   │   ├── detection.py        # DetectionScanRequest, KeywordItem
│   │   ├── analytics.py        # DashboardSummaryData, StatsFilter
│   │   ├── system.py           # HealthCheckData, SystemSettingItem
│   │   └── user.py             # CreateUserRequest, UserListItem
│   │
│   ├── api/                    # FastAPI 라우터
│   │   ├── __init__.py
│   │   ├── deps.py             # 공통 의존성 (current_user, pagination, db_session)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py       # 모든 v1 라우터 통합 (APIRouter prefix="/api/v1")
│   │       ├── auth.py         # POST /login, /logout, /refresh, GET /me
│   │       ├── sites.py        # 사이트 CRUD (7개 엔드포인트)
│   │       ├── investigations.py # 채증 CRUD + SSE (8개 엔드포인트)
│   │       ├── evidence.py     # 증거 관리 (6개 엔드포인트)
│   │       ├── detection.py    # 탐지 엔진 (6개 엔드포인트)
│   │       ├── analytics.py    # 통계/분석 (5개 엔드포인트)
│   │       ├── review.py       # AI 분류 검토 (4개 엔드포인트)
│   │       ├── reports.py      # 보고서 (3개 엔드포인트)
│   │       ├── settings.py     # 설정 + 사용자 관리 (5개 엔드포인트)
│   │       ├── system.py       # 헬스 체크 (2개 엔드포인트)
│   │       └── setup.py        # 초기 설정 위저드
│   │
│   ├── services/               # 비즈니스 로직 계층
│   │   ├── __init__.py
│   │   ├── auth_service.py     # 인증, 토큰 관리, 로그인 잠금
│   │   ├── site_service.py     # 사이트 CRUD, URL 정규화, 중복 검사
│   │   ├── investigation_service.py # 채증 세션 관리, 상태 머신
│   │   ├── evidence_service.py # 증거 무결성, 해시 검증, 패키지 생성
│   │   ├── user_service.py     # 사용자 CRUD
│   │   ├── audit_service.py    # 감사 로그 기록, 해시 체인
│   │   └── analytics_service.py # 통계 집계 쿼리
│   │
│   ├── tasks/                  # Celery 비동기 작업
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery 인스턴스, 큐/우선순위 설정
│   │   ├── investigation_tasks.py # 채증 실행 워커
│   │   ├── detection_tasks.py  # 탐지 스캔 워커
│   │   └── evidence_tasks.py   # 증거 패키지 생성, 타임스탬프
│   │
│   ├── crawler/                # 채증 엔진 (Phase 3-D)
│   │   ├── __init__.py
│   │   ├── browser_pool.py     # rebrowser-playwright 인스턴스 풀
│   │   ├── stage1.py           # 1단계: 메인화면 캡처
│   │   ├── stage2.py           # 2단계: 회원가입/로그인
│   │   ├── stage3.py           # 3단계: 배팅 화면
│   │   └── popup_handler.py    # 팝업/광고 자동 닫기
│   │
│   └── llm/                    # AI 분류 (Phase 3-D)
│       ├── __init__.py
│       ├── classifier.py       # LangChain + Claude Haiku 분류 체인
│       └── prompts.py          # 프롬프트 템플릿
│
├── alembic/                    # DB 마이그레이션
│   ├── env.py
│   └── versions/
│
├── tests/                      # 테스트
│   ├── conftest.py             # pytest 픽스처 (TestClient, DB 세션)
│   ├── test_auth.py
│   ├── test_sites.py
│   ├── test_investigations.py
│   └── test_evidence.py
│
└── scripts/                    # 유틸리티 스크립트
    ├── seed.py                 # 초기 데이터 시드
    └── send-email.js           # 기존 스크립트 유지
```

---

## 5. 데이터베이스 설계

### 5.1 Supabase PostgreSQL 연결

```python
# backend/app/core/database.py

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Supabase connection string 변환
# 원본: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
# 변환: postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://...
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    connect_args={"ssl": "require"},  # Supabase SSL 필수
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
```

**주의사항:**
- Supabase PgBouncer 포트 `6543` 사용 (직접 연결 포트 `5432`도 가능하나 풀링 권장)
- Alembic 마이그레이션은 동기 드라이버 필요: `SYNC_DATABASE_URL` (psycopg2) 별도 설정
- SSL 필수: `connect_args={"ssl": "require"}`

### 5.2 SQLAlchemy 모델 공통 패턴

```python
# backend/app/models/base.py

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from uuid_extensions import uuid7
from datetime import datetime
from typing import Optional

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    """모든 모델의 공통 감사 필드"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

class SoftDeleteMixin(TimestampMixin):
    """소프트 삭제 지원 모델"""
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
```

### 5.3 엔티티 목록 (21개)

변환 원본: `prisma/schema.prisma`, `docs/PRD-sections/08-data-model.md`

| # | 테이블명 | 설명 | Phase | 관계 |
|---|---------|------|-------|------|
| 1 | `sites` | 불법 도박 사이트 | 3-A | → investigations, detection_results, classification_results |
| 2 | `investigations` | 채증 세션 | 3-A | → site, evidence_files, sms_numbers, manual_interventions |
| 3 | `evidence_files` | 증거 파일 메타데이터 | 3-A | → investigation, hash_records, timestamps |
| 4 | `hash_records` | 해시 체인 검증 | 3-A | → evidence_file |
| 5 | `timestamps` | OTS/RFC3161 타임스탬프 | 3-D | → evidence_file |
| 6 | `audit_logs` | 감사 로그 (불변) | 3-B | → user |
| 7 | `sms_numbers` | 가상 전화번호 | 4 | → investigation |
| 8 | `sms_messages` | SMS 수신 메시지 | 4 | → sms_number, investigation |
| 9 | `manual_intervention_queue` | 수동 개입 요청 | 3-C | → investigation, user |
| 10 | `keywords` | 검색 키워드 | 3-D | - |
| 11 | `detection_results` | 탐지 결과 | 3-D | → site |
| 12 | `classification_results` | AI 분류 결과 | 3-D | → site, investigation, user |
| 13 | `domain_history` | 도메인 변경 이력 | 3-D | → site |
| 14 | `domain_clusters` | 도메인 클러스터 | 4 | → site_domain_clusters |
| 15 | `site_domain_clusters` | 사이트-클러스터 관계 | 4 | → site, domain_cluster |
| 16 | `users` | 사용자 | 3-A | → investigations, audit_logs, sessions |
| 17 | `sessions` | 인증 세션/토큰 | 3-B | → user |
| 18 | `system_settings` | 시스템 설정 | 3-B | → user (updatedBy) |
| 19 | `popup_patterns` | 팝업 패턴 | 3-D | → site |
| 20 | `reports` | 보고서 | 3-E | → user |
| 21 | `notifications` | 알림 | 4 | → user |

### 5.4 핵심 Enum 타입

변환 원본: `frontend/src/types/enums.ts`

```python
# backend/app/models/enums.py

import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    OPERATOR = "operator"
    INVESTIGATOR = "investigator"
    LEGAL = "legal"

class SiteStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"
    MONITORING = "monitoring"

class SiteCategory(str, enum.Enum):
    SPORTS_BETTING = "sports_betting"
    HORSE_RACING = "horse_racing"
    CASINO = "casino"
    OTHER_GAMBLING = "other_gambling"
    NON_GAMBLING = "non_gambling"

class InvestigationStatus(str, enum.Enum):
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    STAGE_1_COMPLETE = "stage_1_complete"
    STAGE_2_COMPLETE = "stage_2_complete"
    STAGE_3_COMPLETE = "stage_3_complete"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class EvidenceFileType(str, enum.Enum):
    SCREENSHOT = "screenshot"
    HTML = "html"
    WARC = "warc"
    NETWORK_LOG = "network_log"
    WHOIS = "whois"
    METADATA = "metadata"
    SINGLEFILE = "singlefile"

# ... 나머지 enum은 enums.ts 참조
```

---

## 6. API 엔드포인트 명세

### 6.1 엔드포인트 요약 (49개)

변환 원본: `docs/PRD-sections/07-api-specification.md`, `frontend/src/types/api.ts`

#### A. 인증 API (4개) — Phase 3-B

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/api/v1/auth/login` | 로그인 (JWT 발급) | 불필요 |
| POST | `/api/v1/auth/logout` | 로그아웃 (토큰 무효화) | 필요 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 | refresh_token |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 | 필요 |

#### B. 사이트 관리 API (7개) — Phase 3-B

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/sites` | 사이트 목록 (커서 페이지네이션) | 전체 |
| POST | `/api/v1/sites` | 사이트 등록 | admin, operator, investigator |
| GET | `/api/v1/sites/{id}` | 사이트 상세 | 전체 |
| PATCH | `/api/v1/sites/{id}` | 사이트 수정 | admin, operator, investigator |
| DELETE | `/api/v1/sites/{id}` | 사이트 삭제 (소프트) | admin |
| POST | `/api/v1/sites/bulk` | 벌크 URL 임포트 | admin, operator |
| GET | `/api/v1/sites/{id}/history` | 도메인 변경 이력 | 전체 |

#### C. 채증 관리 API (8개) — Phase 3-C

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/investigations` | 채증 목록 | 전체 |
| POST | `/api/v1/investigations` | 채증 생성 | admin, operator, investigator |
| GET | `/api/v1/investigations/{id}` | 채증 상세 | 전체 |
| POST | `/api/v1/investigations/{id}/cancel` | 채증 취소 | admin, operator, investigator |
| POST | `/api/v1/investigations/{id}/retry` | 채증 재시도 | admin, operator |
| GET | `/api/v1/investigations/{id}/screenshots` | 스크린샷 목록 | 전체 |
| GET | `/api/v1/investigations/{id}/evidence` | 증거 파일 목록 | 전체 |
| GET | `/api/v1/investigations/queue` | 큐 상태 | admin, operator |

#### D. 증거 관리 API (6개) — Phase 3-C

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/evidence` | 증거 패키지 목록 | 전체 |
| GET | `/api/v1/evidence/{id}` | 증거 상세 | 전체 |
| POST | `/api/v1/evidence/{id}/verify` | 무결성 검증 | 전체 |
| GET | `/api/v1/evidence/{id}/download` | 패키지 다운로드 | admin, operator, investigator |
| POST | `/api/v1/evidence/{id}/report` | 법원 제출용 보고서 생성 | admin, operator |
| GET | `/api/v1/evidence/{id}/audit` | 감사 로그 조회 | admin, operator, investigator(본인) |

#### E. AI 분류 검토 API (4개) — Phase 3-D

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/review` | 검토 큐 목록 | admin, operator, investigator |
| GET | `/api/v1/review/{id}` | 분류 상세 | admin, operator, investigator |
| POST | `/api/v1/review/{id}/approve` | 분류 승인 | admin, operator, investigator |
| POST | `/api/v1/review/{id}/reject` | 분류 거부/수정 | admin, operator, investigator |

#### F. 탐지 엔진 API (6개) — Phase 4

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| POST | `/api/v1/detection/search` | Google Search 탐지 | admin, operator |
| POST | `/api/v1/detection/crawl` | 크롤링 탐지 | admin, operator |
| POST | `/api/v1/detection/classify` | AI 분류 실행 | admin, operator |
| GET | `/api/v1/detection/domains` | 도메인 호핑 조회 | 전체 |
| GET | `/api/v1/detection/keywords` | 키워드 목록 | 전체 |
| POST | `/api/v1/detection/keywords` | 키워드 생성 | admin, operator |

#### G. 통계/분석 API (5개) — Phase 3-E

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/analytics/overview` | 대시보드 KPI | 전체 |
| GET | `/api/v1/analytics/sites` | 사이트 통계 | 전체 |
| GET | `/api/v1/analytics/investigations` | 채증 통계 | 전체 |
| GET | `/api/v1/analytics/costs` | SMS/프록시 비용 | admin, operator |
| GET | `/api/v1/analytics/categories` | 카테고리 분포 | 전체 |

#### H. 보고서 API (3개) — Phase 3-E

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/reports` | 보고서 목록 | 전체 |
| POST | `/api/v1/reports` | 보고서 생성 (PDF/Excel) | admin, operator |
| GET | `/api/v1/reports/{id}` | 보고서 상세/다운로드 | 전체 |

#### I. 설정 관리 API (5개) — Phase 3-B

| 메서드 | 엔드포인트 | 설명 | 권한 |
|--------|-----------|------|------|
| GET | `/api/v1/settings` | 시스템 설정 조회 | admin, operator |
| PATCH | `/api/v1/settings` | 시스템 설정 수정 | admin |
| GET | `/api/v1/settings/users` | 사용자 목록 | admin |
| POST | `/api/v1/settings/users` | 사용자 생성 | admin |
| PATCH | `/api/v1/settings/users/{id}` | 사용자 수정 | admin |

#### J. 시스템 API (2개) — Phase 3-A

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| GET | `/api/v1/system/health` | 헬스 체크 | 불필요 |
| GET | `/api/v1/sse/investigations/{id}` | SSE 채증 실시간 스트림 | 필요 |

### 6.2 공통 응답 형식

```json
// 단건 성공 응답
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123def456",
    "timestamp": "2026-03-16T09:30:00.000Z"
  }
}

// 목록 성공 응답 (커서 기반 페이지네이션)
{
  "data": [ ... ],
  "pagination": {
    "total": 1523,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "eyJpZCI6Inh5ejc4OSJ9",
    "prevCursor": null
  },
  "meta": { ... }
}

// 에러 응답
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터의 유효성 검증에 실패했습니다.",
    "details": [{ "field": "url", "message": "올바른 URL 형식이 아닙니다." }],
    "requestId": "req_abc123def456",
    "timestamp": "2026-03-16T09:30:00.000Z"
  }
}
```

### 6.3 Rate Limiting

| 구분 | 제한 | 기준 | 초과 시 |
|------|------|------|---------|
| 일반 API | 100 req/min | IP + User | HTTP 429 |
| 인증 API | 10 req/min | IP | HTTP 429 + 5분 잠금 |
| 파일 다운로드 | 20 req/min | User | HTTP 429 |
| 벌크 작업 | 5 req/min | User | HTTP 429 |
| SSE | 5 connections | User | 연결 거부 |

---

## 7. 인증 및 권한 설계

### 7.1 JWT 토큰 구조

```json
{
  "sub": "user-uuid-v7",
  "role": "admin",
  "permissions": ["sites:read", "sites:write", "investigations:execute", ...],
  "iat": 1710000000,
  "exp": 1710003600
}
```

| 토큰 | 유효기간 | 저장 위치 |
|------|---------|----------|
| access_token | 1시간 | httpOnly cookie (프론트) / Authorization 헤더 |
| refresh_token | 7일 | httpOnly cookie / DB sessions 테이블 |

### 7.2 인증 흐름

```
1. POST /api/v1/auth/login → access_token + refresh_token 발급
2. 모든 API 요청 → Authorization: Bearer <access_token>
3. 토큰 만료 → POST /api/v1/auth/refresh → 새 access_token 발급
4. POST /api/v1/auth/logout → refresh_token 블랙리스트 등록 (Redis TTL)
```

### 7.3 로그인 보안

- **bcrypt** cost factor 12로 비밀번호 해싱
- **로그인 실패 카운터**: Redis TTL 15분, 5회 실패 시 계정 잠금
- **감사 로그**: 모든 로그인 시도 (성공/실패) 기록 (IP, User-Agent)

### 7.4 RBAC 권한 매트릭스

| 리소스 | ADMIN | OPERATOR | INVESTIGATOR | LEGAL |
|--------|-------|----------|-------------|-------|
| 사이트 CRUD | CRUD | CRUD | CRU | R |
| 채증 실행/취소 | O | O | O | X |
| 증거 조회 | O | O | O | O |
| 증거 다운로드 | O | O | O | X |
| 시스템 설정 | O | O | X | X |
| 사용자 관리 | O | X | X | X |
| 감사 로그 조회 | O | O | O (본인만) | X |
| 통계 조회 | O | O | O | O |
| 보고서 생성 | O | O | X | X |

---

## 8. 통신 패턴

### 8.1 Next.js ↔ FastAPI 프록시 패턴

```
[서버 컴포넌트 / API Route]                  [FastAPI]
         │                                       │
         │  fetch(FASTAPI_URL + '/api/v1/...')   │
         │ ────────────────────────────────────> │
         │                                       │
         │  JSON 응답                            │
         │ <──────────────────────────────────── │
         │                                       │
    [프론트엔드로 전달]

[클라이언트 (SSE만)]                         [FastAPI]
         │                                       │
         │  EventSource 직접 연결                │
         │ ────────────────────────────────────> │
         │  SSE 이벤트 스트림                     │
         │ <──────────────────────────────────── │
```

### 8.2 프론트엔드 API 클라이언트

```typescript
// frontend/src/lib/api-client.ts

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {};

  const res = await fetch(`${FASTAPI_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error);
  }

  return res.json();
}
```

### 8.3 기존 route.ts 프록시 전환 예시

```typescript
// frontend/src/app/api/sites/route.ts (변경 전: mock 데이터)
export async function GET(request: NextRequest) {
  // TODO: Phase 3 - FastAPI 연동
  const sites = mockSiteService.list(params);
  return apiPaginated(sites, pagination);
}

// frontend/src/app/api/sites/route.ts (변경 후: FastAPI 프록시)
export async function GET(request: NextRequest) {
  const token = getTokenFromCookie(request);
  const searchParams = request.nextUrl.searchParams.toString();
  const data = await apiFetch(`/api/v1/sites?${searchParams}`, { token });
  return NextResponse.json(data);
}
```

---

## 9. Phase별 구현 계획

### Phase 3-A: 기반 인프라 (1주)

> **목표**: FastAPI 서버가 기동되고, Supabase DB에 연결되고, 헬스 체크가 동작하는 상태

| Task | 내용 | 예상 소요 | 산출물 |
|------|------|---------|--------|
| **T-025** | FastAPI 프로젝트 초기화 | 2일 | `pyproject.toml`, `main.py`, `config.py`, CORS 설정 |
| **T-026** | SQLAlchemy 모델 작성 (21개) | 3일 | `models/*.py` (Prisma → SQLAlchemy 변환) |
| **T-027** | Alembic 마이그레이션 + Seed | 1일 | 초기 마이그레이션, 슈퍼어드민/기본설정 시드 |
| **T-028** | Docker Compose 로컬 환경 | 1일 | `docker-compose.yml` (FastAPI + Redis + MinIO) |

**검증**: `docker compose up` → `GET /api/v1/system/health` 200 OK → Supabase DB 연결 확인

---

### Phase 3-B: 인증 + CRUD API (1.5주)

> **목표**: 로그인하고 사이트 CRUD가 가능한 상태

| Task | 내용 | 예상 소요 | 산출물 |
|------|------|---------|--------|
| **T-029** | JWT 인증 시스템 | 3일 | `core/auth.py`, `core/security.py`, `api/v1/auth.py` |
| **T-030** | RBAC 권한 미들웨어 | 1일 | `core/permissions.py`, `api/deps.py` |
| **T-031** | 사이트 관리 API (7개) | 3일 | `api/v1/sites.py`, `services/site_service.py` |
| **T-032** | 사용자/설정/감사 API | 2일 | `api/v1/settings.py`, `services/audit_service.py` |
| **T-033** | 초기 설정 위저드 API | 1일 | `api/v1/setup.py` |

**검증**: POST /login → JWT → Bearer 토큰으로 GET /sites → RBAC 권한 동작 확인

---

### Phase 3-C: 채증/증거 API + 저장소 (2주)

> **목표**: 채증 작업 생성/관리, MinIO 파일 저장/다운로드가 가능한 상태

| Task | 내용 | 예상 소요 | 산출물 |
|------|------|---------|--------|
| **T-034** | 채증 관리 API (8개) | 3일 | `api/v1/investigations.py`, `services/investigation_service.py` |
| **T-035** | MinIO 저장소 연동 | 2일 | `core/storage.py`, presigned URL, WORM 모드 |
| **T-036** | 증거 관리 API (6개) | 3일 | `api/v1/evidence.py`, `services/evidence_service.py` |
| **T-037** | Celery + Redis 작업 큐 | 3일 | `tasks/celery_app.py`, `tasks/investigation_tasks.py` |
| **T-038** | SSE 실시간 스트리밍 | 1일 | `api/v1/investigations.py` SSE 엔드포인트 |

**검증**: POST /investigations → Celery 작업 생성 → 상태 변경 SSE 수신 → MinIO 파일 다운로드

---

### Phase 3-D: 채증 엔진 + AI (2주)

> **목표**: 실제 URL에 대해 1단계 채증(스크린샷 캡처)이 동작하는 상태

| Task | 내용 | 예상 소요 | 산출물 |
|------|------|---------|--------|
| **T-039** | 1단계 채증 엔진 | 5일 | `crawler/browser_pool.py`, `crawler/stage1.py` |
| **T-040** | 팝업/광고 자동 처리 | 1일 | `crawler/popup_handler.py` |
| **T-041** | 증거 무결성 (해시+타임스탬프) | 3일 | SHA-256 체인, OpenTimestamps, metadata.json |
| **T-042** | Claude Haiku AI 분류 | 3일 | `llm/classifier.py`, `api/v1/review.py` |
| **T-043** | 탐지 API (키워드/도메인) | 2일 | `api/v1/detection.py` (CRUD만, 실제 탐지는 Phase 4) |

**검증**: URL 입력 → 1단계 채증 실행 → 스크린샷 + HTML MinIO 저장 → SHA-256 해시 검증 → AI 분류 결과 확인

---

### Phase 3-E: 통계 + 프론트엔드 연동 (1주)

> **목표**: 프론트엔드가 실제 데이터로 동작하는 상태 (mock 데이터 제거)

| Task | 내용 | 예상 소요 | 산출물 |
|------|------|---------|--------|
| **T-044** | 통계/분석 API (5개) | 2일 | `api/v1/analytics.py`, `services/analytics_service.py` |
| **T-045** | 보고서 API (3개) | 1일 | `api/v1/reports.py` |
| **T-046** | 프론트엔드 API 클라이언트 | 1일 | `frontend/src/lib/api-client.ts` |
| **T-047** | route.ts 프록시 전환 (35개) | 3일 | 기존 mock → FastAPI fetch 호출로 교체 |

**검증**: Next.js 프론트에서 실제 DB 데이터로 대시보드/테이블 렌더링, `npm run build` 성공

---

### Phase 4: 고급 기능 (4~5주, 별도 계획 수립)

| 영역 | 내용 |
|------|------|
| 2/3단계 채증 | 회원가입(stage2), 배팅(stage3) 자동화 |
| SMS 자동화 | PVAPins → GrizzlySMS → SMS-Activate 폴백 체인 |
| CAPTCHA 풀이 | CapSolver / 2Captcha 연동 |
| 탐지 엔진 | Google Custom Search, Scrapy 크롤링 |
| 도메인 호핑 추적 | DNS/WHOIS 모니터링, 클러스터링 |
| 프록시 로테이션 | IPRoyal/SOAX 레지덴셜 프록시 |
| 실시간 모니터링 | WebSocket/SSE 대시보드 |
| 배포 최적화 | CI/CD, 모니터링(Flower), 로그 집중화 |

---

## 10. 로컬 개발 환경

### 10.1 Docker Compose

```yaml
# backend/docker-compose.yml
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./app:/app/app  # 핫 리로드
    depends_on:
      - redis
      - minio
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  celery-worker:
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    depends_on:
      - redis
    command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # 로컬 개발용 PostgreSQL (Supabase 대신 사용 가능)
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: gambleguard
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    volumes:
      - pg_data:/var/lib/postgresql/data
    profiles: ["local-db"]  # docker compose --profile local-db up

volumes:
  redis_data:
  minio_data:
  pg_data:
```

### 10.2 개발 명령어

```bash
# 백엔드 개발 환경 시작
cd backend
docker compose up -d redis minio     # 인프라만 기동
uv run uvicorn app.main:app --reload # FastAPI 로컬 실행

# 또는 전체 Docker 기동
docker compose up -d

# Celery 워커 실행
uv run celery -A app.tasks.celery_app worker --loglevel=info

# DB 마이그레이션
uv run alembic upgrade head          # 최신 마이그레이션 적용
uv run alembic revision --autogenerate -m "설명"  # 마이그레이션 생성

# 시드 데이터
uv run python scripts/seed.py

# 테스트
uv run pytest tests/ -v

# 프론트엔드 (별도 터미널)
cd frontend
npm run dev
```

---

## 11. 배포 전략

### 11.1 프로덕션 구성

```
┌─────────────────────────────────────────────────────┐
│  Vercel                                              │
│  ├── Next.js 15 프론트엔드                           │
│  ├── 환경변수: FASTAPI_URL=https://api.example.com  │
│  └── 자동 배포 (GitHub main 브랜치)                  │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  VPS (2vCPU, 4GB RAM 권장)                           │
│                                                      │
│  ├── Caddy (자동 HTTPS)                              │
│  │   └── api.example.com → localhost:8000            │
│  │                                                    │
│  ├── Docker Compose                                   │
│  │   ├── FastAPI (uvicorn, 2 workers)                │
│  │   ├── Celery Worker (1 worker, concurrency 4)     │
│  │   ├── Redis 7 (포트 6379, 내부만)                 │
│  │   └── MinIO (포트 9000/9001, 내부만)              │
│  │                                                    │
│  └── 외부 연결                                        │
│      └── Supabase PostgreSQL (SSL)                    │
└─────────────────────────────────────────────────────┘
```

### 11.2 추천 VPS 사양

| 항목 | 최소 | 권장 |
|------|------|------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 100 GB SSD (증거 파일) |
| 네트워크 | 1 Gbps | 1 Gbps |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### 11.3 추천 VPS 제공업체

| 제공업체 | 4GB 월 비용 | 비고 |
|---------|------------|------|
| Hetzner Cloud | ~€7 | 유럽 데이터센터, 가성비 최고 |
| Vultr | ~$24 | 한국/일본 리전 |
| DigitalOcean | ~$24 | 안정적, 관리형 DB 옵션 |
| Oracle Cloud | 무료 (ARM) | Always Free Tier 4 OCPU/24GB |

---

## 12. 환경 변수 명세

### 12.1 백엔드 (.env)

```bash
# ─── 데이터베이스 ───────────────────────────────────────
# Supabase PostgreSQL (비동기 드라이버)
DATABASE_URL=postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
# Alembic 마이그레이션용 (동기 드라이버)
SYNC_DATABASE_URL=postgresql+psycopg2://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ─── Redis ──────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0

# ─── 인증 ──────────────────────────────────────────────
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── MinIO (파일 저장소) ────────────────────────────────
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=evidence
MINIO_REGION=us-east-1

# ─── Claude AI API ─────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-xxx
CLAUDE_HAIKU_MODEL=claude-haiku-4-5-20251001
CLAUDE_SONNET_MODEL=claude-sonnet-4-6

# ─── SMS 인증 서비스 ───────────────────────────────────
PVAPINS_API_KEY=
GRIZZLYSMS_API_KEY=
SMS_ACTIVATE_API_KEY=

# ─── CAPTCHA 풀이 ──────────────────────────────────────
CAPSOLVER_API_KEY=
TWOCAPTCHA_API_KEY=

# ─── 프록시 ────────────────────────────────────────────
PROXY_HOST=
PROXY_PORT=
PROXY_USERNAME=
PROXY_PASSWORD=

# ─── Google Custom Search ──────────────────────────────
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CX=

# ─── 알림 ──────────────────────────────────────────────
SLACK_WEBHOOK_URL=
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_TO=

# ─── 애플리케이션 ─────────────────────────────────────
APP_ENV=development
APP_DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

### 12.2 프론트엔드 (추가 환경변수)

```bash
# Vercel 환경변수 설정
FASTAPI_URL=http://localhost:8000       # 로컬 개발
# FASTAPI_URL=https://api.example.com  # 프로덕션
```

---

## 13. 검증 및 테스트 전략

### 13.1 Phase별 검증 체크리스트

| Phase | 검증 항목 | 명령어/방법 |
|-------|----------|------------|
| **3-A** | FastAPI 서버 기동 | `curl http://localhost:8000/api/v1/system/health` → 200 |
| **3-A** | Supabase DB 연결 | health 응답에 `"database": "connected"` 포함 |
| **3-A** | Alembic 마이그레이션 | `alembic upgrade head` 성공 |
| **3-B** | JWT 로그인 | POST /login → access_token 발급 |
| **3-B** | RBAC 동작 | viewer 토큰으로 POST /sites → 403 |
| **3-B** | 사이트 CRUD | GET/POST/PATCH/DELETE /sites 전체 동작 |
| **3-C** | 채증 생성 | POST /investigations → Celery 작업 등록 |
| **3-C** | MinIO 업/다운로드 | 파일 업로드 → presigned URL 다운로드 |
| **3-C** | SSE 스트리밍 | EventSource 연결 → 상태 변경 이벤트 수신 |
| **3-D** | 1단계 채증 | URL 입력 → 스크린샷 + HTML 캡처 |
| **3-D** | 해시 검증 | 증거 파일 SHA-256 해시 체인 검증 통과 |
| **3-D** | AI 분류 | 캡처된 스크린샷 → Claude Haiku 분류 결과 |
| **3-E** | 프론트엔드 연동 | 대시보드에서 실제 DB 데이터 렌더링 |
| **3-E** | 빌드 성공 | `npm run build` (프론트), `pytest` (백엔드) |

### 13.2 테스트 도구

```python
# backend/tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

# 사용 예시
async def test_health(client):
    response = await client.get("/api/v1/system/health")
    assert response.status_code == 200
```

---

## 핵심 참조 파일

| 파일 | 용도 | 활용 Phase |
|------|------|-----------|
| `prisma/schema.prisma` | SQLAlchemy 모델 변환 원본 (21개 모델) | 3-A |
| `frontend/src/types/api.ts` | Pydantic 스키마 변환 원본 (49개 DTO) | 3-A ~ 3-E |
| `frontend/src/types/enums.ts` | Python Enum 변환 원본 (18개) | 3-A |
| `frontend/src/types/domain.ts` | 도메인 모델 참조 | 3-A |
| `docs/PRD-sections/07-api-specification.md` | API 상세 명세 (49개) | 3-B ~ 3-E |
| `docs/PRD-sections/08-data-model.md` | 데이터 모델 상세 명세 | 3-A |
| `frontend/src/app/api/sites/route.ts` | 프록시 전환 패턴 참조 | 3-E |
| `frontend/src/server/mock/` | mock 데이터/서비스 (교체 대상) | 3-E |
| `docs/ROADMAP.md` | 전체 개발 로드맵 | 전체 |
