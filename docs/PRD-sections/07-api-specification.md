# 3.7 REST API 명세 기능 요구사항

> 작성일: 2026-03-14
> 담당: api-architect
> 참조: `docs/PRD-sections/01-overview-and-stories.md`, `docs/PRD-sections/02-evidence-collection-engine.md` (FR-EC-001~034), `docs/PRD-sections/03-sms-authentication.md` (FR-SMS-001~031), `docs/PRD-sections/04-evidence-integrity.md` (FR-EV-001~017), `docs/PRD-sections/05-detection-engine.md` (FR-DE-001~030), `docs/planning/decisions.md`

---

## 개요

본 섹션은 불법 도박 사이트 자동 검색/채증 시스템의 REST API 명세를 정의한다. 모든 API는 Next.js 15.5.3 App Router의 Route Handlers(`app/api/` 디렉토리)로 구현하며, Server Actions와 병행하여 클라이언트-서버 간 데이터 흐름을 관리한다.

### 핵심 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| API 프레임워크 | Next.js 15.5.3 Route Handlers | App Router 기반, `app/api/` 디렉토리 |
| 인증/인가 | NextAuth.js v5 (Auth.js) | JWT Bearer Token, RBAC |
| ORM | Prisma + PostgreSQL | 타입 안전 쿼리, 마이그레이션 관리 |
| 유효성 검증 | Zod | 요청 본문/쿼리 파라미터 검증 |
| 비동기 작업 큐 | BullMQ + Redis | 채증/탐지 비동기 작업 관리 |
| 파일 저장소 | S3/MinIO | 스크린샷, 증거 파일, 보고서 |
| 실시간 통신 | Server-Sent Events (SSE) | 채증 진행 상태 실시간 스트리밍 |

---

## API 설계 원칙

### 1. RESTful 설계 원칙

| 원칙 | 적용 방침 |
|------|----------|
| 리소스 중심 URL | 명사형 복수 URL (`/api/sites`, `/api/investigations`) |
| HTTP 메서드 | GET(조회), POST(생성), PATCH(수정), DELETE(삭제) |
| 상태 코드 | 표준 HTTP 상태 코드 사용 (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500) |
| Content-Type | `application/json` (기본), `application/octet-stream` (파일 다운로드) |
| API 버저닝 | URL 경로 기반 (`/api/v1/...`) -- Phase 2 이후 필요 시 도입 |
| 멱등성 | PUT/DELETE는 멱등성 보장, POST에는 `Idempotency-Key` 헤더 지원 |

### 2. 인증 (Authentication)

NextAuth.js v5 기반 JWT Bearer Token 인증을 사용한다.

**인증 흐름:**

```
1. POST /api/auth/login  ->  JWT 토큰 발급 (access_token + refresh_token)
2. 이후 모든 API 요청  ->  Authorization: Bearer <access_token>
3. 토큰 만료 시  ->  POST /api/auth/refresh  ->  새 토큰 발급
4. POST /api/auth/logout  ->  토큰 무효화
```

**토큰 구조:**

```json
{
  "sub": "user-uuid",
  "role": "admin | operator | investigator | viewer",
  "permissions": ["sites:read", "sites:write", "investigations:execute", ...],
  "iat": 1710000000,
  "exp": 1710003600
}
```

**인증 예외 엔드포인트** (토큰 불필요):
- `POST /api/auth/login`
- `GET /api/system/health`

### 3. 역할 기반 접근 제어 (RBAC)

| 역할 | 코드 | 권한 범위 |
|------|------|----------|
| 관리자 | `admin` | 전체 시스템 관리, 사용자 관리, 설정 변경, 모든 데이터 CRUD |
| 운영자 | `operator` | 시스템 운영, 채증 실행/관리, 키워드 관리, 알림 설정, 보고서 생성 |
| 수사관 | `investigator` | 사이트 관리, 채증 실행, 증거 조회/다운로드, 수동 개입 처리 |
| 열람자 | `viewer` | 사이트/채증 결과/통계 조회만 가능, 변경 불가 |

**권한 매트릭스:**

| 리소스 | admin | operator | investigator | viewer |
|--------|-------|----------|-------------|--------|
| 사이트 CRUD | CRUD | CRUD | CRU | R |
| 채증 실행/취소 | O | O | O | X |
| 증거 조회 | O | O | O | O |
| 증거 다운로드 | O | O | O | X |
| 시스템 설정 | O | O | X | X |
| 사용자 관리 | O | X | X | X |
| 감사 로그 조회 | O | O | O (본인만) | X |
| 통계 조회 | O | O | O | O |

### 4. 요청 속도 제한 (Rate Limiting)

| 구분 | 제한 | 기준 | 초과 시 |
|------|------|------|---------|
| 일반 API | 100 req/min | IP + User | HTTP 429 |
| 인증 API | 10 req/min | IP | HTTP 429 + 5분 잠금 |
| 파일 다운로드 | 20 req/min | User | HTTP 429 |
| 벌크 작업 | 5 req/min | User | HTTP 429 |
| WebSocket/SSE | 5 connections | User | 연결 거부 |

Rate Limit 응답 헤더:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1710000060
Retry-After: 30
```

### 5. 표준 에러 응답 형식

모든 API 에러 응답은 아래 통일 형식을 따른다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터의 유효성 검증에 실패했습니다.",
    "details": [
      {
        "field": "url",
        "message": "올바른 URL 형식이 아닙니다.",
        "received": "not-a-url"
      }
    ],
    "requestId": "req_abc123def456",
    "timestamp": "2026-03-14T09:30:00.000Z"
  }
}
```

**표준 에러 코드:**

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|----------|------|
| 400 | `BAD_REQUEST` | 잘못된 요청 형식 |
| 400 | `VALIDATION_ERROR` | Zod 스키마 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 403 | `FORBIDDEN` | 해당 리소스에 대한 권한 없음 |
| 404 | `NOT_FOUND` | 요청한 리소스를 찾을 수 없음 |
| 409 | `CONFLICT` | 리소스 충돌 (중복 등록 등) |
| 422 | `UNPROCESSABLE_ENTITY` | 의미적으로 처리 불가능한 요청 |
| 429 | `RATE_LIMIT_EXCEEDED` | 요청 속도 제한 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |
| 503 | `SERVICE_UNAVAILABLE` | 외부 서비스 장애 (Redis, S3 등) |

### 6. 페이지네이션 (Cursor-based)

대규모 목록 조회에는 커서 기반 페이지네이션을 적용한다. 오프셋 기반 대비 대량 데이터에서 성능이 우수하고, 실시간 데이터 삽입/삭제 시에도 일관된 결과를 보장한다.

**요청 파라미터:**

```
GET /api/sites?limit=20&cursor=eyJpZCI6ImFiYzEyMyJ9&sort=createdAt&order=desc
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `limit` | number | 20 | 페이지당 항목 수 (최소 1, 최대 100) |
| `cursor` | string | null | 다음 페이지 커서 (Base64 인코딩) |
| `sort` | string | `createdAt` | 정렬 기준 필드 |
| `order` | `asc` \| `desc` | `desc` | 정렬 방향 |

**응답 형식:**

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 1523,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "eyJpZCI6Inh5ejc4OSIsImNyZWF0ZWRBdCI6IjIwMjYtMDMtMTRUMDk6MDA6MDAuMDAwWiJ9",
    "prevCursor": null
  }
}
```

### 7. 필터링 및 검색

목록 조회 API에서는 쿼리 파라미터로 필터링과 검색을 지원한다.

```
GET /api/sites?status=active&category=sports_betting&search=토토&createdAfter=2026-01-01&createdBefore=2026-03-14
```

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `search` | string | 전문 검색 (URL, 도메인, 메모 등) |
| `status` | enum | 상태 필터 (active, inactive, closed, monitoring) |
| `category` | enum | 카테고리 필터 |
| `createdAfter` | ISO 8601 | 생성일 시작 범위 |
| `createdBefore` | ISO 8601 | 생성일 종료 범위 |

### 8. 공통 응답 래퍼

**단건 응답:**

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123def456",
    "timestamp": "2026-03-14T09:30:00.000Z"
  }
}
```

**목록 응답:**

```json
{
  "data": [ ... ],
  "pagination": { ... },
  "meta": {
    "requestId": "req_abc123def456",
    "timestamp": "2026-03-14T09:30:00.000Z"
  }
}
```

---

## A. 인증 API (Phase 1)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-001** | POST /api/auth/login -- 관리자 로그인 | 이메일/비밀번호 기반 관리자 로그인을 처리하고 JWT 토큰을 발급한다. `access_token`(유효기간 1시간)과 `refresh_token`(유효기간 7일)을 반환한다. 로그인 실패 시 실패 횟수를 카운트하고, 5회 연속 실패 시 해당 계정을 15분간 잠금 처리한다. 모든 로그인 시도(성공/실패)는 감사 로그에 기록한다. | P0 | Phase 1 | 1. 유효한 이메일/비밀번호로 로그인 시 `access_token`과 `refresh_token`이 발급된다<br>2. 잘못된 비밀번호 입력 시 HTTP 401과 `INVALID_CREDENTIALS` 에러를 반환한다<br>3. 5회 연속 로그인 실패 시 HTTP 429와 `ACCOUNT_LOCKED` 에러를 반환하고 15분간 잠금된다<br>4. 로그인 성공/실패 이벤트가 감사 로그에 IP 주소, User-Agent와 함께 기록된다<br>5. 비밀번호는 bcrypt(cost factor 12) 해시로 비교한다 | NextAuth.js v5 Credentials Provider, bcrypt, PostgreSQL 세션/감사 테이블, Redis (로그인 실패 카운터 TTL) |
| **FR-API-002** | POST /api/auth/logout -- 로그아웃 | 현재 세션의 토큰을 무효화하고 서버 측 세션을 정리한다. `refresh_token`을 블랙리스트에 등록하여 재사용을 방지한다. 로그아웃 이벤트를 감사 로그에 기록한다. | P0 | Phase 1 | 1. 로그아웃 요청 시 HTTP 204를 반환한다<br>2. 이후 동일 `access_token`으로 API 요청 시 HTTP 401을 반환한다<br>3. `refresh_token`이 블랙리스트에 등록되어 토큰 갱신이 불가하다<br>4. 로그아웃 이벤트가 감사 로그에 기록된다 | NextAuth.js v5 signOut, Redis 토큰 블랙리스트 (TTL = refresh_token 잔여 유효기간) |
| **FR-API-003** | GET /api/auth/me -- 현재 사용자 정보 조회 | 현재 인증된 사용자의 프로필 정보(ID, 이메일, 이름, 역할, 권한 목록, 마지막 로그인 시각)를 반환한다. 대시보드 초기 로드 시 사용자 컨텍스트를 설정하는 데 사용한다. | P0 | Phase 1 | 1. 유효한 토큰으로 요청 시 사용자 정보가 JSON으로 반환된다<br>2. 응답에 `id`, `email`, `name`, `role`, `permissions[]`, `lastLoginAt` 필드가 포함된다<br>3. 만료된 토큰으로 요청 시 HTTP 401을 반환한다<br>4. 비활성화된 계정은 HTTP 403과 `ACCOUNT_DISABLED` 에러를 반환한다 | NextAuth.js v5 `auth()` 헬퍼, Prisma User 모델 |
| **FR-API-004** | RBAC 역할 기반 접근 제어 미들웨어 | 모든 보호된 API 엔드포인트에 RBAC 미들웨어를 적용하여 역할 기반 접근 제어를 수행한다. `admin`, `investigator`, `viewer` 3개 역할을 정의하고, 각 역할에 리소스별 CRUD 권한을 매핑한다. 미들웨어는 Next.js Route Handler 래퍼 함수로 구현하며, 권한 부족 시 HTTP 403을 반환하고 접근 시도를 감사 로그에 기록한다. | P0 | Phase 1 | 1. `admin` 역할은 모든 API에 접근할 수 있다<br>2. `investigator` 역할은 사이트/채증 관련 API에 접근할 수 있으나 시스템 설정, 사용자 관리는 불가하다<br>3. `viewer` 역할은 GET 메서드만 허용되고 POST/PATCH/DELETE는 HTTP 403을 반환한다<br>4. 권한 부족 시 접근 시도가 감사 로그에 `ACCESS_DENIED` 이벤트로 기록된다<br>5. 역할 변경 시 기존 토큰이 즉시 무효화되고 재로그인이 필요하다 | NextAuth.js v5 Middleware, `withAuth()` HOF 래퍼, Prisma Role/Permission 모델, PostgreSQL 감사 로그 |

**주요 요청/응답 예시:**

<details>
<summary>POST /api/auth/login</summary>

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123!"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "usr_abc123",
      "email": "admin@example.com",
      "name": "관리자",
      "role": "admin"
    }
  },
  "meta": {
    "requestId": "req_login_001",
    "timestamp": "2026-03-14T09:00:00.000Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "requestId": "req_login_002",
    "timestamp": "2026-03-14T09:00:01.000Z"
  }
}
```
</details>

<details>
<summary>GET /api/auth/me</summary>

**Response (200 OK):**
```json
{
  "data": {
    "id": "usr_abc123",
    "email": "admin@example.com",
    "name": "관리자",
    "role": "admin",
    "permissions": [
      "sites:read", "sites:write", "sites:delete",
      "investigations:read", "investigations:execute",
      "evidence:read", "evidence:download",
      "settings:read", "settings:write",
      "users:read", "users:write",
      "audit:read"
    ],
    "lastLoginAt": "2026-03-14T09:00:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "meta": {
    "requestId": "req_me_001",
    "timestamp": "2026-03-14T09:00:05.000Z"
  }
}
```
</details>

---

## B. 사이트 관리 API (Phase 1)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-005** | GET /api/sites -- 사이트 목록 조회 | 등록된 불법 도박 사이트 목록을 커서 기반 페이지네이션으로 조회한다. 상태(`active`, `inactive`, `blocked`, `pending`), 카테고리(`sports_betting`, `horse_racing`, `casino`, `other_gambling`), 위험도 등급(`high`, `medium`, `low`), 탐지 출처(`manual`, `search`, `crawl`, `sns`), 생성일 범위, 텍스트 검색(URL, 도메인, 메모)으로 필터링한다. 정렬 기준은 `createdAt`, `updatedAt`, `riskScore`, `lastCheckedAt` 중 선택 가능하다. | P0 | Phase 1 | 1. 기본 요청 시 최근 등록 순서로 20건의 사이트가 반환된다<br>2. `status`, `category`, `riskLevel` 필터가 개별 또는 복합으로 동작한다<br>3. `search` 파라미터로 URL/도메인 부분 문자열 검색이 동작한다<br>4. 커서 기반 페이지네이션이 동작하고, `nextCursor`로 다음 페이지 조회가 가능하다<br>5. 응답 시간이 1,000건 이상 데이터에서도 500ms 이내이다 | Prisma `findMany` + cursor pagination, PostgreSQL 인덱스 (status, category, createdAt), Full-text search (`to_tsvector`) |
| **FR-API-006** | POST /api/sites -- 사이트 등록 (단건) | 의심 URL을 단건으로 등록한다. URL 정규화(프로토콜 통일, www 제거, 트레일링 슬래시 제거) 후 중복 여부를 확인하고, 중복 시 HTTP 409를 반환한다. 등록 시 WHOIS/DNS 정보를 비동기로 자동 수집하고, Claude Haiku 4.5로 초기 분류를 수행하여 카테고리와 신뢰도 점수를 부여한다. 등록자 정보와 등록 사유를 메타데이터로 기록한다. | P0 | Phase 1 | 1. 유효한 URL 입력 시 사이트가 등록되고 HTTP 201과 사이트 ID가 반환된다<br>2. URL 정규화 후 기존 사이트와 중복이면 HTTP 409와 기존 사이트 ID를 반환한다<br>3. 등록 직후 WHOIS/DNS 수집 작업이 BullMQ에 비동기로 등록된다<br>4. Claude Haiku 분류 결과(카테고리, 신뢰도)가 비동기로 업데이트된다<br>5. 등록 이벤트가 감사 로그에 기록된다 | Prisma `create`, `normalize-url`, BullMQ (WHOIS/DNS 수집 작업, Claude 분류 작업), Zod 스키마 검증 |
| **FR-API-007** | GET /api/sites/:id -- 사이트 상세 조회 | 특정 사이트의 상세 정보를 조회한다. 기본 정보(URL, 도메인, 상태, 카테고리), 위험도 점수, WHOIS/DNS 정보, AI 분류 결과(카테고리, 신뢰도, 근거), 도메인 변경 이력, 최근 채증 결과 요약, 클러스터 정보(동일 운영자 추정 그룹)를 포함한다. 관계 데이터는 `include` 쿼리 파라미터로 선택적으로 포함한다. | P0 | Phase 1 | 1. 유효한 사이트 ID로 요청 시 상세 정보가 반환된다<br>2. `include=whois,dns,classification,investigations,cluster` 파라미터로 관계 데이터를 선택적으로 포함할 수 있다<br>3. 존재하지 않는 ID 요청 시 HTTP 404를 반환한다<br>4. 소프트 삭제된 사이트는 `admin` 역할만 조회 가능하며 `deleted: true` 플래그가 포함된다<br>5. 조회 이벤트가 감사 로그에 기록된다 | Prisma `findUnique` + `include` 관계 로딩, Zod UUID 파라미터 검증 |
| **FR-API-008** | PATCH /api/sites/:id -- 사이트 정보 수정 | 사이트의 수정 가능 필드(상태, 카테고리, 메모, 위험도 수동 조정, 태그)를 부분 업데이트한다. URL은 변경 불가하며, URL 변경이 필요한 경우 도메인 변경 이력 API(`FR-API-011`)를 통해 처리한다. 변경 전후 값을 감사 로그에 기록하여 변경 추적을 보장한다. | P0 | Phase 1 | 1. 허용된 필드(`status`, `category`, `memo`, `riskScore`, `tags`)만 업데이트된다<br>2. URL 필드 변경 시도 시 HTTP 422와 `FIELD_NOT_MODIFIABLE` 에러를 반환한다<br>3. 변경 전후 값이 감사 로그에 `SITE_UPDATED` 이벤트로 기록된다<br>4. 존재하지 않는 ID 요청 시 HTTP 404를 반환한다<br>5. 낙관적 잠금(`updatedAt` 비교)으로 동시 수정 충돌을 방지한다 | Prisma `update`, Zod partial schema, 감사 로그 미들웨어, `@prisma/client` 낙관적 잠금 |
| **FR-API-009** | DELETE /api/sites/:id -- 사이트 삭제 (소프트 삭제) | 사이트를 소프트 삭제 처리한다. 실제 데이터를 물리적으로 삭제하지 않고, `deletedAt` 타임스탬프를 기록하여 목록 조회에서 제외한다. 삭제 사유를 필수로 입력받으며, 관련 채증 데이터는 보존한다. `admin` 역할만 삭제 가능하며, 영구 삭제(물리 삭제)는 별도 관리 프로세스로 처리한다. | P1 | Phase 1 | 1. 삭제 요청 시 `deletedAt`에 현재 시각이 기록되고 HTTP 204를 반환한다<br>2. 삭제 사유(`reason`)가 필수이며, 미입력 시 HTTP 422를 반환한다<br>3. 소프트 삭제된 사이트는 일반 목록 조회에서 제외된다<br>4. `admin` 역할 이외의 사용자가 요청 시 HTTP 403을 반환한다<br>5. 삭제 이벤트가 감사 로그에 삭제 사유와 함께 기록된다 | Prisma soft delete (`deletedAt` 필드), Prisma middleware (자동 필터), Zod 삭제 사유 검증 |
| **FR-API-010** | POST /api/sites/bulk -- 벌크 URL 임포트 | 다수의 URL을 일괄로 등록한다. CSV 파일 업로드 또는 JSON 배열(최대 500건)을 지원한다. 각 URL에 대해 정규화, 중복 체크, 초기 분류를 수행하고, 처리 결과(성공/중복/오류)를 건별로 반환한다. 대량 처리는 BullMQ 비동기 작업으로 수행하고, 완료 시 알림을 전송한다. | P1 | Phase 1 | 1. JSON 배열로 최대 500건의 URL을 일괄 등록할 수 있다<br>2. CSV 파일(`text/csv`) 업로드를 지원하며, 첫 번째 열을 URL로 파싱한다<br>3. 각 URL의 처리 결과(`created`, `duplicate`, `invalid`)가 건별로 반환된다<br>4. 500건 초과 요청 시 HTTP 422와 `BATCH_SIZE_EXCEEDED` 에러를 반환한다<br>5. 전체 처리 결과 요약(`totalProcessed`, `created`, `duplicates`, `errors`)이 반환된다 | BullMQ (대량 처리 작업), `csv-parse` npm (CSV 파싱), Prisma `createMany`, 트랜잭션 처리 |
| **FR-API-011** | GET /api/sites/:id/history -- 도메인 변경 이력 조회 | 특정 사이트의 도메인 변경(호핑) 이력을 시간순으로 조회한다. 이전 도메인, 변경 감지 일시, 변경 감지 방법(DNS 변경, 리디렉트 추적, 수동 입력), IP 주소 변경 이력을 포함한다. 도메인 호핑 패턴 분석에 활용되는 핵심 데이터로, 커서 기반 페이지네이션을 지원한다. | P1 | Phase 1 | 1. 사이트 ID로 조회 시 도메인 변경 이력이 최신순으로 반환된다<br>2. 각 이력에 `previousDomain`, `newDomain`, `detectedAt`, `detectionMethod`, `ipChanges` 필드가 포함된다<br>3. 변경 이력이 없는 경우 빈 배열을 반환한다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. `detectionMethod` 필터로 감지 방법별 이력 조회가 가능하다 | Prisma DomainHistory 모델, PostgreSQL 인덱스 (siteId, detectedAt) |

**주요 요청/응답 예시:**

<details>
<summary>POST /api/sites</summary>

**Request:**
```json
{
  "url": "https://wego88.com",
  "memo": "텔레그램 채널에서 발견된 의심 사이트",
  "source": "manual",
  "tags": ["텔레그램", "스포츠배팅"]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "site_abc123",
    "url": "https://wego88.com",
    "domain": "wego88.com",
    "status": "pending",
    "category": null,
    "riskScore": null,
    "source": "manual",
    "memo": "텔레그램 채널에서 발견된 의심 사이트",
    "tags": ["텔레그램", "스포츠배팅"],
    "classificationStatus": "pending",
    "whoisStatus": "pending",
    "createdBy": "usr_abc123",
    "createdAt": "2026-03-14T09:00:00.000Z",
    "updatedAt": "2026-03-14T09:00:00.000Z"
  },
  "meta": {
    "requestId": "req_site_001",
    "timestamp": "2026-03-14T09:00:00.000Z"
  }
}
```
</details>

<details>
<summary>GET /api/sites?status=active&category=sports_betting&limit=2</summary>

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "site_abc123",
      "url": "https://wego88.com",
      "domain": "wego88.com",
      "status": "active",
      "category": "sports_betting",
      "riskScore": 85,
      "source": "manual",
      "lastCheckedAt": "2026-03-14T08:30:00.000Z",
      "investigationCount": 3,
      "createdAt": "2026-03-10T00:00:00.000Z"
    },
    {
      "id": "site_def456",
      "url": "https://totohot.com",
      "domain": "totohot.com",
      "status": "active",
      "category": "sports_betting",
      "riskScore": 92,
      "source": "search",
      "lastCheckedAt": "2026-03-14T08:00:00.000Z",
      "investigationCount": 5,
      "createdAt": "2026-03-08T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 342,
    "limit": 2,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "eyJpZCI6InNpdGVfZGVmNDU2In0=",
    "prevCursor": null
  },
  "meta": {
    "requestId": "req_sites_list_001",
    "timestamp": "2026-03-14T09:00:00.000Z"
  }
}
```
</details>

---

## C. 채증 API (Phase 1-2)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-012** | POST /api/investigations -- 채증 작업 생성 | 특정 사이트에 대한 채증 작업을 생성한다. 즉시 실행(`immediate`) 또는 예약 실행(`scheduled`, ISO 8601 일시 지정) 모드를 지원한다. 채증 범위는 1단계만(`stage1`), 2단계까지(`stage1_2`), 전체 3단계(`full`)를 선택할 수 있다. 작업 생성 시 BullMQ 큐에 등록되며, 동시 실행 제한(기본 5개)을 초과하면 대기 큐에 등록된다. | P0 | Phase 1 | 1. 유효한 사이트 ID와 실행 모드로 요청 시 작업이 생성되고 HTTP 201을 반환한다<br>2. `mode: "immediate"` 시 즉시 BullMQ 큐에 등록되어 실행이 시작된다<br>3. `mode: "scheduled"` 시 지정된 일시에 자동 실행된다<br>4. 동일 사이트에 진행 중인 채증이 있으면 HTTP 409를 반환한다<br>5. 작업 생성 이벤트가 감사 로그에 기록된다 | BullMQ `Queue.add()`, Prisma Investigation 모델, Zod 스키마 검증, BullMQ `repeat` (예약 실행) |
| **FR-API-013** | GET /api/investigations -- 채증 작업 목록 조회 | 채증 작업 목록을 커서 기반 페이지네이션으로 조회한다. 상태(`queued`, `in_progress`, `stage_1_complete`, `stage_2_complete`, `stage_3_complete`, `completed`, `failed`, `cancelled`), 채증 단계(`stage1`, `stage2`, `stage3`), 사이트 ID, 생성일 범위로 필터링한다. 각 작업의 현재 진행 상태, 소요 시간, 결과 요약을 포함한다. | P0 | Phase 1 | 1. 기본 요청 시 최근 생성순으로 20건의 작업이 반환된다<br>2. `status`, `stage`, `siteId` 필터가 개별 또는 복합으로 동작한다<br>3. 각 작업에 `status`, `currentStage`, `progress`(0~100), `duration`, `resultSummary` 필드가 포함된다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. 진행 중인 작업은 최신 상태가 반영된다 | Prisma `findMany` + cursor, BullMQ `Job.getState()`, Redis 캐시 (진행 상태) |
| **FR-API-014** | GET /api/investigations/:id -- 채증 작업 상세 조회 | 특정 채증 작업의 상세 정보를 조회한다. 전체 진행 상태, 단계별 결과(1단계: 메인화면 캡처, 2단계: 회원가입/배팅 시작, 3단계: 배팅 실행), 각 단계의 시작/종료 시각, 수집된 파일 목록, 에러 로그, 재시도 이력을 포함한다. `include` 파라미터로 스크린샷 URL, 메타데이터를 선택적으로 포함한다. | P0 | Phase 1 | 1. 유효한 작업 ID로 요청 시 상세 정보가 반환된다<br>2. 단계별 결과에 `status`, `startedAt`, `completedAt`, `filesCollected`, `errors` 필드가 포함된다<br>3. `include=screenshots,metadata,logs` 파라미터로 관계 데이터를 선택적으로 포함할 수 있다<br>4. 진행 중인 작업은 실시간 업데이트된 진행 상태가 반영된다<br>5. 존재하지 않는 ID 요청 시 HTTP 404를 반환한다 | Prisma `findUnique` + `include`, BullMQ `Job.progress`, Redis 실시간 상태 |
| **FR-API-015** | POST /api/investigations/:id/cancel -- 채증 작업 취소 | 대기 중 또는 진행 중인 채증 작업을 취소한다. 대기 중인 작업은 큐에서 즉시 제거하고, 진행 중인 작업은 현재 단계를 완료한 후 중단한다. 이미 완료되거나 취소된 작업에 대한 요청은 HTTP 409를 반환한다. 취소 시점까지 수집된 데이터는 보존한다. | P1 | Phase 1 | 1. 대기 중 작업 취소 시 큐에서 제거되고 상태가 `cancelled`로 변경된다<br>2. 진행 중 작업 취소 시 현재 단계 완료 후 중단되고 상태가 `cancelled`로 변경된다<br>3. 이미 완료/취소된 작업 취소 시 HTTP 409를 반환한다<br>4. 취소 시점까지 수집된 파일과 데이터가 보존된다<br>5. 취소 이벤트가 감사 로그에 취소 사유와 함께 기록된다 | BullMQ `Job.remove()` (대기), `Job.moveToFailed()` (진행), 브라우저 인스턴스 정리 |
| **FR-API-016** | POST /api/investigations/:id/retry -- 채증 작업 재시도 | 실패한 채증 작업을 재시도한다. 전체 처음부터(`full`) 또는 실패한 단계부터(`from_failed_stage`) 재시도를 선택할 수 있다. 재시도 시 프록시 IP를 변경하고, 이전 실행의 에러 로그를 참고하여 재시도 전략을 조정한다. 최대 재시도 횟수(3회)를 초과한 작업은 재시도 불가하다. | P1 | Phase 2 | 1. 실패 상태의 작업에 대해 재시도 요청 시 새 작업이 생성되고 HTTP 201을 반환한다<br>2. `retryMode: "from_failed_stage"` 시 실패한 단계부터 재시작한다<br>3. 실패/취소 상태가 아닌 작업 재시도 시 HTTP 409를 반환한다<br>4. 재시도 횟수가 3회를 초과하면 HTTP 422와 `MAX_RETRIES_EXCEEDED`를 반환한다<br>5. 재시도 시 프록시 IP가 변경되어 이전과 다른 IP로 접속한다 | BullMQ `Queue.add()` (새 작업), 프록시 로테이션, Prisma 재시도 이력 기록 |
| **FR-API-017** | GET /api/investigations/:id/screenshots -- 스크린샷 목록 조회 | 특정 채증 작업에서 수집된 스크린샷 목록을 조회한다. 각 스크린샷의 메타데이터(캡처 시각, 채증 단계, 페이지 URL, 해상도, 파일 크기, SHA-256 해시)와 미리보기 URL(presigned URL)을 반환한다. 단계별 필터와 유형별 필터(풀페이지, 뷰포트, 팝업 등)를 지원한다. | P1 | Phase 2 | 1. 작업 ID로 요청 시 해당 작업의 모든 스크린샷 목록이 반환된다<br>2. 각 항목에 `id`, `stage`, `type`, `url`, `pageUrl`, `capturedAt`, `resolution`, `fileSize`, `sha256Hash`, `previewUrl` 필드가 포함된다<br>3. `previewUrl`은 S3 presigned URL로 30분 유효하다<br>4. `stage` 필터로 특정 단계의 스크린샷만 조회할 수 있다<br>5. 스크린샷이 없는 경우 빈 배열을 반환한다 | Prisma Screenshot 모델, S3/MinIO presigned URL (`getSignedUrl`), 이미지 메타데이터 |
| **FR-API-018** | GET /api/investigations/:id/evidence -- 증거 파일 목록 조회 | 특정 채증 작업에서 생성된 증거 파일 목록을 조회한다. 스크린샷, HTML 소스, WARC 아카이브, 네트워크 로그, 메타데이터 JSON, 해시 매니페스트, 타임스탬프 증명 파일의 메타 정보를 반환한다. 각 파일의 무결성 상태(`verified`, `pending`, `tampered`)를 포함한다. | P1 | Phase 2 | 1. 작업 ID로 요청 시 모든 증거 파일 메타 정보가 반환된다<br>2. 각 항목에 `id`, `fileName`, `fileType`, `fileSize`, `sha256Hash`, `integrityStatus`, `createdAt` 필드가 포함된다<br>3. 파일 유형: `screenshot`, `html`, `warc`, `network_log`, `metadata`, `hash_manifest`, `timestamp_proof`<br>4. 무결성 상태가 각 파일에 표시된다<br>5. 파일 유형별 필터가 동작한다 | Prisma EvidenceFile 모델, S3/MinIO 파일 목록, 해시 검증 상태 |
| **FR-API-019** | GET /api/investigations/queue -- 채증 큐 상태 조회 | BullMQ 채증 작업 큐의 실시간 상태를 조회한다. 대기 중(`waiting`), 활성(`active`), 완료(`completed`), 실패(`failed`), 지연(`delayed`) 작업 수와 큐 처리율(jobs/분), 평균 처리 시간을 반환한다. 시스템 운영 모니터링 및 대시보드 표시에 활용한다. | P1 | Phase 1 | 1. 요청 시 큐 상태 요약이 즉시 반환된다<br>2. 응답에 `waiting`, `active`, `completed`, `failed`, `delayed` 작업 수가 포함된다<br>3. `throughput`(분당 처리 건수)과 `avgProcessingTime`(평균 처리 시간)이 포함된다<br>4. 최근 실패 작업 상위 5건의 요약이 포함된다<br>5. 응답 시간이 200ms 이내이다 | BullMQ `Queue.getJobCounts()`, `Queue.getMetrics()`, Redis 캐시 (통계 데이터 1분 TTL) |

**주요 요청/응답 예시:**

<details>
<summary>POST /api/investigations</summary>

**Request:**
```json
{
  "siteId": "site_abc123",
  "mode": "immediate",
  "scope": "full",
  "options": {
    "proxyCountry": "KR",
    "captureScreenshots": true,
    "captureHtml": true,
    "captureWarc": true,
    "captureNetworkLog": true
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "inv_xyz789",
    "siteId": "site_abc123",
    "status": "queued",
    "mode": "immediate",
    "scope": "full",
    "currentStage": null,
    "progress": 0,
    "queuePosition": 3,
    "estimatedStartAt": "2026-03-14T09:02:00.000Z",
    "createdBy": "usr_abc123",
    "createdAt": "2026-03-14T09:00:00.000Z"
  },
  "meta": {
    "requestId": "req_inv_001",
    "timestamp": "2026-03-14T09:00:00.000Z"
  }
}
```
</details>

<details>
<summary>GET /api/investigations/:id (진행 중인 작업)</summary>

**Response (200 OK):**
```json
{
  "data": {
    "id": "inv_xyz789",
    "siteId": "site_abc123",
    "status": "in_progress",
    "mode": "immediate",
    "scope": "full",
    "currentStage": "stage2",
    "progress": 55,
    "stages": {
      "stage1": {
        "status": "completed",
        "startedAt": "2026-03-14T09:02:00.000Z",
        "completedAt": "2026-03-14T09:02:45.000Z",
        "duration": 45000,
        "filesCollected": 5,
        "errors": []
      },
      "stage2": {
        "status": "in_progress",
        "startedAt": "2026-03-14T09:02:46.000Z",
        "completedAt": null,
        "duration": null,
        "filesCollected": 2,
        "errors": []
      },
      "stage3": {
        "status": "pending",
        "startedAt": null,
        "completedAt": null,
        "duration": null,
        "filesCollected": 0,
        "errors": []
      }
    },
    "retryCount": 0,
    "proxyInfo": {
      "ip": "203.xxx.xxx.xxx",
      "country": "KR",
      "provider": "IPRoyal"
    },
    "createdBy": "usr_abc123",
    "createdAt": "2026-03-14T09:00:00.000Z",
    "startedAt": "2026-03-14T09:02:00.000Z"
  },
  "meta": {
    "requestId": "req_inv_detail_001",
    "timestamp": "2026-03-14T09:05:00.000Z"
  }
}
```
</details>

---

## D. 증거 관리 API (Phase 1-2)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-020** | GET /api/evidence/:id -- 증거 상세 조회 | 특정 증거 패키지의 상세 정보를 조회한다. 증거 패키지 내 모든 파일 목록(스크린샷, HTML, WARC, 메타데이터, 해시 매니페스트, 타임스탬프 증명), 무결성 검증 상태, 최근 검증 일시, 접근 이력 요약, Chain of Custody 타임라인을 포함한다. 증거 조회 이벤트를 감사 로그에 기록한다. | P0 | Phase 1 | 1. 유효한 증거 ID로 요청 시 패키지 상세 정보가 반환된다<br>2. 응답에 `files[]`, `integrityStatus`, `lastVerifiedAt`, `chainOfCustody[]` 필드가 포함된다<br>3. 각 파일에 `fileName`, `fileType`, `fileSize`, `sha256Hash`, `downloadUrl` 정보가 포함된다<br>4. 증거 조회 이벤트가 감사 로그에 접근자 ID와 함께 기록된다<br>5. 존재하지 않는 증거 ID 요청 시 HTTP 404를 반환한다 | Prisma EvidencePackage 모델, S3/MinIO presigned URL, PostgreSQL 감사 로그 |
| **FR-API-021** | GET /api/evidence/:id/download -- 증거 패키지 다운로드 (ZIP) | 증거 패키지를 ZIP 파일로 압축하여 다운로드한다. ZIP에는 `evidence.warc.gz`, `screenshot.png`, `page.html`, `metadata.json`, `hash_manifest.sha256`, `timestamp_proof.ots`, `collection_log.json`이 포함된다. 대용량 패키지(100MB 이상)는 스트리밍 다운로드를 지원한다. 다운로드 이벤트는 감사 로그에 기록한다. | P1 | Phase 2 | 1. 요청 시 `Content-Type: application/zip`으로 ZIP 파일이 다운로드된다<br>2. 파일명이 `evidence_{siteId}_{timestamp}.zip` 형식이다<br>3. ZIP 내 표준 증거 패키지 구조(7개 파일)가 포함된다<br>4. 100MB 이상 패키지도 스트리밍으로 다운로드가 완료된다<br>5. 다운로드 이벤트가 감사 로그에 다운로더 ID, 파일 크기와 함께 기록된다 | `archiver` npm (ZIP 스트리밍 생성), S3/MinIO `getObject`, Node.js Streams, Response 스트리밍 |
| **FR-API-022** | POST /api/evidence/:id/verify -- 증거 무결성 검증 | 증거 패키지의 무결성을 검증한다. 모든 파일의 SHA-256 해시를 재계산하여 `hash_manifest.sha256`의 기록값과 대조하고, OpenTimestamps(.ots) 비트코인 블록체인 검증과 RFC 3161 타임스탬프 검증을 수행한다. 검증 결과를 `VERIFIED`(전체 통과), `PARTIAL`(일부 통과), `TAMPERED`(변조 감지)로 반환한다. | P0 | Phase 1 | 1. 요청 시 해시 검증, OpenTimestamps 검증, RFC 3161 검증이 순차 수행된다<br>2. 모든 파일 해시 일치 + 타임스탬프 유효 시 `VERIFIED` 상태를 반환한다<br>3. 1개 이상 해시 불일치 시 `TAMPERED` 상태와 불일치 파일 목록을 반환한다<br>4. 타임스탬프만 미확인(비트코인 미확정 등) 시 `PARTIAL` 상태를 반환한다<br>5. 검증 결과가 감사 로그에 기록되고 `lastVerifiedAt`이 업데이트된다 | Node.js `crypto` (SHA-256 재계산), `opentimestamps` CLI, RFC 3161 클라이언트, Prisma 검증 이력 |
| **FR-API-023** | GET /api/evidence/:id/audit-log -- 증거 감사 로그 조회 | 특정 증거 패키지에 대한 모든 감사 이벤트를 시간순으로 조회한다. 수집(COLLECTION), 해시 생성(HASH_CREATED), 타임스탬프 생성(TIMESTAMP_CREATED), 검증(VERIFIED), 조회(ACCESSED), 다운로드(DOWNLOADED), 상태 변경(STATUS_CHANGED) 이벤트를 포함한다. Chain of Custody 입증을 위한 법적 증거 자료로 활용된다. | P1 | Phase 2 | 1. 증거 ID로 요청 시 관련 감사 이벤트가 시간순으로 반환된다<br>2. 각 이벤트에 `eventType`, `timestamp`, `actorId`, `actorRole`, `details`, `ipAddress` 필드가 포함된다<br>3. 감사 로그는 수정/삭제 불가능하며 조회만 가능하다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. `eventType` 필터로 특정 유형의 이벤트만 조회할 수 있다 | PostgreSQL 감사 테이블 (INSERT-only), Prisma 읽기 전용 모델, 해시 체인 무결성 |
| **FR-API-024** | POST /api/evidence/:id/report -- 법원 제출용 보고서 생성 (PDF) | 증거 패키지를 기반으로 법원 제출용 PDF 보고서를 생성한다. Claude Sonnet 4.6을 사용하여 한국어 수사 보고서 본문을 자동 생성하고, 스크린샷, 해시값, 타임스탬프 검증 결과를 PDF에 삽입한다. 보고서 생성은 비동기로 수행되며, 완료 시 다운로드 URL을 반환한다. 보고서 템플릿(수사 착수용, 법원 제출용, 내부 보고용)을 선택할 수 있다. | P2 | Phase 2 | 1. 요청 시 비동기로 PDF 보고서 생성 작업이 등록되고 HTTP 202를 반환한다<br>2. 응답에 `reportId`와 `statusUrl`이 포함되어 생성 상태를 폴링할 수 있다<br>3. 생성 완료 시 PDF 파일의 presigned 다운로드 URL을 반환한다<br>4. PDF에 스크린샷, 해시값, 타임스탬프, 수집 과정 요약이 포함된다<br>5. `templateId` 파라미터로 보고서 템플릿을 선택할 수 있다 | Claude Sonnet 4.6 API (보고서 본문 생성), `@react-pdf/renderer` 또는 Playwright `page.pdf()`, BullMQ (비동기 생성), S3/MinIO (PDF 저장) |

**주요 요청/응답 예시:**

<details>
<summary>POST /api/evidence/:id/verify</summary>

**Response (200 OK):**
```json
{
  "data": {
    "evidenceId": "evd_abc123",
    "overallStatus": "VERIFIED",
    "verifiedAt": "2026-03-14T09:30:00.000Z",
    "verifiedBy": "usr_abc123",
    "hashVerification": {
      "status": "PASSED",
      "totalFiles": 7,
      "verifiedFiles": 7,
      "failedFiles": 0,
      "details": [
        {
          "fileName": "screenshot.png",
          "expectedHash": "a1b2c3d4e5f6...",
          "actualHash": "a1b2c3d4e5f6...",
          "status": "MATCH"
        }
      ]
    },
    "openTimestamps": {
      "status": "VERIFIED",
      "blockHeight": 890123,
      "blockTimestamp": "2026-03-14T08:15:00.000Z",
      "confirmations": 6
    },
    "rfc3161": {
      "status": "VERIFIED",
      "tsaServer": "freetsa.org",
      "genTime": "2026-03-14T08:00:05.000Z",
      "serialNumber": "ABC123DEF456"
    }
  },
  "meta": {
    "requestId": "req_verify_001",
    "timestamp": "2026-03-14T09:30:00.000Z"
  }
}
```
</details>

---

## E. 탐지 엔진 API (Phase 2-3)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-025** | POST /api/detection/scan -- 수동 탐지 실행 | 키워드 세트를 기반으로 수동 탐지 스캔을 즉시 실행한다. Google Custom Search API를 호출하여 검색 결과를 수집하고, Crawlee 크롤러로 발견된 URL을 탐색하며, Claude Haiku 4.5로 AI 분류를 수행하는 전체 파이프라인을 트리거한다. 스캔 결과는 비동기로 처리되며, 완료 시 알림을 전송한다. | P1 | Phase 2 | 1. 키워드 세트 ID 또는 직접 키워드 입력으로 스캔을 시작할 수 있다<br>2. 요청 시 HTTP 202를 반환하고 비동기로 스캔이 실행된다<br>3. 응답에 `scanId`와 `statusUrl`이 포함된다<br>4. 스캔 완료 시 신규 탐지 사이트 수, 중복 사이트 수, AI 분류 결과 요약이 반환된다<br>5. 동시 스캔은 최대 3건으로 제한하고, 초과 시 HTTP 429를 반환한다 | Google Custom Search API, Crawlee PlaywrightCrawler, Claude Haiku 4.5, BullMQ (스캔 작업 큐) |
| **FR-API-026** | GET /api/detection/results -- 탐지 결과 목록 조회 | 탐지 스캔 결과 목록을 커서 기반 페이지네이션으로 조회한다. 스캔 ID별, 탐지 출처별(`search`, `crawl`, `sns`), AI 분류 카테고리별, 신뢰도 점수 범위별, 처리 상태별(`pending`, `confirmed`, `rejected`)로 필터링한다. 각 결과에 URL, AI 분류 결과, 신뢰도 점수, 위험도 점수를 포함한다. | P1 | Phase 2 | 1. 기본 요청 시 최근 탐지순으로 20건의 결과가 반환된다<br>2. `scanId`, `source`, `category`, `minConfidence`, `maxConfidence`, `processingStatus` 필터가 동작한다<br>3. 각 결과에 `url`, `category`, `confidence`, `riskScore`, `source`, `processingStatus` 필드가 포함된다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. 확인/반려 처리가 되지 않은(`pending`) 결과 수가 별도로 반환된다 | Prisma DetectionResult 모델, PostgreSQL 인덱스, 복합 필터 쿼리 |
| **FR-API-027** | GET /api/detection/keywords -- 키워드 목록 조회 | 등록된 탐지 키워드 목록을 카테고리별로 조회한다. 각 키워드의 활성/비활성 상태, 마지막 사용 일시, 탐지 건수, 정밀도(탐지 결과 중 실제 불법 사이트 비율) 통계를 포함한다. 카테고리별 필터와 검색을 지원한다. | P2 | Phase 3 | 1. 요청 시 모든 키워드가 카테고리별로 그룹화되어 반환된다<br>2. 각 키워드에 `id`, `keyword`, `category`, `isActive`, `lastUsedAt`, `detectionCount`, `precision` 필드가 포함된다<br>3. `category` 필터로 특정 카테고리의 키워드만 조회할 수 있다<br>4. `search` 파라미터로 키워드 문자열 검색이 동작한다<br>5. 비활성화된 키워드도 목록에 포함되되 `isActive: false`로 구분된다 | Prisma Keyword 모델, PostgreSQL 집계 쿼리 (탐지 건수, 정밀도) |
| **FR-API-028** | POST /api/detection/keywords -- 키워드 추가 | 새로운 탐지 키워드를 등록한다. 단건 또는 배열(최대 50건)로 등록 가능하며, 카테고리 분류를 필수로 지정한다. 중복 키워드는 HTTP 409를 반환한다. 키워드 등록 시 Claude Haiku를 사용하여 유사 키워드(동의어, 변형어, 은어)를 자동 추천하는 옵션을 제공한다. | P2 | Phase 3 | 1. 단건 키워드 등록 시 HTTP 201을 반환한다<br>2. 배열로 최대 50건을 일괄 등록할 수 있다<br>3. 중복 키워드 등록 시 HTTP 409와 기존 키워드 ID를 반환한다<br>4. `autoSuggest: true` 옵션 시 Claude Haiku가 유사 키워드 10개를 추천하여 응답에 포함한다<br>5. 키워드 등록 이벤트가 감사 로그에 기록된다 | Prisma `create`/`createMany`, Claude Haiku 4.5 (유사 키워드 생성), Zod 스키마 검증 |
| **FR-API-029** | DELETE /api/detection/keywords/:id -- 키워드 삭제 | 등록된 키워드를 소프트 삭제(비활성화)한다. 물리적 삭제가 아닌 `isActive: false`로 상태를 변경하여 탐지 실행에서 제외한다. 키워드의 과거 탐지 이력과 통계는 보존한다. | P2 | Phase 3 | 1. 삭제 요청 시 키워드가 비활성화되고 HTTP 204를 반환한다<br>2. 비활성화된 키워드는 탐지 스캔에서 자동 제외된다<br>3. 존재하지 않는 키워드 ID 요청 시 HTTP 404를 반환한다<br>4. 과거 탐지 이력과 통계가 보존된다<br>5. 삭제 이벤트가 감사 로그에 기록된다 | Prisma soft delete (`isActive` 필드), 감사 로그 |
| **FR-API-030** | GET /api/detection/domains/:id/status -- 도메인 생존 상태 조회 | 특정 도메인의 현재 생존 상태와 상태 변경 이력을 조회한다. DNS 조회 결과, HTTP 응답 상태, Cloudflare 방어 여부, 마지막 체크 시각, 생존 기간(최초 감지일부터 현재까지), 상태 변경 타임라인을 반환한다. | P1 | Phase 2 | 1. 도메인 ID로 요청 시 현재 생존 상태가 반환된다<br>2. 응답에 `currentStatus`(`alive`, `dead`, `redirected`, `cloudflare_blocked`), `lastCheckedAt`, `upSince`, `downSince` 필드가 포함된다<br>3. `includeHistory=true` 시 상태 변경 타임라인이 포함된다<br>4. DNS 레코드(A, CNAME, NS) 현재값이 포함된다<br>5. `checkNow=true` 파라미터로 즉시 상태 체크를 트리거할 수 있다 | Node.js `dns.resolve()`, got-scraping (HTTP HEAD), Redis 캐시 (최근 상태), BullMQ (즉시 체크) |

---

## F. 수동 개입 API (Phase 2)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-031** | GET /api/manual-queue -- 수동 개입 큐 목록 조회 | CAPTCHA 자동 풀이 실패 또는 SMS OTP 자동 입력 실패로 수동 개입이 필요한 세션 목록을 조회한다. 각 세션의 개입 유형(`captcha`, `otp`, `unknown_form`), 대기 시간, 사이트 URL, 현재 스크린샷 미리보기, 만료까지 남은 시간을 포함한다. 대기 시간 기준 내림차순(오래된 것 우선)으로 정렬한다. | P1 | Phase 2 | 1. 요청 시 수동 개입 대기 중인 세션 목록이 대기 시간순으로 반환된다<br>2. 각 항목에 `id`, `type`(captcha/otp/unknown_form), `siteUrl`, `waitingSince`, `timeRemaining`, `screenshotUrl`, `investigationId` 필드가 포함된다<br>3. 타임아웃(5분) 초과 세션은 자동으로 `expired` 상태로 전환된다<br>4. `type` 필터로 개입 유형별 조회가 가능하다<br>5. 실시간 업데이트가 SSE를 통해 제공된다 | BullMQ (수동 개입 큐), Redis (세션 상태 TTL), S3 presigned URL (스크린샷), SSE (실시간 업데이트) |
| **FR-API-032** | POST /api/manual-queue/:id/resolve -- 수동 개입 완료 처리 | 수동 개입 세션의 완료를 처리한다. CAPTCHA 풀이 완료 또는 OTP 입력 완료 후 자동화 파이프라인을 재개한다. 개입자 ID, 소요 시간, 결과(success/failed)를 기록한다. 실패 시 해당 세션을 `failed`로 처리하고 채증 작업을 다음 단계로 진행하거나 스킵한다. | P1 | Phase 2 | 1. 완료 처리 시 브라우저 자동화가 재개되고 HTTP 200을 반환한다<br>2. `result: "success"` 시 채증 파이프라인이 다음 단계로 진행된다<br>3. `result: "failed"` 시 해당 단계를 스킵하고 가능한 다음 단계로 진행된다<br>4. 만료된 세션에 대한 완료 요청 시 HTTP 410(`GONE`)을 반환한다<br>5. 개입 결과가 감사 로그에 개입자 ID, 소요 시간과 함께 기록된다 | BullMQ `Job.moveToCompleted()`, rebrowser-playwright 세션 재개, Prisma 수동 개입 이력 |
| **FR-API-033** | GET /api/manual-queue/:id/stream -- CDP WebSocket 스트리밍 URL 반환 | 수동 개입이 필요한 브라우저 세션의 CDP(Chrome DevTools Protocol) WebSocket 스트리밍 URL을 반환한다. 대시보드에서 원격 브라우저 화면을 실시간으로 표시하고, 사용자의 마우스/키보드 입력을 원격 브라우저에 전달하기 위한 연결 정보를 제공한다. WebSocket URL은 1회용이며 세션 만료 시 자동 무효화된다. | P1 | Phase 2 | 1. 요청 시 CDP WebSocket URL과 세션 메타데이터가 반환된다<br>2. 응답에 `wsUrl`, `sessionId`, `expiresAt`, `browserInfo` 필드가 포함된다<br>3. WebSocket URL은 1회 연결 후 재사용 불가하다<br>4. 세션 만료(5분) 시 WebSocket 연결이 자동 종료된다<br>5. 만료된 세션의 URL 요청 시 HTTP 410을 반환한다 | rebrowser-playwright `--remote-debugging-port`, CDP WebSocket proxy, 일회성 토큰 생성 |

---

## G. AI 분류 API (Phase 2)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-034** | GET /api/classification/review-queue -- AI 분류 검토 큐 조회 | Claude Haiku 4.5의 AI 분류 결과 중 신뢰도 점수가 임계값(기본 0.7) 미만인 항목의 검토 대기 큐를 조회한다. 각 항목에 사이트 URL, 스크린샷 미리보기, AI 분류 결과(카테고리, 신뢰도, 판단 근거), 검토 상태(`pending`, `approved`, `rejected`)를 포함한다. 신뢰도 점수 오름차순(낮은 것 우선)으로 정렬한다. | P1 | Phase 2 | 1. 요청 시 검토 대기(`pending`) 항목이 신뢰도 오름차순으로 반환된다<br>2. 각 항목에 `id`, `siteId`, `siteUrl`, `screenshotUrl`, `aiResult`(`category`, `confidence`, `evidence[]`), `reviewStatus` 필드가 포함된다<br>3. `reviewStatus` 필터로 `pending`/`approved`/`rejected` 항목을 구분 조회할 수 있다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. 검토 대기 건수(`pendingCount`)가 응답 메타에 포함된다 | Prisma ClassificationResult 모델, PostgreSQL 인덱스 (confidence, reviewStatus) |
| **FR-API-035** | POST /api/classification/:id/approve -- 분류 결과 승인 | AI 분류 결과를 검토 후 승인한다. 승인 시 해당 사이트의 카테고리가 AI 분류 결과로 확정되고, 검토 결과는 향후 ML 모델 학습 데이터로 축적된다. 승인자 ID와 승인 시각을 기록한다. | P1 | Phase 2 | 1. 승인 요청 시 분류 상태가 `approved`로 변경되고 HTTP 200을 반환한다<br>2. 사이트의 `category`가 AI 분류 결과로 확정 업데이트된다<br>3. 이미 승인/반려된 항목 재승인 시 HTTP 409를 반환한다<br>4. 승인 결과가 학습 데이터 테이블에 자동 기록된다<br>5. 승인 이벤트가 감사 로그에 승인자 ID와 함께 기록된다 | Prisma `update`, 학습 데이터 적재 (PostgreSQL training_data 테이블), 감사 로그 |
| **FR-API-036** | POST /api/classification/:id/reject -- 분류 결과 반려/수정 | AI 분류 결과를 반려하고 올바른 카테고리로 수정한다. 반려 시 수정된 카테고리와 반려 사유를 필수로 입력받으며, 수정된 결과는 학습 데이터로 축적된다. 특히 false positive(정상 사이트를 불법으로 분류)와 false negative(불법 사이트를 정상으로 분류) 패턴을 기록하여 프롬프트 개선에 활용한다. | P1 | Phase 2 | 1. 반려 요청 시 `correctedCategory`와 `rejectionReason`이 필수이며, 미입력 시 HTTP 422를 반환한다<br>2. 분류 상태가 `rejected`로 변경되고 사이트 카테고리가 수정된 값으로 업데이트된다<br>3. 반려 결과가 학습 데이터 테이블에 `corrected` 라벨로 기록된다<br>4. false positive/negative 패턴이 별도로 집계된다<br>5. 반려 이벤트가 감사 로그에 기록된다 | Prisma `update`, 학습 데이터 적재, 감사 로그, FP/FN 패턴 집계 테이블 |

---

## H. 통계/대시보드 API (Phase 1-3)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-037** | GET /api/dashboard/summary -- 대시보드 요약 KPI | 대시보드 메인 페이지에 표시할 핵심 KPI를 반환한다. 총 등록 사이트 수, 금일/금주/금월 신규 등록 수, 채증 진행/완료/실패 건수, 1단계/3단계 채증 성공률, 수동 개입 대기 건수, 시스템 가동률, 외부 서비스 상태 요약을 포함한다. 캐시(1분 TTL)를 적용하여 대시보드 로드 성능을 보장한다. | P0 | Phase 1 | 1. 요청 시 200ms 이내에 KPI 데이터가 반환된다<br>2. 응답에 `totalSites`, `newSitesToday/Week/Month`, `investigationStats`(진행/완료/실패), `successRates`(stage1/stage3), `manualQueuePending`, `systemUptime` 필드가 포함된다<br>3. 데이터가 1분 캐시되어 동일 요청 반복 시 캐시에서 반환된다<br>4. 모든 역할이 접근 가능하다<br>5. 실시간성이 요구되는 지표(수동 개입 대기)는 캐시 없이 직접 조회한다 | PostgreSQL 집계 쿼리, Redis 캐시 (1분 TTL), BullMQ 큐 카운트, Prisma `count`/`aggregate` |
| **FR-API-038** | GET /api/dashboard/activity -- 최근 활동 피드 | 시스템의 최근 활동을 시간순으로 반환한다. 사이트 등록, 채증 시작/완료/실패, 수동 개입 요청/완료, AI 분류 완료, 도메인 상태 변경, 시스템 알림 등의 이벤트를 통합 피드로 제공한다. 실시간 업데이트는 SSE(Server-Sent Events)를 통해 Push한다. | P1 | Phase 1 | 1. 기본 요청 시 최근 50건의 활동이 시간역순으로 반환된다<br>2. 각 활동에 `type`, `message`, `actorId`, `resourceId`, `resourceType`, `timestamp` 필드가 포함된다<br>3. `type` 필터로 특정 유형의 활동만 조회할 수 있다<br>4. 커서 기반 페이지네이션이 동작한다<br>5. SSE 엔드포인트(`/api/dashboard/activity/stream`)로 실시간 Push가 동작한다 | PostgreSQL 활동 로그 테이블, SSE (ReadableStream), Redis Pub/Sub (이벤트 전파) |
| **FR-API-039** | GET /api/stats/detection -- 탐지 통계 (기간별) | 불법 사이트 탐지 통계를 기간별로 집계하여 반환한다. 일별/주별/월별 탐지 건수, 탐지 출처별 분포, AI 분류 카테고리별 분포, 신규 vs 기존 사이트 비율, 탐지 정밀도 추이를 포함한다. 대시보드 차트 데이터로 활용한다. | P1 | Phase 2 | 1. `period`(`daily`, `weekly`, `monthly`), `from`, `to` 파라미터로 기간을 지정할 수 있다<br>2. 응답에 기간별 `detectedCount`, `bySource`(manual/search/crawl/sns), `byCategory`, `newVsExisting`, `precision` 필드가 포함된다<br>3. 기본 기간은 최근 30일이다<br>4. 최대 조회 범위는 1년이며, 초과 시 HTTP 422를 반환한다<br>5. 응답 시간이 1초 이내이다 | PostgreSQL `DATE_TRUNC` 집계, Prisma `groupBy`, Redis 캐시 (일 단위 통계 24시간 TTL) |
| **FR-API-040** | GET /api/stats/investigation -- 채증 통계 (기간별) | 채증 작업 통계를 기간별로 집계하여 반환한다. 일별/주별/월별 채증 수행 건수, 단계별 성공률(1단계/2단계/3단계), 평균 소요 시간, 실패 원인별 분포, 수동 개입 비율, 프록시/SMS 서비스 사용량을 포함한다. | P1 | Phase 2 | 1. `period`, `from`, `to` 파라미터로 기간을 지정할 수 있다<br>2. 응답에 `totalInvestigations`, `successRateByStage`, `avgDuration`, `failureReasons`, `manualInterventionRate` 필드가 포함된다<br>3. `siteId` 파라미터로 특정 사이트의 채증 통계만 조회할 수 있다<br>4. 기본 기간은 최근 30일이다<br>5. 차트 렌더링에 적합한 시계열 데이터 형식으로 반환된다 | PostgreSQL 집계 쿼리, Prisma `aggregate`/`groupBy`, Redis 캐시 |
| **FR-API-041** | GET /api/stats/categories -- 카테고리별 사이트 분포 | 등록된 사이트의 카테고리별 분포 통계를 반환한다. 스포츠 도박, 불법 경마, 카지노, 기타 도박, 미분류(비도박 포함)의 5개 카테고리별 사이트 수, 전체 대비 비율, 기간별 추이(증감)를 포함한다. 대시보드 파이 차트 및 트렌드 차트 데이터로 활용한다. | P1 | Phase 3 | 1. 요청 시 카테고리별 사이트 수와 비율이 반환된다<br>2. 각 카테고리에 `category`, `count`, `percentage`, `trend`(전월 대비 증감) 필드가 포함된다<br>3. `from`, `to` 파라미터로 기간별 추이를 조회할 수 있다<br>4. `activeOnly=true` 파라미터로 활성 사이트만 집계할 수 있다<br>5. 미분류 사이트 수가 별도로 표시된다 | PostgreSQL `GROUP BY category`, Prisma `groupBy`, Redis 캐시 (1시간 TTL) |

**주요 요청/응답 예시:**

<details>
<summary>GET /api/dashboard/summary</summary>

**Response (200 OK):**
```json
{
  "data": {
    "totalSites": 1523,
    "newSites": {
      "today": 12,
      "thisWeek": 48,
      "thisMonth": 187
    },
    "investigations": {
      "in_progress": 3,
      "completed": 1245,
      "failed": 78,
      "queued": 15
    },
    "successRates": {
      "stage1": 0.953,
      "stage3": 0.724
    },
    "manualQueue": {
      "pending": 2,
      "avgWaitTime": 180
    },
    "system": {
      "uptime": 0.998,
      "lastIncident": null
    },
    "externalServices": {
      "smsProvider": { "status": "healthy", "balance": 245.50 },
      "captchaSolver": { "status": "healthy", "balance": 18.70 },
      "proxy": { "status": "healthy", "activeIPs": 50 }
    }
  },
  "meta": {
    "requestId": "req_dashboard_001",
    "timestamp": "2026-03-14T09:00:00.000Z",
    "cached": true,
    "cacheExpiresAt": "2026-03-14T09:01:00.000Z"
  }
}
```
</details>

---

## I. 시스템 API (Phase 1)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-042** | GET /api/system/health -- 시스템 헬스 체크 | 시스템의 전반적인 건강 상태를 확인한다. 애플리케이션 서버, PostgreSQL 데이터베이스, Redis, BullMQ 큐, S3/MinIO 스토리지의 연결 상태를 개별적으로 확인하고, 전체 상태(`healthy`, `degraded`, `unhealthy`)를 판별한다. 인증 없이 접근 가능하며, 로드 밸런서 및 모니터링 시스템의 헬스 체크 엔드포인트로 사용한다. | P0 | Phase 1 | 1. 인증 없이 접근 가능하다<br>2. 모든 서비스 정상 시 HTTP 200과 `status: "healthy"`를 반환한다<br>3. 일부 서비스 장애 시 HTTP 200과 `status: "degraded"` 및 장애 서비스 목록을 반환한다<br>4. 핵심 서비스(DB, Redis) 장애 시 HTTP 503과 `status: "unhealthy"`를 반환한다<br>5. 응답 시간이 500ms 이내이며, 개별 서비스 체크 타임아웃은 3초이다 | Prisma `$queryRaw('SELECT 1')`, Redis `PING`, BullMQ 큐 연결 확인, S3 `headBucket`, `process.uptime()` |
| **FR-API-043** | GET /api/system/services -- 외부 서비스 상태 확인 | SMS 가상번호 서비스(PVAPins, GrizzlySMS), CAPTCHA 솔버(CapSolver, 2Captcha), 프록시 서비스(IPRoyal), Claude API, Google Custom Search API 등 외부 서비스의 연결 상태, 잔여 크레딧/할당량, 응답 시간을 확인한다. 서비스별 상태를 개별적으로 반환한다. | P1 | Phase 1 | 1. 요청 시 모든 외부 서비스의 상태가 개별적으로 반환된다<br>2. 각 서비스에 `name`, `status`(healthy/degraded/down), `balance`(잔여 크레딧), `responseTime`, `lastCheckedAt` 필드가 포함된다<br>3. 잔여 크레딧이 임계값(20%) 미만인 서비스에 `warning` 플래그가 부여된다<br>4. 서비스 연결 실패 시 해당 서비스만 `down`으로 표시하고 나머지는 정상 반환한다<br>5. 개별 서비스 체크 타임아웃은 5초이다 | 각 서비스 API 호출 (balance check), Redis 캐시 (5분 TTL), Promise.allSettled (병렬 체크) |
| **FR-API-044** | GET /api/audit-log -- 전체 감사 로그 조회 | 시스템 전체의 감사 로그를 커서 기반 페이지네이션으로 조회한다. 이벤트 유형(`AUTH`, `SITE`, `INVESTIGATION`, `EVIDENCE`, `SYSTEM`, `ACCESS`), 행위자, 대상 리소스, 일시 범위로 필터링한다. `admin` 역할은 전체 로그를, `investigator`는 본인 활동 로그만 조회할 수 있다. 감사 로그는 수정/삭제 불가(INSERT-only)하다. | P1 | Phase 1 | 1. `admin` 역할은 전체 감사 로그를 조회할 수 있다<br>2. `investigator` 역할은 본인(`actorId = 현재 사용자`)의 로그만 조회할 수 있다<br>3. `eventType`, `actorId`, `resourceType`, `from`, `to` 필터가 동작한다<br>4. 각 로그에 `id`, `eventType`, `actorId`, `actorRole`, `resourceType`, `resourceId`, `action`, `details`, `ipAddress`, `timestamp` 필드가 포함된다<br>5. 커서 기반 페이지네이션이 동작한다 | PostgreSQL 감사 테이블 (INSERT-only, REVOKE UPDATE/DELETE), Prisma 읽기 전용, RBAC 필터 |
| **FR-API-045** | GET /api/system/settings -- 시스템 설정 조회 | 시스템 운영 설정값을 조회한다. 채증 동시 실행 수, 재시도 최대 횟수, CAPTCHA 솔버 우선순위, SMS 서비스 우선순위, 프록시 국가 설정, 알림 채널 설정, 비용 한도 설정, AI 분류 신뢰도 임계값 등 운영 파라미터를 반환한다. `admin` 역할만 접근 가능하다. | P1 | Phase 1 | 1. `admin` 역할로 요청 시 전체 설정값이 카테고리별로 반환된다<br>2. 설정 카테고리: `investigation`(채증), `detection`(탐지), `sms`(SMS), `captcha`(CAPTCHA), `proxy`(프록시), `notification`(알림), `cost`(비용), `classification`(분류)<br>3. 각 설정에 `key`, `value`, `description`, `type`, `defaultValue`, `updatedAt`, `updatedBy` 필드가 포함된다<br>4. `admin` 이외의 역할은 HTTP 403을 반환한다<br>5. 민감한 설정(API 키 등)은 마스킹되어 반환된다 | PostgreSQL 설정 테이블, Prisma Setting 모델, 환경 변수 + DB 설정 병합 |
| **FR-API-046** | PATCH /api/system/settings -- 시스템 설정 변경 | 시스템 운영 설정값을 변경한다. 변경 가능한 설정만 업데이트하며, 읽기 전용 설정(시스템 버전 등) 변경 시도 시 HTTP 422를 반환한다. 변경 전후 값을 감사 로그에 기록하고, 설정 변경 즉시 시스템에 반영한다. 주요 설정 변경 시 Slack 알림을 전송한다. | P1 | Phase 1 | 1. 유효한 설정 키와 값으로 요청 시 설정이 변경되고 HTTP 200을 반환한다<br>2. 읽기 전용 설정 변경 시도 시 HTTP 422와 `SETTING_READ_ONLY` 에러를 반환한다<br>3. 변경 전후 값이 감사 로그에 기록된다<br>4. 설정 변경이 즉시 시스템에 반영된다 (서버 재시작 불필요)<br>5. 주요 설정(동시 실행 수, 비용 한도 등) 변경 시 Slack 알림이 전송된다 | Prisma `update`, Redis 캐시 무효화 (설정 캐시), Slack Webhook, 감사 로그 미들웨어 |

**주요 요청/응답 예시:**

<details>
<summary>GET /api/system/health</summary>

**Response (200 OK):**
```json
{
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 864000,
    "timestamp": "2026-03-14T09:00:00.000Z",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 12,
        "version": "PostgreSQL 16.2"
      },
      "redis": {
        "status": "healthy",
        "responseTime": 3,
        "version": "7.2.4",
        "memoryUsage": "128MB"
      },
      "queue": {
        "status": "healthy",
        "activeJobs": 3,
        "waitingJobs": 15
      },
      "storage": {
        "status": "healthy",
        "responseTime": 45,
        "provider": "MinIO",
        "usedSpace": "12.5GB"
      }
    }
  }
}
```
</details>

<details>
<summary>PATCH /api/system/settings</summary>

**Request:**
```json
{
  "settings": [
    {
      "key": "investigation.maxConcurrent",
      "value": 10
    },
    {
      "key": "classification.confidenceThreshold",
      "value": 0.75
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": {
    "updated": [
      {
        "key": "investigation.maxConcurrent",
        "previousValue": 5,
        "newValue": 10,
        "updatedAt": "2026-03-14T09:00:00.000Z",
        "updatedBy": "usr_abc123"
      },
      {
        "key": "classification.confidenceThreshold",
        "previousValue": 0.7,
        "newValue": 0.75,
        "updatedAt": "2026-03-14T09:00:00.000Z",
        "updatedBy": "usr_abc123"
      }
    ]
  },
  "meta": {
    "requestId": "req_settings_001",
    "timestamp": "2026-03-14T09:00:00.000Z"
  }
}
```
</details>

---

## J. Webhook/알림 API (Phase 2)

| ID | 제목 | 설명 | 우선순위 | Phase | 수용 기준 | 기술 구현 참고 |
|----|------|------|---------|-------|----------|---------------|
| **FR-API-047** | POST /api/webhooks -- 웹훅 등록 | 외부 시스템에 이벤트를 전달하기 위한 웹훅을 등록한다. 이벤트 유형(`investigation.completed`, `investigation.failed`, `detection.new_site`, `manual_queue.new`, `domain.status_changed`, `system.alert`)별로 콜백 URL을 설정한다. 웹훅 호출 시 HMAC-SHA256 서명을 포함하여 요청 위조를 방지한다. 전달 실패 시 지수 백오프로 최대 5회 재시도한다. | P2 | Phase 2 | 1. 콜백 URL과 이벤트 유형을 지정하여 웹훅이 등록되고 HTTP 201을 반환한다<br>2. 등록 시 `secret` 키가 자동 생성되어 HMAC-SHA256 서명에 사용된다<br>3. 등록된 이벤트 발생 시 콜백 URL로 3초 이내 HTTP POST 요청이 전송된다<br>4. 전달 실패 시 지수 백오프(1분, 5분, 15분, 60분, 240분)로 최대 5회 재시도한다<br>5. 5회 모두 실패 시 웹훅을 `disabled` 상태로 전환하고 관리자에게 알림을 전송한다 | BullMQ (웹훅 전달 큐), HMAC-SHA256 서명 (`crypto.createHmac`), 지수 백오프, Prisma Webhook 모델 |
| **FR-API-048** | GET /api/notifications -- 알림 목록 조회 | 시스템에서 생성된 알림 목록을 조회한다. 채증 완료/실패, 수동 개입 요청, 도메인 상태 변경, 비용 한도 경고, 시스템 장애 등 다양한 유형의 알림을 통합하여 제공한다. 읽음/안읽음 상태 필터와 중요도(`critical`, `warning`, `info`) 필터를 지원한다. | P2 | Phase 2 | 1. 요청 시 최근 알림이 시간역순으로 반환된다<br>2. 각 알림에 `id`, `type`, `severity`(critical/warning/info), `title`, `message`, `resourceUrl`, `isRead`, `createdAt` 필드가 포함된다<br>3. `isRead` 필터로 읽음/안읽음 알림을 구분 조회할 수 있다<br>4. `severity` 필터로 중요도별 조회가 가능하다<br>5. 안읽은 알림 수(`unreadCount`)가 응답 메타에 포함된다 | PostgreSQL Notification 테이블, Prisma 모델, Redis Pub/Sub (실시간 알림 Push) |
| **FR-API-049** | POST /api/notifications/settings -- 알림 설정 변경 | 사용자별 알림 수신 설정을 관리한다. 알림 채널(Slack, 웹 푸시, 이메일)별 활성/비활성, 이벤트 유형별 알림 수신 여부, 알림 빈도(즉시, 1시간 요약, 일일 요약)를 설정한다. 설정은 사용자별로 독립적으로 관리된다. | P2 | Phase 2 | 1. 사용자별 알림 설정이 저장되고 HTTP 200을 반환한다<br>2. 채널별(`slack`, `webPush`, `email`) 활성/비활성 설정이 가능하다<br>3. 이벤트 유형별 알림 수신 on/off 설정이 가능하다<br>4. 알림 빈도(`immediate`, `hourly_digest`, `daily_digest`) 설정이 가능하다<br>5. 설정 변경 즉시 적용되며, 이전 설정은 이력으로 보존된다 | Prisma NotificationSetting 모델 (사용자별), Slack Webhook, Web Push API, 이메일 서비스 연동 |

---

## 요구사항 요약

### 우선순위별 분류

| 우선순위 | 요구사항 수 | 해당 ID | Phase |
|---------|-----------|---------|-------|
| **P0** | 11건 | FR-API-001, 002, 003, 004, 005, 006, 007, 008, 012, 013, 014, 020, 022, 037, 042 | Phase 1 |
| **P1** | 24건 | FR-API-009, 010, 011, 015, 016, 017, 018, 019, 023, 025, 026, 030, 031, 032, 033, 034, 035, 036, 038, 039, 040, 043, 044, 045, 046 | Phase 1-2 |
| **P2** | 7건 | FR-API-024, 027, 028, 029, 041, 047, 048, 049 | Phase 2-3 |

### Phase별 분류

| Phase | 핵심 기능 | 요구사항 |
|-------|----------|---------|
| **Phase 1** (MVP) | 인증, 사이트 CRUD, 채증 기본, 증거 기본, 대시보드 KPI, 헬스 체크 | FR-API-001~014, 019, 020, 022, 037, 038, 042, 044, 045, 046 |
| **Phase 2** (자동 채증) | 채증 고급, 증거 다운로드/보고서, 탐지 실행, 수동 개입, AI 분류, 통계, 웹훅/알림 | FR-API-015~018, 021, 023, 024, 025, 026, 030, 031~036, 039, 040, 043, 047~049 |
| **Phase 3** (AI 탐지) | 키워드 관리, 카테고리 통계 | FR-API-027, 028, 029, 041 |

### API 엔드포인트 전체 목록

| # | 메서드 | 엔드포인트 | 요구사항 ID | Phase |
|---|--------|-----------|------------|-------|
| 1 | POST | `/api/auth/login` | FR-API-001 | 1 |
| 2 | POST | `/api/auth/logout` | FR-API-002 | 1 |
| 3 | GET | `/api/auth/me` | FR-API-003 | 1 |
| 4 | -- | RBAC 미들웨어 | FR-API-004 | 1 |
| 5 | GET | `/api/sites` | FR-API-005 | 1 |
| 6 | POST | `/api/sites` | FR-API-006 | 1 |
| 7 | GET | `/api/sites/:id` | FR-API-007 | 1 |
| 8 | PATCH | `/api/sites/:id` | FR-API-008 | 1 |
| 9 | DELETE | `/api/sites/:id` | FR-API-009 | 1 |
| 10 | POST | `/api/sites/bulk` | FR-API-010 | 1 |
| 11 | GET | `/api/sites/:id/history` | FR-API-011 | 1 |
| 12 | POST | `/api/investigations` | FR-API-012 | 1 |
| 13 | GET | `/api/investigations` | FR-API-013 | 1 |
| 14 | GET | `/api/investigations/:id` | FR-API-014 | 1 |
| 15 | POST | `/api/investigations/:id/cancel` | FR-API-015 | 1 |
| 16 | POST | `/api/investigations/:id/retry` | FR-API-016 | 2 |
| 17 | GET | `/api/investigations/:id/screenshots` | FR-API-017 | 2 |
| 18 | GET | `/api/investigations/:id/evidence` | FR-API-018 | 2 |
| 19 | GET | `/api/investigations/queue` | FR-API-019 | 1 |
| 20 | GET | `/api/evidence/:id` | FR-API-020 | 1 |
| 21 | GET | `/api/evidence/:id/download` | FR-API-021 | 2 |
| 22 | POST | `/api/evidence/:id/verify` | FR-API-022 | 1 |
| 23 | GET | `/api/evidence/:id/audit-log` | FR-API-023 | 2 |
| 24 | POST | `/api/evidence/:id/report` | FR-API-024 | 2 |
| 25 | POST | `/api/detection/scan` | FR-API-025 | 2 |
| 26 | GET | `/api/detection/results` | FR-API-026 | 2 |
| 27 | GET | `/api/detection/keywords` | FR-API-027 | 3 |
| 28 | POST | `/api/detection/keywords` | FR-API-028 | 3 |
| 29 | DELETE | `/api/detection/keywords/:id` | FR-API-029 | 3 |
| 30 | GET | `/api/detection/domains/:id/status` | FR-API-030 | 2 |
| 31 | GET | `/api/manual-queue` | FR-API-031 | 2 |
| 32 | POST | `/api/manual-queue/:id/resolve` | FR-API-032 | 2 |
| 33 | GET | `/api/manual-queue/:id/stream` | FR-API-033 | 2 |
| 34 | GET | `/api/classification/review-queue` | FR-API-034 | 2 |
| 35 | POST | `/api/classification/:id/approve` | FR-API-035 | 2 |
| 36 | POST | `/api/classification/:id/reject` | FR-API-036 | 2 |
| 37 | GET | `/api/dashboard/summary` | FR-API-037 | 1 |
| 38 | GET | `/api/dashboard/activity` | FR-API-038 | 1 |
| 39 | GET | `/api/stats/detection` | FR-API-039 | 2 |
| 40 | GET | `/api/stats/investigation` | FR-API-040 | 2 |
| 41 | GET | `/api/stats/categories` | FR-API-041 | 3 |
| 42 | GET | `/api/system/health` | FR-API-042 | 1 |
| 43 | GET | `/api/system/services` | FR-API-043 | 1 |
| 44 | GET | `/api/audit-log` | FR-API-044 | 1 |
| 45 | GET | `/api/system/settings` | FR-API-045 | 1 |
| 46 | PATCH | `/api/system/settings` | FR-API-046 | 1 |
| 47 | POST | `/api/webhooks` | FR-API-047 | 2 |
| 48 | GET | `/api/notifications` | FR-API-048 | 2 |
| 49 | POST | `/api/notifications/settings` | FR-API-049 | 2 |

### 기술 의존성 맵

```
Phase 1 (MVP):
  NextAuth.js v5  -->  FR-API-001~004 (인증/RBAC)
  Prisma + PostgreSQL  -->  FR-API-005~011 (사이트 CRUD)
  BullMQ + Redis  -->  FR-API-012~014, 019 (채증 큐)
  S3/MinIO  -->  FR-API-020 (증거 조회)
  Node.js crypto  -->  FR-API-022 (해시 검증)

Phase 2 (자동 채증):
  FR-API-001~004 (인증)  -->  모든 보호 API
  FR-API-012 (채증 생성)  -->  FR-API-015~018 (채증 관리)
  FR-API-020 (증거)  -->  FR-API-021~024 (증거 관리)
  BullMQ  -->  FR-API-025, 031~033 (탐지/수동 개입)
  Claude Haiku 4.5  -->  FR-API-034~036 (AI 분류)
  Claude Sonnet 4.6  -->  FR-API-024 (PDF 보고서)

Phase 3 (AI 탐지):
  Google Custom Search API  -->  FR-API-025, 027~029 (키워드/탐지)
  PostgreSQL 집계  -->  FR-API-039~041 (통계)
```

---

## 비기능 요구사항 (API 관련)

| ID | 제목 | 설명 | 목표값 |
|----|------|------|--------|
| NFR-API-001 | API 응답 시간 | 일반 CRUD API의 P95 응답 시간 | 500ms 이내 |
| NFR-API-002 | 목록 조회 응답 시간 | 10,000건 이상 데이터에서의 목록 조회 P95 | 1초 이내 |
| NFR-API-003 | 동시 요청 처리 | 시스템이 처리 가능한 동시 API 요청 수 | 100 req/sec 이상 |
| NFR-API-004 | 가용성 | API 서비스 가용률 | 99.5% 이상 |
| NFR-API-005 | 에러율 | 전체 요청 대비 5xx 에러 비율 | 0.1% 이하 |
| NFR-API-006 | 인증 토큰 보안 | JWT 토큰 유출 시 피해 범위 제한 | access_token 1시간 만료 |
| NFR-API-007 | 감사 추적 | 모든 상태 변경 API의 감사 로그 기록률 | 100% |
| NFR-API-008 | API 문서화 | OpenAPI 3.0 스펙 기반 API 문서 자동 생성 | Phase 2 완료 시점 |
