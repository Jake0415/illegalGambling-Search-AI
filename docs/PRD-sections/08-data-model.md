# 3.8 데이터베이스 데이터 모델 요구사항

> 작성일: 2026-03-14
> 문서 버전: 1.0
> 참조: service-concept.md, consolidated-report.md, decisions.md, 02-evidence-collection-engine.md, 03-sms-authentication.md, 04-evidence-integrity.md, 05-detection-engine.md

---

## 개요

본 섹션은 불법 도박 사이트 자동 검색/채증 시스템의 전체 데이터베이스 스키마를 정의한다. PostgreSQL 16을 주 데이터베이스로, SQLAlchemy 2.x ORM으로 스키마를 관리하며, Alembic으로 마이그레이션을 관리한다. Redis 7(Celery)을 캐시/큐 저장소로, MinIO(boto3 SDK)를 파일 저장소로 사용한다.

### 설계 원칙

| 원칙 | 설명 |
|------|------|
| **UUID v7 기본 키** | 모든 테이블의 PK는 UUID v7을 사용한다. 시간순 정렬이 가능하고 분산 환경에서 충돌이 없다. |
| **네이밍 컨벤션** | DB 컬럼명과 SQLAlchemy 모델 필드명 모두 `snake_case`를 사용한다. 필요 시 `Column(name="custom_name")` 패턴으로 커스텀 매핑한다. |
| **소프트 삭제 패턴** | 데이터 삭제 시 물리적 삭제 대신 `deleted_at` 필드에 삭제 시각을 기록한다. 증거 관련 데이터는 법적 보존 의무에 따라 소프트 삭제만 허용한다. |
| **감사 필드** | 모든 테이블에 `created_at`, `updated_at` 필드를 포함한다. 변경 이력 추적이 필요한 테이블에는 `deleted_at`을 추가한다. |
| **JSON 필드 활용** | 구조가 유동적인 부가 정보(WHOIS, DNS, 브라우저 핑거프린트 등)는 PostgreSQL `JSONB` 타입(`Column(JSONB)`)으로 저장하여 스키마 유연성을 확보한다. |
| **Enum 타입 정의** | 상태값, 카테고리 등 고정 선택지는 Python `enum.Enum` + SQLAlchemy `Enum` 타입으로 정의하여 타입 안전성을 보장한다. |
| **관계 무결성** | 외래 키 제약조건을 적용하고, `ForeignKey(ondelete=...)` 정책을 명시한다. 증거 데이터는 `RESTRICT`, 부가 데이터는 `CASCADE` 또는 `SET NULL`을 적용한다. |
| **인덱스 전략** | 자주 조회되는 컬럼에 단일/복합 인덱스를 정의하고, 대용량 테이블은 날짜 기반 파티셔닝을 적용한다. |

### 기술 스택

| 구성 요소 | 기술 | 버전 | 용도 |
|-----------|------|------|------|
| 데이터베이스 | PostgreSQL | 16 | 주 데이터 저장소 |
| ORM | SQLAlchemy + Alembic | 2.x | 스키마 관리, 마이그레이션, 비동기 세션 지원 |
| 캐시/큐 | Redis | 7.x | Celery 작업 큐, 세션 캐시, 실시간 상태 관리 |
| 파일 저장소 | MinIO (boto3 SDK) | - | 증거 파일(스크린샷, HTML, WARC) 저장 |
| 인증 | FastAPI JWT (python-jose) | - | 사용자 인증, 토큰 관리 |

### SQLAlchemy 모델 공통 패턴

> 아래 Prisma 스키마는 참조용이며, 실제 구현은 SQLAlchemy 모델로 전환 예정이다.

```python
# app/models/base.py -- SQLAlchemy 공통 설정
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
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

# 소프트 삭제 패턴 예시
class Example(TimestampMixin, Base):
    __tablename__ = "examples"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid7()))
    # ... 필드들
```

<details>
<summary>참조: 원본 Prisma 스키마 (마이그레이션 참고용)</summary>

```prisma
// prisma/schema.prisma 공통 설정
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 소프트 삭제 패턴 예시
model Example {
  id        String    @id @default(uuid(7))
  // ... 필드들
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("examples")
}
```

</details>

---

## A. 핵심 엔티티 (Phase 1)

### 스키마: sites

```prisma
enum SiteStatus {
  ACTIVE
  INACTIVE
  CLOSED
  MONITORING
}

enum SiteCategory {
  SPORTS_BETTING
  HORSE_RACING
  CASINO
  OTHER_GAMBLING
  NON_GAMBLING
}

model Site {
  id              String       @id @default(uuid(7))
  url             String       @unique
  domain          String
  status          SiteStatus   @default(ACTIVE)
  category        SiteCategory?
  confidenceScore Float?       @map("confidence_score")
  firstDetectedAt DateTime     @default(now()) @map("first_detected_at")
  lastCheckedAt   DateTime?    @map("last_checked_at")
  tags            Json?        @default("[]")
  whoisData       Json?        @map("whois_data")
  dnsRecords      Json?        @map("dns_records")
  notes           String?

  investigations       Investigation[]
  detectionResults     DetectionResult[]
  classificationResults ClassificationResult[]
  domainHistory        DomainHistory[]
  popupPatterns        PopupPattern[]
  siteDomainClusters   SiteDomainCluster[]

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@index([domain])
  @@index([status])
  @@index([category])
  @@index([confidenceScore])
  @@index([firstDetectedAt])
  @@map("sites")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-001** | sites 엔티티 정의 | 불법 도박 사이트의 기본 정보를 저장하는 핵심 테이블을 정의한다. 사이트 URL, 도메인, 운영 상태, 카테고리 분류, AI 신뢰도 점수, 최초 탐지 시각, WHOIS/DNS 부가 정보를 포함한다. 모든 채증, 탐지, 분류 결과의 기준 엔티티로, 시스템 전반의 데이터 관계 중심점이 된다. | P0 | Phase 1 | 1. `id`는 UUID v7 형식의 PK이다 2. `url`은 유니크 제약조건이 적용되어 동일 URL 중복 등록이 불가하다 3. `domain`은 URL에서 추출한 도메인명이며 인덱스가 적용된다 4. `status`는 `ACTIVE`, `INACTIVE`, `CLOSED`, `MONITORING` 4가지 enum 값만 허용된다 5. `category`는 `SPORTS_BETTING`, `HORSE_RACING`, `CASINO`, `OTHER_GAMBLING`, `NON_GAMBLING` 5가지 enum 값만 허용되며 nullable이다 6. `confidence_score`는 0.0~1.0 범위의 부동소수점이며 AI 분류 신뢰도를 저장한다 7. `tags`, `whois_data`, `dns_records`는 JSON 타입으로 구조 유연성을 확보한다 8. `deleted_at`이 null이 아닌 레코드는 조회 시 기본적으로 제외된다 (소프트 삭제) 9. `created_at`은 레코드 생성 시 자동 설정, `updated_at`은 수정 시 자동 갱신된다 | PostgreSQL 16, SQLAlchemy `UniqueConstraint`, `Index`, `Column(JSONB)` 타입으로 WHOIS/DNS 저장. URL 정규화는 Python `urllib.parse` + 커스텀 정규화 로직으로 저장 전 수행. |

### 스키마: investigations

```prisma
enum InvestigationStatus {
  QUEUED
  IN_PROGRESS
  STAGE_1_COMPLETE
  STAGE_2_COMPLETE
  STAGE_3_COMPLETE
  COMPLETED
  FAILED
  CANCELLED
}

model Investigation {
  id                 String              @id @default(uuid(7))
  siteId             String              @map("site_id")
  status             InvestigationStatus @default(QUEUED)
  currentStage       Int                 @default(1) @map("current_stage")
  startedAt          DateTime?           @map("started_at")
  completedAt        DateTime?           @map("completed_at")
  errorMessage       String?             @map("error_message")
  retryCount         Int                 @default(0) @map("retry_count")
  scheduledAt        DateTime?           @map("scheduled_at")
  proxyUsed          String?             @map("proxy_used")
  browserFingerprint Json?               @map("browser_fingerprint")
  createdById        String?             @map("created_by")

  site          Site           @relation(fields: [siteId], references: [id], onDelete: RESTRICT)
  createdBy     User?          @relation(fields: [createdById], references: [id], onDelete: SET_NULL)
  evidenceFiles EvidenceFile[]
  smsNumbers    SmsNumber[]
  manualInterventions ManualInterventionQueue[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([siteId])
  @@index([status])
  @@index([createdById])
  @@index([scheduledAt])
  @@index([status, scheduledAt])
  @@map("investigations")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-002** | investigations 엔티티 정의 | 채증 세션(조사 작업 단위)을 관리하는 테이블을 정의한다. 하나의 사이트에 대해 여러 채증 세션이 실행될 수 있으며, 각 세션은 1~3단계 파이프라인을 순차 진행한다. 세션 상태, 현재 단계, 시작/완료 시각, 에러 정보, 재시도 횟수, 프록시/핑거프린트 정보를 기록한다. BullMQ 작업 큐와 연동하여 스케줄링 및 병렬 처리를 지원한다. | P0 | Phase 1 | 1. `site_id`는 sites 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 (사이트가 삭제되면 채증 세션도 보존) 2. `status`는 `QUEUED`, `IN_PROGRESS`, `STAGE_1_COMPLETE`, `STAGE_2_COMPLETE`, `STAGE_3_COMPLETE`, `COMPLETED`, `FAILED`, `CANCELLED` 8가지 enum 값을 지원한다 3. `current_stage`는 1, 2, 3 값만 허용되며 현재 진행 중인 채증 단계를 나타낸다 4. `retry_count`는 0 이상의 정수이며 최대 3회 재시도를 추적한다 5. `browser_fingerprint`는 JSON으로 viewport, 언어, 타임존, User-Agent 등을 저장한다 6. `created_by`는 users 테이블의 FK이며 수동 채증 요청 시 요청자를 기록한다 7. `status`와 `scheduled_at`에 복합 인덱스가 적용되어 큐 폴링 성능을 보장한다 | SQLAlchemy `relationship()`, Celery 작업 ID와 investigation ID 매핑, 상태 머신 패턴으로 status 전이 관리. `browser_fingerprint`는 playwright-stealth 핑거프린트 결과를 JSONB로 저장. |

### 스키마: evidence_files

```prisma
enum EvidenceFileType {
  SCREENSHOT
  HTML
  WARC
  NETWORK_LOG
  WHOIS
  METADATA
  SINGLEFILE
}

model EvidenceFile {
  id               String          @id @default(uuid(7))
  investigationId  String          @map("investigation_id")
  fileType         EvidenceFileType @map("file_type")
  stage            Int
  filePath         String          @map("file_path")
  fileSize         BigInt          @map("file_size")
  mimeType         String          @map("mime_type")
  sha256Hash       String          @map("sha256_hash")
  originalFilename String?         @map("original_filename")
  description      String?

  investigation Investigation @relation(fields: [investigationId], references: [id], onDelete: RESTRICT)
  hashRecords   HashRecord[]
  timestamps    Timestamp[]

  createdAt DateTime @default(now()) @map("created_at")

  @@index([investigationId])
  @@index([fileType])
  @@index([sha256Hash])
  @@map("evidence_files")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-003** | evidence_files 엔티티 정의 | 채증 과정에서 생성되는 모든 증거 파일의 메타데이터를 관리하는 테이블을 정의한다. 스크린샷, HTML, WARC, 네트워크 로그, WHOIS, 메타데이터, SingleFile 등 파일 유형별로 기록하며, 각 파일의 S3/MinIO 저장 경로, 파일 크기, MIME 타입, SHA-256 해시값을 저장한다. 실제 파일은 S3/MinIO에 저장하고 DB에는 경로와 메타정보만 보관한다. | P0 | Phase 1 | 1. `investigation_id`는 investigations 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `file_type`은 `SCREENSHOT`, `HTML`, `WARC`, `NETWORK_LOG`, `WHOIS`, `METADATA`, `SINGLEFILE` 7가지 enum 값을 지원한다 3. `stage`는 1, 2, 3 값으로 해당 파일이 어떤 채증 단계에서 생성되었는지 기록한다 4. `file_path`는 S3/MinIO 내 객체 키(예: `evidence/{siteId}/{investigationId}/stage-1/screenshot.png`)이다 5. `sha256_hash`는 64자 hex 문자열이며 파일 생성 즉시 계산하여 저장한다 6. `file_size`는 BigInt로 대용량 WARC 파일도 수용한다 7. `sha256_hash`에 인덱스가 적용되어 해시 기반 무결성 검증이 빠르게 수행된다 8. `created_at`만 존재하고 `updated_at`은 없다 (증거 파일 메타데이터는 불변) | MinIO SDK (boto3 `s3` client), Python `hashlib.sha256()`. 파일 경로 규칙: `evidence/{siteId}/{investigationId}/stage-{n}/{filename}`. MIME 타입은 Python `mimetypes` 모듈로 자동 탐지. |

---

## B. 증거 무결성 (Phase 1-2)

### 스키마: hash_records, timestamps

```prisma
enum HashAlgorithm {
  SHA256
}

enum VerificationStatus {
  PENDING
  VALID
  INVALID
}

model HashRecord {
  id               String             @id @default(uuid(7))
  evidenceFileId   String             @map("evidence_file_id")
  algorithm        HashAlgorithm      @default(SHA256)
  hashValue        String             @map("hash_value")
  verifiedAt       DateTime?          @map("verified_at")
  verificationStatus VerificationStatus @default(PENDING) @map("verification_status")

  evidenceFile EvidenceFile @relation(fields: [evidenceFileId], references: [id], onDelete: RESTRICT)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([evidenceFileId])
  @@index([hashValue])
  @@index([verificationStatus])
  @@map("hash_records")
}

enum TimestampType {
  OPENTIMESTAMPS
  RFC3161
}

model Timestamp {
  id                 String             @id @default(uuid(7))
  evidenceFileId     String             @map("evidence_file_id")
  type               TimestampType
  timestampValue     DateTime           @map("timestamp_value")
  proofFilePath      String?            @map("proof_file_path")
  verifiedAt         DateTime?          @map("verified_at")
  verificationStatus VerificationStatus @default(PENDING) @map("verification_status")

  evidenceFile EvidenceFile @relation(fields: [evidenceFileId], references: [id], onDelete: RESTRICT)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([evidenceFileId])
  @@index([type])
  @@index([verificationStatus])
  @@map("timestamps")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-004** | hash_records 엔티티 정의 | 증거 파일의 해시 검증 이력을 관리하는 테이블을 정의한다. 증거 파일 생성 시 SHA-256 해시를 계산하여 기록하고, 이후 무결성 검증 시 재계산한 해시와 비교한 결과를 저장한다. 해시 불일치 시 `INVALID` 상태로 표시하여 증거 위변조를 탐지한다. | P0 | Phase 1 | 1. `evidence_file_id`는 evidence_files 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `algorithm`은 현재 `SHA256`만 지원하며 향후 알고리즘 확장을 위해 enum으로 정의한다 3. `hash_value`는 64자 hex 문자열(SHA-256 결과)이다 4. `verification_status`는 `PENDING`(미검증), `VALID`(검증 통과), `INVALID`(해시 불일치) 3가지 상태를 지원한다 5. `verified_at`은 검증 수행 시각을 기록하며, 미검증 시 null이다 6. 동일 증거 파일에 대해 여러 검증 이력이 기록될 수 있다 (1:N 관계) 7. `hash_value`에 인덱스가 적용되어 해시 기반 조회가 가능하다 | Python `hashlib.sha256()`, 스트리밍 해시 계산. 검증 API: 파일을 MinIO에서 읽어 해시 재계산 후 DB 기록값과 비교. |
| **FR-DM-005** | timestamps 엔티티 정의 | 증거 파일에 적용된 타임스탬프 정보를 관리하는 테이블을 정의한다. OpenTimestamps(비트코인 블록체인)와 RFC 3161(PKI TSA) 두 가지 타임스탬프 유형을 지원하며, 각 타임스탬프의 증명 파일(.ots 또는 .tsr) 경로와 검증 상태를 저장한다. 이중 타임스탬프를 통해 증거의 존재 시점을 법적으로 입증한다. | P0 | Phase 1 (OTS) / Phase 2 (RFC 3161) | 1. `evidence_file_id`는 evidence_files 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `type`은 `OPENTIMESTAMPS`와 `RFC3161` 2가지 enum 값을 지원한다 3. `timestamp_value`는 타임스탬프가 증명하는 시각(UTC)이다 4. `proof_file_path`는 S3/MinIO 내 증명 파일 경로이다 (`.ots` 또는 `.tsr`/`.tst` 파일) 5. `verification_status`는 `PENDING`(확인 대기), `VALID`(검증 통과), `INVALID`(검증 실패)이다 6. OpenTimestamps의 경우 비트코인 블록 확인까지 1~2시간 소요되므로 초기에는 `PENDING`이다 7. 하나의 증거 파일에 OTS와 RFC3161 타임스탬프가 각각 생성될 수 있다 | `opentimestamps` CLI/Python 클라이언트, 자체 구현 RFC 3161 TSA 클라이언트. OTS 캘린더 서버: `a.pool.opentimestamps.org`. RFC 3161 TSA 서버: FreeTSA.org (1순위), DigiCert (폴백). |

### 스키마: audit_logs

```prisma
enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  DOWNLOAD
  VERIFY
  EXPORT
}

model AuditLog {
  id         String      @id @default(uuid(7))
  entityType String      @map("entity_type")
  entityId   String      @map("entity_id")
  action     AuditAction
  actorId    String?     @map("actor_id")
  actorIp    String?     @map("actor_ip")
  details    Json?
  prevHash   String?     @map("prev_hash")

  actor User? @relation(fields: [actorId], references: [id], onDelete: SET_NULL)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([entityType, entityId])
  @@index([actorId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-006** | audit_logs 엔티티 정의 | 시스템 전체의 감사 추적(Chain of Custody)을 위한 감사 로그 테이블을 정의한다. 모든 엔티티에 대한 CRUD 작업, 증거 다운로드, 검증, 내보내기 이벤트를 기록한다. 감사 로그는 append-only로 운영되며, 해시 체인(`prev_hash`)을 통해 로그 자체의 무결성을 보장한다. 법적 증거의 Chain of Custody 요건(대검찰청 예규)을 충족하는 핵심 테이블이다. | P0 | Phase 1 | 1. `entity_type`은 대상 테이블명(예: `Site`, `Investigation`, `EvidenceFile`)을 문자열로 저장한다 2. `entity_id`는 대상 레코드의 UUID를 저장한다 3. `action`은 `CREATE`, `READ`, `UPDATE`, `DELETE`, `DOWNLOAD`, `VERIFY`, `EXPORT` 7가지 enum 값을 지원한다 4. `actor_id`는 users 테이블의 FK이며, 시스템 자동 작업 시 null이 가능하다 5. `actor_ip`는 요청자의 IP 주소를 기록한다 6. `details`는 JSON으로 변경 전후 값, 추가 컨텍스트를 저장한다 7. `prev_hash`는 직전 로그 레코드의 SHA-256 해시이며 해시 체인을 구성한다 8. audit_logs 테이블에 대한 UPDATE/DELETE 권한은 PostgreSQL 레벨에서 `REVOKE`한다 (INSERT-only) 9. `entity_type + entity_id` 복합 인덱스로 특정 엔티티의 전체 이력 조회가 가능하다 10. `created_at`에 인덱스를 적용하여 시간순 조회 성능을 보장한다 | PostgreSQL `REVOKE UPDATE, DELETE ON audit_logs FROM app_user`. 해시 체인: 각 INSERT 시 직전 레코드의 해시를 계산하여 `prev_hash`에 저장. Next.js API 미들웨어에서 자동 로깅. 날짜 기반 파티셔닝 적용 대상 (FR-DM-020 참조). |

---

## C. SMS 인증 (Phase 2)

### 스키마: sms_numbers, sms_messages

```prisma
enum SmsProvider {
  PVAPINS
  GRIZZLYSMS
  SMS_ACTIVATE
  MANUAL
}

enum SmsNumberStatus {
  ACTIVE
  USED
  EXPIRED
  BLOCKED
}

model SmsNumber {
  id              String          @id @default(uuid(7))
  phoneNumber     String          @map("phone_number")
  countryCode     String          @default("+82") @map("country_code")
  provider        SmsProvider
  status          SmsNumberStatus @default(ACTIVE)
  investigationId String?         @map("investigation_id")
  assignedAt      DateTime?       @map("assigned_at")
  expiredAt       DateTime?       @map("expired_at")
  costUsd         Decimal?        @map("cost_usd") @db.Decimal(10, 4)

  investigation Investigation? @relation(fields: [investigationId], references: [id], onDelete: SET_NULL)
  smsMessages   SmsMessage[]

  createdAt DateTime @default(now()) @map("created_at")

  @@index([phoneNumber])
  @@index([provider])
  @@index([status])
  @@index([investigationId])
  @@map("sms_numbers")
}

model SmsMessage {
  id          String   @id @default(uuid(7))
  smsNumberId String   @map("sms_number_id")
  messageText String   @map("message_text")
  otpCode     String?  @map("otp_code")
  receivedAt  DateTime @map("received_at")
  parsedAt    DateTime? @map("parsed_at")

  smsNumber SmsNumber @relation(fields: [smsNumberId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([smsNumberId])
  @@index([receivedAt])
  @@map("sms_messages")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-007** | sms_numbers 엔티티 정의 | SMS 인증에 사용되는 가상 전화번호를 관리하는 테이블을 정의한다. PVAPins(Non-VoIP 1순위), GrizzlySMS, SMS-Activate, 수동 입력 등 제공 업체별로 발급받은 번호의 상태(활성/사용완료/만료/차단), 할당된 채증 세션, 비용을 추적한다. 가상번호 사용 이력은 감사 로그에도 기록되어 법적 적합성 검토에 활용된다. | P1 | Phase 2 | 1. `phone_number`는 국가코드 포함 형식(예: `01012345678`)으로 저장한다 2. `country_code`는 기본값 `+82`(대한민국)이다 3. `provider`는 `PVAPINS`, `GRIZZLYSMS`, `SMS_ACTIVATE`, `MANUAL` 4가지 enum 값을 지원한다 4. `status`는 `ACTIVE`(발급 대기/사용 중), `USED`(인증 완료), `EXPIRED`(유효기간 만료), `BLOCKED`(차단됨) 4가지 상태를 지원한다 5. `investigation_id`는 해당 번호가 할당된 채증 세션의 FK이며, 미할당 시 null이다 6. `cost_usd`는 Decimal 타입(10,4)으로 건당 비용을 USD 기준 소수점 4자리까지 저장한다 7. `expired_at`은 SMS 서비스 업체의 번호 유효기간을 기록한다 8. 번호 발급/사용/만료 이벤트가 audit_logs에 자동 기록된다 | PVAPins REST API, GrizzlySMS API, SMS-Activate API. 번호 발급 시 `assignedAt` 설정, 인증 완료 시 `status` = `USED`로 전환. 비용 추적: 월간 비용 집계 쿼리 제공. |
| **FR-DM-008** | sms_messages 엔티티 정의 | 가상번호로 수신된 SMS 메시지를 저장하고 OTP 코드를 파싱하여 기록하는 테이블을 정의한다. 메시지 원문, 파싱된 OTP 코드, 수신 시각, 파싱 시각을 관리한다. 하나의 가상번호에 여러 SMS가 수신될 수 있으며, OTP 코드 추출은 정규표현식 기반으로 자동 수행된다. | P1 | Phase 2 | 1. `sms_number_id`는 sms_numbers 테이블의 FK이며 CASCADE 삭제 정책이 적용된다 2. `message_text`는 수신된 SMS 원문 전체를 저장한다 3. `otp_code`는 메시지에서 파싱한 인증코드(4~8자리 숫자)이며, 파싱 실패 시 null이다 4. `received_at`은 SMS 수신 시각(UTC)이다 5. `parsed_at`은 OTP 코드 파싱 완료 시각이며, 파싱 전에는 null이다 6. 동일 번호에 대해 시간순으로 복수의 메시지가 기록될 수 있다 7. `sms_number_id`와 `received_at`에 인덱스가 적용된다 | SMS 수신: 각 서비스 API 폴링(polling) 방식. OTP 파싱: 정규표현식 `/(\d{4,8})/` 매칭. SMS 원문에서 한국어 인증코드 패턴 탐지 (예: "인증번호", "확인코드"). |

---

## D. CAPTCHA/수동 개입 (Phase 2)

### 스키마: manual_intervention_queue

```prisma
enum InterventionType {
  CAPTCHA
  OTP
  UNKNOWN_FORM
}

enum InterventionStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  EXPIRED
}

model ManualInterventionQueue {
  id               String             @id @default(uuid(7))
  investigationId  String             @map("investigation_id")
  type             InterventionType
  status           InterventionStatus @default(PENDING)
  cdpSessionUrl    String?            @map("cdp_session_url")
  screenshotPath   String?            @map("screenshot_path")
  assignedToId     String?            @map("assigned_to")
  resolvedAt       DateTime?          @map("resolved_at")
  resolutionNotes  String?            @map("resolution_notes")

  investigation Investigation @relation(fields: [investigationId], references: [id], onDelete: RESTRICT)
  assignedTo    User?         @relation("AssignedInterventions", fields: [assignedToId], references: [id], onDelete: SET_NULL)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([investigationId])
  @@index([status])
  @@index([type])
  @@index([assignedToId])
  @@index([status, createdAt])
  @@map("manual_intervention_queue")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-009** | manual_intervention_queue 엔티티 정의 | 자동 채증 과정에서 CAPTCHA, OTP, 미지 폼 등 자동화가 실패한 경우 담당자의 수동 개입을 요청하고 관리하는 큐 테이블을 정의한다. CDP WebSocket 세션 URL을 통해 원격 브라우저에 접속하여 수동 풀이가 가능하며, 대기/진행/해결/만료 상태를 추적한다. Slack/웹 푸시 알림과 연동하여 5분 이내 응답을 목표로 한다. | P1 | Phase 2 | 1. `investigation_id`는 investigations 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `type`은 `CAPTCHA`(CAPTCHA 풀이 필요), `OTP`(SMS OTP 수동 입력 필요), `UNKNOWN_FORM`(미지 폼 탐지 실패) 3가지 enum 값을 지원한다 3. `status`는 `PENDING`(대기), `IN_PROGRESS`(담당자 작업 중), `RESOLVED`(해결 완료), `EXPIRED`(타임아웃 만료) 4가지 상태를 지원한다 4. `cdp_session_url`은 `ws://host:9222/devtools/page/{id}` 형식의 CDP WebSocket URL이다 5. `screenshot_path`는 수동 개입 요청 시점의 브라우저 스크린샷 S3 경로이다 6. `assigned_to`는 수동 개입을 담당하는 사용자의 FK이며, 미할당 시 null이다 7. `status + created_at` 복합 인덱스로 대기 시간 기준 정렬이 가능하다 8. `PENDING` 상태에서 5분 경과 시 자동으로 `EXPIRED`로 전환된다 (Celery 딜레이 작업) 9. 상태 변경 시 audit_logs에 자동 기록된다 | CDP `--remote-debugging-port=9222`, WebSocket 프록시를 통한 브라우저 스트리밍. Slack Incoming Webhook + Web Push API로 알림 발송. `status` 전이: PENDING -> IN_PROGRESS -> RESOLVED 또는 PENDING -> EXPIRED. |

---

## E. 탐지 엔진 (Phase 2-3)

### 스키마: keywords, detection_results, classification_results

```prisma
enum KeywordLayer {
  DIRECT       // Layer 1: 직접 도박 용어 (토토, 바카라)
  BAIT         // Layer 2: 미끼 키워드 (무료 스포츠 중계)
  VERIFICATION // Layer 3: 검증/신뢰 (먹튀검증, 안전놀이터)
  COMMUNITY    // Layer 4: 커뮤니티 은어 (꽁머니, 충환전)
  SEASONAL     // Layer 5: 시즌 이벤트 (월드컵+베팅)
}

enum BaitSubtype {
  FREE_STREAMING  // 무료 스트리밍 유형
  SEO_SPAM        // SEO 기생 유형
  POPUP_REDIRECT  // 팝업/리디렉트 유형
  SOCIAL_MEDIA    // SNS 홍보 유형
}

enum KeywordSource {
  MANUAL          // 관리자 수동 등록
  AI_GENERATED    // Claude AI 확장
  META_EXTRACTED  // 크롤링 메타태그 추출
  AUTOCOMPLETE    // Naver/Google 자동완성
  COMMUNITY_MENTION // 커뮤니티/SNS 발견
}

enum EffectivenessTag {
  HIGH_EFFICIENCY  // 정밀도 70%+
  LOW_EFFICIENCY   // 정밀도 30%-
  SEASONAL         // 시즌성 키워드
  NEW              // 신규 (평가 중)
}

enum VariantType {
  CHOSUNG      // 초성 (ㅌㅌ = 토토)
  TYPO         // 의도적 오타 (토1토, t0t0)
  MIXED_LANG   // 한영 혼합 (카sino)
  CHAR_REPLACE // 숫자/특수문자 치환 (8카라)
  MORPHEME     // 형태소 분해 (사설+토토+사이트)
}

enum CandidateStatus {
  PENDING
  APPROVED
  REJECTED
}

enum KeywordSiteLinkType {
  SEARCH_RESULT  // 검색 결과에서 발견
  REDIRECT       // 리디렉트로 연결
  POPUP          // 팝업 광고
  AD_CLICK       // 광고 클릭
  META_TAG       // 메타태그에서 발견
}

model Keyword {
  id             String   @id @default(uuid(7))
  keyword        String
  category       String?
  isActive       Boolean  @default(true) @map("is_active")
  detectionCount Int      @default(0) @map("detection_count")
  createdById    String?  @map("created_by")

  // 다층 분류 (FR-DE-036, 037)
  layer          KeywordLayer   @default(DIRECT)
  baitSubtype    BaitSubtype?   @map("bait_subtype")    // Layer 2 전용

  // 효과성 추적 (FR-DE-044, 045)
  precision          Float?    // TP / (TP + FP)
  truePositiveCount  Int       @default(0) @map("true_positive_count")
  falsePositiveCount Int       @default(0) @map("false_positive_count")
  lastUsedAt         DateTime? @map("last_used_at")
  apiCallCount       Int       @default(0) @map("api_call_count")
  costPerDetection   Float?    @map("cost_per_detection")

  // 키워드 계층 (시드-파생 관계)
  parentKeywordId String?  @map("parent_keyword_id")
  source          KeywordSource @default(MANUAL)
  effectivenessTag EffectivenessTag? @map("effectiveness_tag")

  createdBy       User?            @relation(fields: [createdById], references: [id], onDelete: SET_NULL)
  parentKeyword   Keyword?         @relation("KeywordHierarchy", fields: [parentKeywordId], references: [id])
  childKeywords   Keyword[]        @relation("KeywordHierarchy")
  detectionResults DetectionResult[]
  variants        KeywordVariant[]
  siteLinks       KeywordSiteLink[]
  weeklyStats     KeywordWeeklyStats[]
  eventGroups     KeywordEventGroup[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([keyword])
  @@index([category])
  @@index([isActive])
  @@index([layer])
  @@index([precision])
  @@map("keywords")
}

model KeywordVariant {
  id              String      @id @default(uuid(7))
  keywordId       String      @map("keyword_id")
  variantText     String      @map("variant_text")
  variantType     VariantType @map("variant_type")
  isAutoGenerated Boolean     @default(true) @map("is_auto_generated")
  detectionCount  Int         @default(0) @map("detection_count")

  keyword Keyword @relation(fields: [keywordId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([keywordId])
  @@index([variantText])
  @@index([variantType])
  @@map("keyword_variants")
}

model KeywordCandidate {
  id                String          @id @default(uuid(7))
  keyword           String
  suggestedLayer    KeywordLayer    @map("suggested_layer")
  suggestedCategory String?         @map("suggested_category")
  source            String          // META_EXTRACTION, AI_GENERATION, AUTOCOMPLETE, COMMUNITY_MENTION
  sourceDetail      Json?           @map("source_detail")  // {url, prompt, api_response 등}
  status            CandidateStatus @default(PENDING)
  similarKeywordIds Json?           @default("[]") @map("similar_keyword_ids")
  reviewedById      String?         @map("reviewed_by")
  reviewedAt        DateTime?       @map("reviewed_at")
  approvedKeywordId String?         @map("approved_keyword_id")

  reviewedBy User? @relation(fields: [reviewedById], references: [id], onDelete: SET_NULL)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([status])
  @@index([source])
  @@index([createdAt])
  @@map("keyword_candidates")
}

model KeywordSiteLink {
  id          String              @id @default(uuid(7))
  keywordId   String              @map("keyword_id")
  siteId      String              @map("site_id")
  linkType    KeywordSiteLinkType @map("link_type")
  searchRank  Int?                @map("search_rank")
  discoveredAt DateTime           @map("discovered_at")

  keyword Keyword @relation(fields: [keywordId], references: [id], onDelete: RESTRICT)
  site    Site    @relation(fields: [siteId], references: [id], onDelete: RESTRICT)

  createdAt DateTime @default(now()) @map("created_at")

  @@unique([keywordId, siteId, linkType])
  @@index([keywordId])
  @@index([siteId])
  @@map("keyword_site_links")
}

model KeywordWeeklyStats {
  id             String @id @default(uuid(7))
  keywordId      String @map("keyword_id")
  weekStart      DateTime @map("week_start") @db.Date
  detectionCount Int      @default(0) @map("detection_count")
  precision      Float?
  apiCalls       Int      @default(0) @map("api_calls")
  truePositives  Int      @default(0) @map("true_positives")
  falsePositives Int      @default(0) @map("false_positives")

  keyword Keyword @relation(fields: [keywordId], references: [id], onDelete: CASCADE)

  @@unique([keywordId, weekStart])
  @@map("keyword_weekly_stats")
}

model SportsEvent {
  id        String   @id @default(uuid(7))
  name      String
  sportType String   @map("sport_type")
  startDate DateTime @map("start_date") @db.Date
  endDate   DateTime @map("end_date") @db.Date
  isActive  Boolean  @default(true) @map("is_active")
  createdById String? @map("created_by")

  createdBy     User?               @relation(fields: [createdById], references: [id], onDelete: SET_NULL)
  keywordGroups KeywordEventGroup[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([startDate])
  @@index([endDate])
  @@index([sportType])
  @@map("sports_events")
}

model KeywordEventGroup {
  eventId   String @map("event_id")
  keywordId String @map("keyword_id")

  event   SportsEvent @relation(fields: [eventId], references: [id], onDelete: CASCADE)
  keyword Keyword     @relation(fields: [keywordId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")

  @@id([eventId, keywordId])
  @@map("keyword_event_groups")
}

enum DetectionSource {
  GOOGLE_SEARCH
  CRAWLING
  COMMUNITY
  MANUAL
  NAVER_AUTOCOMPLETE
  GOOGLE_AUTOCOMPLETE
  META_EXTRACTION
  AI_DISCOVERY
  BAIT_KEYWORD
  EVENT_KEYWORD
}

model DetectionResult {
  id        String          @id @default(uuid(7))
  siteId    String          @map("site_id")
  source    DetectionSource
  keywordId String?         @map("keyword_id")
  rawData   Json?           @map("raw_data")

  site    Site     @relation(fields: [siteId], references: [id], onDelete: RESTRICT)
  keyword Keyword? @relation(fields: [keywordId], references: [id], onDelete: SET_NULL)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([siteId])
  @@index([source])
  @@index([keywordId])
  @@index([createdAt])
  @@map("detection_results")
}

enum ClassificationModel {
  CLAUDE_HAIKU
  XGBOOST
  BERT
  ENSEMBLE
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  MODIFIED
}

model ClassificationResult {
  id              String             @id @default(uuid(7))
  siteId          String             @map("site_id")
  model           ClassificationModel
  category        String?
  confidenceScore Float              @map("confidence_score")
  evidence        Json?              @default("[]")
  reviewStatus    ReviewStatus       @default(PENDING) @map("review_status")
  reviewedById    String?            @map("reviewed_by")
  reviewedAt      DateTime?          @map("reviewed_at")

  site       Site  @relation(fields: [siteId], references: [id], onDelete: RESTRICT)
  reviewedBy User? @relation(fields: [reviewedById], references: [id], onDelete: SET_NULL)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([siteId])
  @@index([model])
  @@index([reviewStatus])
  @@index([confidenceScore])
  @@index([createdAt])
  @@map("classification_results")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-010** | keywords 엔티티 정의 | 불법 도박 사이트 탐지에 사용되는 검색 키워드를 관리하는 테이블을 정의한다. 키워드별 카테고리 분류(스포츠 도박, 카지노, 경마 등), 활성/비활성 상태, 탐지 건수 통계를 관리한다. Claude Haiku로 시드 키워드에서 유사 키워드를 자동 생성하고, 관리자가 검토/수정/확정하는 워크플로우를 지원한다. | P2 | Phase 2-3 | 1. `keyword`는 검색에 사용되는 키워드 문자열이다 (예: "사설토토", "먹튀검증", "배당사이트") 2. `category`는 키워드의 도메인 카테고리이다 (예: "스포츠도박", "카지노", "경마") 3. `is_active`는 boolean으로 비활성화된 키워드는 탐지에서 제외된다 4. `detection_count`는 해당 키워드로 탐지된 사이트 누적 건수이며, 탐지 시마다 자동 증가한다 5. `created_by`는 키워드를 등록한 사용자의 FK이다 6. 초기 시드 키워드 최소 50개가 카테고리별로 등록된다 7. 키워드 추가/수정/삭제 이벤트가 audit_logs에 기록된다 | Google Custom Search API 쿼리 파라미터로 사용. Claude Haiku 4.5로 유사 키워드 자동 생성 (US-A1 참조). 키워드 변경 이력 추적을 위한 감사 로그 연동. |
| **FR-DM-011** | detection_results 엔티티 정의 | 탐지 엔진이 발견한 사이트 탐지 결과를 기록하는 테이블을 정의한다. 탐지 소스(Google 검색, 크롤링, 커뮤니티 제보, 수동 입력), 사용된 키워드, 원본 검색 결과 데이터를 저장한다. 탐지 결과는 사이트 등록 및 AI 분류의 입력 데이터로 활용된다. | P2 | Phase 2-3 | 1. `site_id`는 sites 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `source`는 `GOOGLE_SEARCH`, `CRAWLING`, `COMMUNITY`, `MANUAL` 4가지 enum 값을 지원한다 3. `keyword_id`는 keywords 테이블의 FK이며, 키워드 없이 탐지된 경우(커뮤니티 제보 등) null이 가능하다 4. `raw_data`는 JSON으로 검색 결과 스니펫, 크롤링 메타데이터, 제보 원문 등을 저장한다 5. `created_at`에 인덱스가 적용되어 시간순 탐지 이력 조회가 가능하다 6. 동일 사이트에 대해 여러 탐지 결과가 기록될 수 있다 (복수 키워드/소스) | Google Custom Search JSON API 응답 파싱, Crawlee 크롤링 결과 저장, 커뮤니티 제보 API 연동. `raw_data` JSON 구조: `{ title, snippet, searchUrl, crawlDepth, referrer }`. |
| **FR-DM-012** | classification_results 엔티티 정의 | AI 모델의 사이트 분류 결과를 관리하는 테이블을 정의한다. Claude Haiku few-shot(1순위), XGBoost, BERT, 앙상블 등 모델별 분류 결과와 신뢰도 점수를 기록한다. 분류 결과에 대한 사람 검토(승인/거부/수정) 워크플로우를 지원하여 AI 분류의 정확도를 지속적으로 개선한다. | P1 | Phase 2 (Haiku) / Phase 3 (ML) | 1. `site_id`는 sites 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `model`은 `CLAUDE_HAIKU`, `XGBOOST`, `BERT`, `ENSEMBLE` 4가지 enum 값을 지원한다 3. `category`는 분류된 사이트 카테고리(SiteCategory enum과 동일 값)이다 4. `confidence_score`는 0.0~1.0 범위의 부동소수점 신뢰도이다 5. `evidence`는 JSON 배열로 분류 근거(키워드 매칭, 시각적 특징, 구조적 패턴 등)를 저장한다 6. `review_status`는 `PENDING`(검토 대기), `APPROVED`(승인), `REJECTED`(거부), `MODIFIED`(수정됨) 4가지 상태를 지원한다 7. `reviewed_by`는 검토자의 FK, `reviewed_at`은 검토 시각이다 8. 승인된 분류 결과의 `confidence_score`가 sites 테이블의 `confidence_score`에 반영된다 9. `confidence_score`에 인덱스가 적용되어 저신뢰 항목 필터링이 가능하다 | Claude Haiku 4.5 API (few-shot, F1 94-95%), 배치 API + 프롬프트 캐싱으로 비용 최적화. Phase 3에서 URLBERT/URLTran 파인튜닝 모델 추가. `evidence` JSON: `[{ type: "keyword_match", keyword: "사설토토", score: 0.95 }, ...]`. |

---

## F. 도메인 모니터링 (Phase 2)

### 스키마: domain_history, domain_clusters

```prisma
enum DomainStatus {
  ALIVE
  DEAD
  REDIRECT
}

model DomainHistory {
  id             String       @id @default(uuid(7))
  siteId         String       @map("site_id")
  domain         String
  ipAddress      String?      @map("ip_address")
  dnsRecords     Json?        @map("dns_records")
  status         DomainStatus
  checkedAt      DateTime     @map("checked_at")
  responseTimeMs Int?         @map("response_time_ms")
  redirectUrl    String?      @map("redirect_url")

  // 인프라 핑거프린팅 필드 (FR-DE-031~034)
  sslFingerprint String?      @map("ssl_fingerprint")   // SHA-256 인증서 핑거프린트
  sslSanDomains  Json?        @map("ssl_san_domains")   // SAN 필드 도메인 목록 (String[])
  sslIssuer      String?      @map("ssl_issuer")        // 인증서 발급자 (e.g., "Let's Encrypt")
  sslExpiry      DateTime?    @map("ssl_expiry")        // 인증서 만료일
  jarmHash       String?      @map("jarm_hash")         // JARM TLS 핑거프린트 (62자)
  trackingIds    Json?        @map("tracking_ids")      // GA/GTM/Pixel ID ({ga: "G-XXX", gtm: "GTM-XXX", fbPixel: "123"})

  site Site @relation(fields: [siteId], references: [id], onDelete: RESTRICT)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([siteId])
  @@index([domain])
  @@index([status])
  @@index([checkedAt])
  @@index([siteId, checkedAt])
  @@index([sslFingerprint])
  @@index([jarmHash])
  @@map("domain_history")
}

model DomainCluster {
  id          String @id @default(uuid(7))
  name        String
  description String?

  // 클러스터링 근거 (FR-DE-019, FR-DE-031~034)
  clusterBasis Json?  @map("cluster_basis")  // 클러스터링 근거 목록
  // 예: { "sharedIp": ["1.2.3.0/24"], "sslFingerprint": "abc...", "jarmHash": "def...",
  //        "trackingIds": {"ga": "G-XXX"}, "whoisRegistrant": "...", "designSimilarity": 0.85 }

  sites SiteDomainCluster[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("domain_clusters")
}

model SiteDomainCluster {
  siteId    String @map("site_id")
  clusterId String @map("cluster_id")

  site    Site          @relation(fields: [siteId], references: [id], onDelete: CASCADE)
  cluster DomainCluster @relation(fields: [clusterId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")

  @@id([siteId, clusterId])
  @@map("site_domain_clusters")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-013** | domain_history 엔티티 정의 | 사이트 도메인의 생존 상태 변화 이력을 기록하는 테이블을 정의한다. 주기적(30분~1시간 간격)으로 도메인의 DNS 응답, IP 주소, 응답 시간, 리디렉트 여부를 체크하고 결과를 저장한다. 도메인 호핑(빈번한 도메인 변경)을 추적하여 동일 운영자 사이트를 식별하는 기반 데이터로 활용한다. | P1 | Phase 2 | 1. `site_id`는 sites 테이블의 FK이며 RESTRICT 삭제 정책이 적용된다 2. `domain`은 체크 시점의 도메인명이다 (도메인 변경 추적) 3. `ip_address`는 DNS A 레코드 기반 IP 주소이다 4. `dns_records`는 JSON으로 A, AAAA, MX, NS, TXT 레코드를 저장한다 5. `status`는 `ALIVE`(정상 응답), `DEAD`(응답 없음/DNS 실패), `REDIRECT`(리디렉트 감지) 3가지이다 6. `response_time_ms`는 밀리초 단위 응답 시간이다 7. `redirect_url`은 리디렉트 대상 URL이며, REDIRECT 상태에서만 값이 존재한다 8. `site_id + checked_at` 복합 인덱스로 특정 사이트의 시간순 이력 조회가 가능하다 9. 30일 이상 경과한 데이터는 날짜 기반 파티셔닝으로 관리한다 (FR-DM-020 참조) | 크론 스케줄(node-cron) + got-scraping HTTP 체크, Node.js `dns` 모듈 DNS 조회. `DEAD` 상태가 연속 3회 이상이면 사이트 status를 `INACTIVE`로 자동 변경. 리디렉트 대상 URL이 기존 사이트와 동일 운영자로 판별되면 자동 클러스터링. |
| **FR-DM-014** | domain_clusters 엔티티 정의 | 동일 운영자가 운영하는 것으로 추정되는 사이트 그룹(클러스터)을 관리하는 테이블을 정의한다. IP 주소, 서버 구성, HTML 템플릿, 광고 네트워크 유사성 등을 기반으로 사이트를 클러스터링한다. N:M 관계로 하나의 사이트가 여러 클러스터에 속할 수 있다. | P1 | Phase 2 | 1. `domain_clusters` 테이블은 클러스터의 이름과 설명을 저장한다 2. `site_domain_clusters` 정션 테이블은 `site_id + cluster_id` 복합 PK를 가진다 3. 하나의 사이트가 여러 클러스터에 속할 수 있다 (N:M 관계) 4. 사이트 삭제 시 정션 테이블의 관련 레코드도 CASCADE 삭제된다 5. 클러스터 삭제 시 정션 테이블의 관련 레코드도 CASCADE 삭제된다 6. 클러스터에 속한 사이트 목록을 조회할 수 있다 7. 특정 사이트가 속한 클러스터 목록을 조회할 수 있다 | 클러스터링 알고리즘: IP 대역 유사성, WHOIS 등록자 정보 비교, HTML 구조 유사도(simhash), Google Analytics/Tag Manager ID 일치. 대시보드에서 클러스터 시각화(네트워크 그래프). |

---

## F-2. 채증 스케줄링 (Phase 2-3)

### 스키마: investigation_schedules, schedule_run_logs

```prisma
enum ScheduleType {
  ONCE        // 1회 예약
  DAILY       // 매일 특정 시각
  WEEKLY      // 매주 특정 요일/시각
  HOURLY      // 매 N시간
  CRON        // 커스텀 크론 표현식
  CONTINUOUS  // 상시 모니터링 (큐 비면 자동 투입)
}

model InvestigationSchedule {
  id             String       @id @default(uuid(7))
  name           String                                // "매일 새벽 전체 채증"
  scheduleType   ScheduleType @map("schedule_type")
  cronExpression String?      @map("cron_expression")  // "0 2 * * *"
  startTime      String?      @map("start_time")       // "02:00" (HH:mm)
  endTime        String?      @map("end_time")         // "06:00" (HH:mm)
  targetFilter   Json         @map("target_filter")    // {type, categories?, minRiskScore?, siteIds?}
  scope          Int          @default(1)              // 1=1단계, 2=1-2단계, 3=전체
  maxConcurrent  Int          @default(5) @map("max_concurrent")
  isActive       Boolean      @default(true) @map("is_active")
  createdById    String       @map("created_by")
  lastRunAt      DateTime?    @map("last_run_at")
  nextRunAt      DateTime?    @map("next_run_at")
  runCount       Int          @default(0) @map("run_count")

  createdBy User              @relation(fields: [createdById], references: [id], onDelete: RESTRICT)
  runLogs   ScheduleRunLog[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([scheduleType])
  @@index([isActive])
  @@index([nextRunAt])
  @@map("investigation_schedules")
}

model ScheduleRunLog {
  id           String   @id @default(uuid(7))
  scheduleId   String   @map("schedule_id")
  startedAt    DateTime @map("started_at")
  completedAt  DateTime? @map("completed_at")
  totalCount   Int      @default(0) @map("total_count")
  successCount Int      @default(0) @map("success_count")
  failedCount  Int      @default(0) @map("failed_count")
  durationMs   Int?     @map("duration_ms")

  schedule InvestigationSchedule @relation(fields: [scheduleId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([scheduleId])
  @@index([startedAt])
  @@map("schedule_run_logs")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-021** | investigation_schedules 엔티티 정의 | 자동 채증 스케줄을 관리하는 테이블. 반복 유형 6종(ONCE/DAILY/WEEKLY/HOURLY/CRON/CONTINUOUS), 실행 시간대, 대상 필터(JSON), 채증 범위, 동시 실행 상한을 저장한다. | P1 | Phase 2-3 | 1. schedule_type은 6개 enum 값 지원 2. target_filter는 JSON으로 {type: "all"/"category"/"risk_score"/"manual"} 저장 3. next_run_at은 스케줄 생성/실행 시 자동 계산 4. is_active 토글로 즉시 비활성화 가능 | Celery Beat + croniter 크론 파싱. |
| **FR-DM-022** | schedule_run_logs 엔티티 정의 | 스케줄 실행 이력을 기록하는 테이블. 실행 시작/종료 시각, 처리 건수(전체/성공/실패), 소요 시간을 저장한다. | P1 | Phase 2-3 | 1. schedule_id FK로 스케줄과 연결 2. 스케줄 삭제 시 CASCADE 삭제 3. started_at 인덱스로 시간순 조회 가능 | 스케줄 실행 완료 시 자동 기록. |

---

## G. 사용자 관리 (Phase 1)

### 스키마: users, sessions (FastAPI JWT 인증)

```prisma
enum UserRole {
  ADMIN
  OPERATOR
  INVESTIGATOR
  VIEWER
}

model User {
  id            String    @id @default(uuid(7))
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  passwordHash  String    @map("password_hash")
  image         String?
  role          UserRole  @default(VIEWER)
  isActive      Boolean   @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")

  accounts     Account[]
  sessions     Session[]
  investigations Investigation[]
  auditLogs    AuditLog[]
  keywords     Keyword[]
  classificationReviews ClassificationResult[]
  assignedInterventions ManualInterventionQueue[] @relation("AssignedInterventions")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@map("users")
}

model Account {
  id                String  @id @default(uuid(7))
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refreshToken      String? @map("refresh_token") @db.Text
  accessToken       String? @map("access_token") @db.Text
  expiresAt         Int?    @map("expires_at")
  tokenType         String? @map("token_type")
  scope             String?
  idToken           String? @map("id_token") @db.Text
  sessionState      String? @map("session_state")

  user User @relation(fields: [userId], references: [id], onDelete: CASCADE)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid(7))
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: CASCADE)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-015** | users 엔티티 정의 | 시스템 사용자를 관리하는 테이블을 정의한다. FastAPI JWT 인증과 호환되는 스키마 구조를 따르되, 시스템 고유 필드(`role`, `is_active`, `password_hash`, `last_login_at`)를 추가한다. 역할 기반 접근 제어(RBAC)를 위해 ADMIN, OPERATOR, INVESTIGATOR, VIEWER 4가지 역할을 지원한다. | P0 | Phase 1 | 1. `id`는 UUID v7 형식의 PK이다 2. `email`은 유니크 제약조건이 적용되며 로그인 식별자로 사용된다 3. `password_hash`는 bcrypt 해시(cost factor 12)로 저장된다. 평문 비밀번호는 저장하지 않는다 4. `role`은 `ADMIN`(전체 관리), `OPERATOR`(시스템 운영/채증 관리), `INVESTIGATOR`(채증 실행/조회), `VIEWER`(조회 전용) 4가지 enum 값을 지원한다 5. `is_active`가 false인 사용자는 로그인이 차단된다 6. `last_login_at`은 최종 로그인 시각을 기록한다 7. 범용 인증 필드 구조(`email_verified`, `image`)를 포함한다 8. 사용자 생성/수정/비활성화 이벤트가 audit_logs에 기록된다 9. 비밀번호 변경 이력은 별도로 추적된다 | FastAPI Security (python-jose + passlib). bcrypt (passlib 패키지). 세션 관리: JWT Bearer Token 기반. RBAC 미들웨어: FastAPI Depends() 의존성으로 역할 기반 라우트 보호. |
| **FR-DM-016** | sessions 엔티티 정의 (NextAuth.js 호환) | FastAPI JWT 인증의 세션 관리를 위한 sessions, accounts, verification_tokens 테이블을 정의한다. JWT 토큰 블랙리스트, 리프레시 토큰 관리, 만료 시각을 관리한다. | P0 | Phase 1 | 1. `sessions` 테이블의 `session_token`은 유니크 제약조건이 적용된다 2. `accounts` 테이블은 OAuth 제공자별 계정 연동 정보를 저장하며, `provider + provider_account_id` 복합 유니크 제약이 적용된다 3. `verification_tokens` 테이블은 이메일 인증/비밀번호 재설정 토큰을 관리한다 4. 사용자 삭제 시 관련 세션과 계정이 CASCADE 삭제된다 5. 만료된 세션은 주기적으로 정리된다 (Celery Beat 크론 작업) 6. 세션 타임아웃은 기본 30분이며 시스템 설정으로 조절 가능하다 | SQLAlchemy 세션 모델. JWT 전략 기반이며 refresh_token은 sessions 테이블에서 관리. 세션 타임아웃: FastAPI JWT `ACCESS_TOKEN_EXPIRE_MINUTES` 설정. |

---

## H. 시스템 설정 (Phase 1)

### 스키마: system_settings

```prisma
model SystemSetting {
  id          String   @id @default(uuid(7))
  key         String   @unique
  value       Json
  description String?
  updatedById String?  @map("updated_by")

  updatedBy User? @relation(fields: [updatedById], references: [id], onDelete: SET_NULL)

  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([key])
  @@map("system_settings")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-017** | system_settings 엔티티 정의 | 시스템 전역 설정을 키-값(key-value) 형태로 관리하는 테이블을 정의한다. 채증 파이프라인 설정(동시 브라우저 수, 타임아웃, 재시도 횟수), 외부 서비스 설정(SMS 제공자 우선순위, 프록시 설정), 비용 한도, 알림 설정 등을 DB에 저장하여 시스템 재시작 없이 런타임에 변경할 수 있도록 한다. | P0 | Phase 1 | 1. `key`는 유니크 제약조건이 적용된 설정 키이다 (예: `browser.maxConcurrency`, `sms.providerPriority`, `cost.monthlyLimitUsd`) 2. `value`는 JSON 타입으로 문자열, 숫자, 배열, 객체 등 다양한 값 형태를 지원한다 3. `description`은 설정 항목의 설명이다 4. `updated_by`는 설정을 마지막으로 변경한 사용자의 FK이다 5. 설정 변경 시 audit_logs에 변경 전/후 값이 기록된다 6. 애플리케이션은 Redis 캐시를 통해 설정값을 빠르게 조회하며, DB 변경 시 캐시를 무효화한다 7. 초기 시드 데이터로 기본 설정값이 마이그레이션 시 자동 삽입된다 | Redis 캐시 (설정값 조회 최적화), Alembic data migration 또는 seed 스크립트 (초기 설정값). 초기 설정 키 예시: `browser.maxConcurrency: 5`, `sms.providerPriority: ["PVAPINS","GRIZZLYSMS","SMS_ACTIVATE"]`, `captcha.timeoutSeconds: 300`, `cost.monthlyLimitUsd: 2000`. |

---

## I. 팝업 패턴 (Phase 2)

### 스키마: popup_patterns

```prisma
model PopupPattern {
  id                  String  @id @default(uuid(7))
  siteId              String? @map("site_id")
  patternType         String  @map("pattern_type")
  cssSelector         String  @map("css_selector")
  closeButtonSelector String? @map("close_button_selector")
  isActive            Boolean @default(true) @map("is_active")
  successCount        Int     @default(0) @map("success_count")
  failCount           Int     @default(0) @map("fail_count")

  site Site? @relation(fields: [siteId], references: [id], onDelete: CASCADE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([siteId])
  @@index([patternType])
  @@index([isActive])
  @@map("popup_patterns")
}
```

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-018** | popup_patterns 엔티티 정의 | 사이트별로 반복 출현하는 팝업 패턴을 학습하여 저장하는 테이블을 정의한다. 팝업의 CSS 셀렉터, 닫기 버튼 셀렉터, 패턴 유형을 기록하며, 성공/실패 횟수를 추적하여 패턴의 유효성을 관리한다. `site_id`가 null인 패턴은 글로벌 패턴으로 모든 사이트에 적용된다. | P1 | Phase 2 | 1. `site_id`는 sites 테이블의 FK이며, null인 경우 글로벌 패턴(모든 사이트 공통)이다 2. `pattern_type`은 팝업 유형을 문자열로 저장한다 (예: `PROMOTION`, `AGE_VERIFICATION`, `COOKIE_CONSENT`, `OVERLAY`, `DIALOG`) 3. `css_selector`는 팝업 요소를 식별하는 CSS 셀렉터이다 (예: `.popup-overlay`, `dialog[open]`) 4. `close_button_selector`는 닫기 버튼의 CSS 셀렉터이다 (예: `.popup-close`, `button[aria-label="닫기"]`) 5. `is_active`가 false인 패턴은 적용에서 제외된다 6. `success_count`와 `fail_count`로 패턴의 성공률을 계산할 수 있다 7. 성공률이 50% 미만인 패턴은 자동으로 `is_active = false`로 비활성화된다 8. 새로운 팝업 패턴은 Claude Vision 분석 후 자동으로 추가된다 | Playwright `page.locator(cssSelector)`, Claude Haiku 4.5 Vision API (새 팝업 패턴 분석). 패턴 적용 순서: 1) 사이트별 패턴, 2) 글로벌 패턴, 3) Claude Vision 범용 분석. 어댑터 패턴(FR-EC-018) 데이터 저장소. |

---

## J. 인덱스 및 성능 (Phase 1)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-DM-019** | 핵심 인덱스 정의 | 자주 조회되는 쿼리 패턴에 최적화된 단일/복합 인덱스를 정의한다. 대시보드 목록 조회, 채증 큐 폴링, 증거 검색, 감사 로그 조회 등 주요 쿼리의 응답 시간을 2초 이내로 보장한다. | P0 | Phase 1 | 1. **sites 테이블**: `domain` (단일), `status` (단일), `category` (단일), `confidence_score` (단일), `first_detected_at` (단일) 인덱스가 적용된다 2. **investigations 테이블**: `site_id` (단일), `status` (단일), `status + scheduled_at` (복합), `created_by` (단일) 인덱스가 적용된다 3. **evidence_files 테이블**: `investigation_id` (단일), `file_type` (단일), `sha256_hash` (단일) 인덱스가 적용된다 4. **audit_logs 테이블**: `entity_type + entity_id` (복합), `actor_id` (단일), `action` (단일), `created_at` (단일) 인덱스가 적용된다 5. **detection_results 테이블**: `site_id` (단일), `source` (단일), `created_at` (단일) 인덱스가 적용된다 6. **classification_results 테이블**: `site_id` (단일), `review_status` (단일), `confidence_score` (단일) 인덱스가 적용된다 7. **domain_history 테이블**: `site_id + checked_at` (복합), `domain` (단일), `status` (단일) 인덱스가 적용된다 8. 모든 인덱스 정의 후 `EXPLAIN ANALYZE`로 쿼리 실행 계획을 검증하여 인덱스가 실제로 사용되는지 확인한다 9. 사이트 목록 조회(status 필터 + 페이지네이션)가 1000건 기준 200ms 이내에 응답한다 | SQLAlchemy `Index()` 선언. PostgreSQL `EXPLAIN ANALYZE` 기반 쿼리 최적화. 복합 인덱스는 선택성이 높은 컬럼을 선행 컬럼으로 배치. 부분 인덱스(partial index) 활용: `WHERE deleted_at IS NULL` 조건의 부분 인덱스로 소프트 삭제된 레코드 제외. |
| **FR-DM-020** | 파티셔닝 전략 | 대용량 시계열 데이터(audit_logs, domain_history)에 대해 날짜 기반 파티셔닝을 적용하여 쿼리 성능과 데이터 관리 효율을 확보한다. 파티션 단위, 보존 기간, 자동 파티션 생성을 정의한다. | P1 | Phase 2 | 1. **audit_logs 테이블**: `created_at` 기준 월별 파티셔닝이 적용된다 2. **domain_history 테이블**: `checked_at` 기준 월별 파티셔닝이 적용된다 3. 새로운 월 시작 시 해당 월의 파티션이 자동으로 생성된다 (pg_partman 또는 크론 스크립트) 4. audit_logs의 보존 기간은 5년이며, 5년 초과 데이터는 아카이브(cold storage) 후 파티션 분리가 가능하다 5. domain_history의 보존 기간은 2년이며, 2년 초과 데이터는 요약 통계로 집계 후 원본 파티션 아카이브가 가능하다 6. 파티션 프루닝(partition pruning)이 작동하여 `created_at` 범위 쿼리 시 불필요한 파티션을 스캔하지 않는다 7. 파티셔닝 적용 후 전체 테이블 스캔 대비 쿼리 응답 시간이 50% 이상 개선된다 | PostgreSQL 네이티브 `RANGE` 파티셔닝 (`PARTITION BY RANGE (created_at)`). `pg_partman` 확장으로 자동 파티션 관리. Alembic 마이그레이션 스크립트에서 raw SQL로 파티셔닝 적용. 예시: `CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01')`. |

---

## K. ERD (Entity Relationship Diagram)

아래 다이어그램은 시스템의 주요 테이블 간 관계를 나타낸다. `PK`는 기본 키, `FK`는 외래 키, `---`는 1:N 관계, `===`는 N:M 관계(정션 테이블 경유)를 의미한다.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        불법 도박 사이트 자동 채증 시스템 ERD                                │
│                                                                                         │
│  ※ 화살표 방향: FK → PK (참조 방향)                                                       │
│  ※ 1:N = 단일 실선, N:M = 정션 테이블 경유                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                ┌──────────────────┐
                                │      users       │
                                │──────────────────│
                                │ PK id            │
                                │    name          │
                                │    email (UQ)    │
                                │    password_hash │
                                │    role (enum)   │
                                │    is_active     │
                                │    last_login_at │
                                │    created_at    │
                                │    updated_at    │
                                └──────┬───────────┘
                                       │
              ┌──────────────┬─────────┼──────────┬──────────────┬──────────────┐
              │              │         │          │              │              │
              ▼              ▼         ▼          ▼              ▼              ▼
     ┌────────────┐  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
     │  accounts  │  │ sessions │ │keywords│ │audit_logs│ │classifi- │ │manual_inter- │
     │────────────│  │──────────│ │────────│ │──────────│ │cation_   │ │vention_queue │
     │ PK id      │  │ PK id    │ │ PK id  │ │ PK id    │ │results   │ │ (assigned_to)│
     │ FK user_id │  │ FK user_ │ │FK crea-│ │FK actor_ │ │──────────│ │──────────────│
     │    provider│  │    id    │ │  ted_by│ │   id     │ │FK review-│ │              │
     └────────────┘  └──────────┘ │   ...  │ │   ...    │ │  ed_by   │ └──────────────┘
                                  └───┬────┘ └──────────┘ └─────┬────┘
                                      │                         │
                                      │                         │
                                      ▼                         │
                               ┌────────────┐                   │
                               │ detection_ │                   │
                               │ results    │                   │
                               │────────────│                   │
                               │ PK id      │                   │
                               │ FK site_id │◄──────────────────┤
                               │ FK keyword_│                   │
                               │    id      │                   │
                               │    source  │                   │
                               └─────┬──────┘                   │
                                     │                          │
                                     ▼                          │
┌──────────────────────────────────────────────────────────┐    │
│                        sites                             │    │
│──────────────────────────────────────────────────────────│    │
│ PK id                                                    │    │
│    url (UQ)                                              │◄───┘
│    domain                                                │
│    status (enum: ACTIVE/INACTIVE/CLOSED/MONITORING)      │
│    category (enum: SPORTS_BETTING/HORSE_RACING/...)      │
│    confidence_score                                      │
│    first_detected_at, last_checked_at                    │
│    tags (JSON), whois_data (JSON), dns_records (JSON)    │
│    created_at, updated_at, deleted_at                    │
└──┬───────┬───────────┬──────────┬──────────┬─────────────┘
   │       │           │          │          │
   │       │           │          │          │   ┌────────────────────┐
   │       │           │          │          ├──►│  popup_patterns    │
   │       │           │          │          │   │────────────────────│
   │       │           │          │          │   │ PK id              │
   │       │           │          │          │   │ FK site_id (null=  │
   │       │           │          │          │   │    global)         │
   │       │           │          │          │   │    pattern_type    │
   │       │           │          │          │   │    css_selector    │
   │       │           │          │          │   │    close_button_   │
   │       │           │          │          │   │      selector      │
   │       │           │          │          │   │    success_count   │
   │       │           │          │          │   │    fail_count      │
   │       │           │          │          │   └────────────────────┘
   │       │           │          │          │
   │       │           │          │          │   ┌────────────────────┐
   │       │           │          │          └──►│  domain_history    │
   │       │           │          │              │────────────────────│
   │       │           │          │              │ PK id              │
   │       │           │          │              │ FK site_id         │
   │       │           │          │              │    domain          │
   │       │           │          │              │    ip_address      │
   │       │           │          │              │    status (enum)   │
   │       │           │          │              │    checked_at      │
   │       │           │          │              │    response_time_ms│
   │       │           │          │              │    redirect_url    │
   │       │           │          │              └────────────────────┘
   │       │           │          │
   │       │           │          │ N:M (정션 테이블 경유)
   │       │           │          │
   │       │           │          │   ┌──────────────────────┐
   │       │           │          └──►│ site_domain_clusters │
   │       │           │              │──────────────────────│
   │       │           │              │ FK site_id (CPK)     │
   │       │           │              │ FK cluster_id (CPK)  │
   │       │           │              └──────────┬───────────┘
   │       │           │                         │
   │       │           │                         ▼
   │       │           │              ┌──────────────────────┐
   │       │           │              │  domain_clusters     │
   │       │           │              │──────────────────────│
   │       │           │              │ PK id                │
   │       │           │              │    name              │
   │       │           │              │    description       │
   │       │           │              └──────────────────────┘
   │       │           │
   │       │           │   ┌─────────────────────────────────┐
   │       │           └──►│      investigations             │
   │       │               │─────────────────────────────────│
   │       │               │ PK id                           │
   │       │               │ FK site_id                      │
   │       │               │ FK created_by (→ users)         │
   │       │               │    status (enum: QUEUED/        │
   │       │               │      IN_PROGRESS/STAGE_1_.../   │
   │       │               │      COMPLETED/FAILED/CANCELLED)│
   │       │               │    current_stage (1/2/3)        │
   │       │               │    started_at, completed_at     │
   │       │               │    error_message, retry_count   │
   │       │               │    proxy_used                   │
   │       │               │    browser_fingerprint (JSON)   │
   │       │               │    created_at, updated_at       │
   │       │               └───┬────────┬──────────┬─────────┘
   │       │                   │        │          │
   │       │                   │        │          │
   │       │                   ▼        │          ▼
   │       │   ┌───────────────────┐    │   ┌──────────────────────┐
   │       │   │   sms_numbers     │    │   │ manual_intervention  │
   │       │   │───────────────────│    │   │ _queue               │
   │       │   │ PK id             │    │   │──────────────────────│
   │       │   │ FK investigation_ │    │   │ PK id                │
   │       │   │    id             │    │   │ FK investigation_id  │
   │       │   │    phone_number   │    │   │ FK assigned_to       │
   │       │   │    country_code   │    │   │    (→ users)         │
   │       │   │    provider(enum) │    │   │    type (enum)       │
   │       │   │    status (enum)  │    │   │    status (enum)     │
   │       │   │    cost_usd       │    │   │    cdp_session_url   │
   │       │   └───────┬───────────┘    │   │    screenshot_path   │
   │       │           │                │   │    resolved_at       │
   │       │           ▼                │   └──────────────────────┘
   │       │   ┌───────────────────┐    │
   │       │   │   sms_messages    │    │
   │       │   │───────────────────│    │
   │       │   │ PK id             │    │
   │       │   │ FK sms_number_id  │    │
   │       │   │    message_text   │    │
   │       │   │    otp_code       │    │
   │       │   │    received_at    │    │
   │       │   └───────────────────┘    │
   │       │                            │
   │       │                            ▼
   │       │               ┌────────────────────────────┐
   │       │               │     evidence_files         │
   │       │               │────────────────────────────│
   │       │               │ PK id                      │
   │       │               │ FK investigation_id        │
   │       │               │    file_type (enum)        │
   │       │               │    stage (1/2/3)           │
   │       │               │    file_path (S3 key)      │
   │       │               │    file_size               │
   │       │               │    mime_type               │
   │       │               │    sha256_hash             │
   │       │               │    original_filename       │
   │       │               │    created_at              │
   │       │               └───────┬──────────┬─────────┘
   │       │                       │          │
   │       │                       ▼          ▼
   │       │           ┌────────────────┐ ┌────────────────┐
   │       │           │  hash_records  │ │  timestamps    │
   │       │           │────────────────│ │────────────────│
   │       │           │ PK id          │ │ PK id          │
   │       │           │ FK evidence_   │ │ FK evidence_   │
   │       │           │    file_id     │ │    file_id     │
   │       │           │    algorithm   │ │    type (enum: │
   │       │           │    hash_value  │ │    OTS/RFC3161)│
   │       │           │    verified_at │ │    timestamp_  │
   │       │           │    verifica-   │ │    value       │
   │       │           │    tion_status │ │    proof_file_ │
   │       │           └────────────────┘ │    path        │
   │       │                              │    verifica-   │
   │       │                              │    tion_status │
   │       │                              └────────────────┘
   │       │
   │       │   ┌───────────────────────────┐
   │       │   │    system_settings        │
   │       │   │───────────────────────────│
   │       │   │ PK id                     │
   │       │   │    key (UQ)               │
   │       │   │    value (JSON)           │
   │       │   │    description            │
   │       │   │ FK updated_by (→ users)   │
   │       │   │    updated_at             │
   │       │   └───────────────────────────┘
   │       │
   │       │   ┌───────────────────────────┐
   │       │   │   verification_tokens     │
   │       │   │───────────────────────────│
   │       │   │    identifier             │
   │       │   │    token (UQ)             │
   │       │   │    expires                │
   │       │   └───────────────────────────┘
   │       │
   │       │
   └───────┘

                ┌─────────────────────────────────────────────┐
                │               관계 요약                       │
                │─────────────────────────────────────────────│
                │ sites 1───N investigations                   │
                │ sites 1───N detection_results                │
                │ sites 1───N classification_results           │
                │ sites 1───N domain_history                   │
                │ sites 1───N popup_patterns                   │
                │ sites N═══M domain_clusters                  │
                │                (via site_domain_clusters)    │
                │ investigations 1───N evidence_files          │
                │ investigations 1───N sms_numbers             │
                │ investigations 1───N manual_intervention_q.  │
                │ evidence_files 1───N hash_records            │
                │ evidence_files 1───N timestamps              │
                │ sms_numbers    1───N sms_messages            │
                │ users 1───N investigations (created_by)      │
                │ users 1───N audit_logs (actor_id)            │
                │ users 1───N accounts                         │
                │ users 1───N sessions                         │
                │ users 1───N keywords (created_by)            │
                │ users 1───N classification_results (reviewed)│
                │ users 1───N manual_intervention_q.(assigned) │
                │ keywords 1───N detection_results             │
                └─────────────────────────────────────────────┘
```

---

## 요구사항 요약 매트릭스

| ID | 제목 | 우선순위 | Phase | 카테고리 |
|----|------|---------|-------|---------|
| FR-DM-001 | sites 엔티티 정의 | P0 | Phase 1 | 핵심 엔티티 |
| FR-DM-002 | investigations 엔티티 정의 | P0 | Phase 1 | 핵심 엔티티 |
| FR-DM-003 | evidence_files 엔티티 정의 | P0 | Phase 1 | 핵심 엔티티 |
| FR-DM-004 | hash_records 엔티티 정의 | P0 | Phase 1 | 증거 무결성 |
| FR-DM-005 | timestamps 엔티티 정의 | P0 | Phase 1-2 | 증거 무결성 |
| FR-DM-006 | audit_logs 엔티티 정의 | P0 | Phase 1 | 증거 무결성 |
| FR-DM-007 | sms_numbers 엔티티 정의 | P1 | Phase 2 | SMS 인증 |
| FR-DM-008 | sms_messages 엔티티 정의 | P1 | Phase 2 | SMS 인증 |
| FR-DM-009 | manual_intervention_queue 엔티티 정의 | P1 | Phase 2 | CAPTCHA/수동 개입 |
| FR-DM-010 | keywords 엔티티 정의 | P2 | Phase 2-3 | 탐지 엔진 |
| FR-DM-011 | detection_results 엔티티 정의 | P2 | Phase 2-3 | 탐지 엔진 |
| FR-DM-012 | classification_results 엔티티 정의 | P1 | Phase 2-3 | 탐지 엔진 |
| FR-DM-013 | domain_history 엔티티 정의 | P1 | Phase 2 | 도메인 모니터링 |
| FR-DM-014 | domain_clusters 엔티티 정의 | P1 | Phase 2 | 도메인 모니터링 |
| FR-DM-015 | users 엔티티 정의 | P0 | Phase 1 | 사용자 관리 |
| FR-DM-016 | sessions 엔티티 정의 (FastAPI JWT 호환) | P0 | Phase 1 | 사용자 관리 |
| FR-DM-017 | system_settings 엔티티 정의 | P0 | Phase 1 | 시스템 설정 |
| FR-DM-018 | popup_patterns 엔티티 정의 | P1 | Phase 2 | 팝업 패턴 |
| FR-DM-019 | 핵심 인덱스 정의 | P0 | Phase 1 | 인덱스/성능 |
| FR-DM-020 | 파티셔닝 전략 | P1 | Phase 2 | 인덱스/성능 |

---

## 테이블 통계 요약

| 구분 | 테이블 수 | Phase 1 | Phase 2 | Phase 2-3 |
|------|----------|---------|---------|-----------|
| 핵심 엔티티 | 3 | 3 | - | - |
| 증거 무결성 | 3 | 3 | - | - |
| SMS 인증 | 2 | - | 2 | - |
| CAPTCHA/수동 개입 | 1 | - | 1 | - |
| 탐지 엔진 | 3 | - | - | 3 |
| 도메인 모니터링 | 3 (클러스터 + 정션) | - | 3 | - |
| 사용자 관리 | 4 (users + accounts + sessions + verification_tokens) | 4 | - | - |
| 시스템 설정 | 1 | 1 | - | - |
| 팝업 패턴 | 1 | - | 1 | - |
| **합계** | **21** | **11** | **7** | **3** |

---

## Redis 데이터 구조 (Celery 작업 큐)

> 아래 Redis 데이터 구조는 DB 테이블이 아닌 Celery 기반 인메모리 작업 큐 설계이다.

| 큐 이름 | 용도 | 관련 DB 테이블 | 동시성 |
|---------|------|---------------|--------|
| `investigation-queue` | 채증 작업 스케줄링 | investigations | 최대 5 (설정 가능) |
| `detection-queue` | 사이트 탐지 작업 | detection_results | 최대 10 |
| `classification-queue` | AI 분류 작업 | classification_results | 최대 20 (배치) |
| `domain-check-queue` | 도메인 생존 체크 | domain_history | 최대 50 |
| `hash-verification-queue` | 해시 무결성 검증 | hash_records | 최대 10 |
| `notification-queue` | 알림 발송 (Slack/웹 푸시) | - | 최대 5 |

---

## MinIO 저장소 구조

> 증거 파일은 DB에 메타데이터만 저장하고, 실제 파일은 MinIO(boto3 SDK)에 보관한다.

```
bucket: evidence-files/
  └── {siteId}/
      └── {investigationId}/
          ├── stage-1/
          │   ├── screenshot.png
          │   ├── page.html          (SingleFile)
          │   ├── evidence.warc.gz
          │   ├── network_log.json
          │   ├── metadata.json
          │   └── whois.json
          ├── stage-2/
          │   ├── screenshot_signup.png
          │   ├── screenshot_betting_start.png
          │   └── metadata.json
          ├── stage-3/
          │   ├── screenshot_betting_form.png
          │   ├── screenshot_betting_confirm.png
          │   └── metadata.json
          ├── hash_manifest.sha256
          ├── timestamp_proof.ots
          ├── timestamp_proof.tsr
          └── collection_log.json
```

---

## Alembic 마이그레이션 전략

| 단계 | 내용 | 명령어 |
|------|------|--------|
| 모델 작성 | `app/models/` 디렉토리에 SQLAlchemy 모델 정의 | - |
| 마이그레이션 생성 | Alembic 자동 감지 마이그레이션 파일 생성 | `alembic revision --autogenerate -m "init"` |
| 파티셔닝 적용 | audit_logs, domain_history 파티셔닝 (raw SQL) | Alembic 마이그레이션에 `op.execute()` 추가 |
| 시드 데이터 | 초기 설정값, 기본 키워드, 관리자 계정 | `python scripts/seed.py` 또는 Alembic data migration |
| 마이그레이션 적용 (개발) | 개발 환경 마이그레이션 | `alembic upgrade head` |
| 프로덕션 배포 | 마이그레이션 적용 | `alembic upgrade head` |
