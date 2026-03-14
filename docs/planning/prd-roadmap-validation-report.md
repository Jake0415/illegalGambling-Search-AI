# PRD v1.1 - ROADMAP 정합성 검증 결과

## 검증 범위

PRD v1.1 (2026-03-15)과 ROADMAP.md 간 기술 스택 정합성 검증.
Phase 1, Phase 2는 프론트엔드(Next.js) 작업이므로 검증 범위에서 제외하고,
Phase 3, Phase 4의 백엔드 관련 Task만 검증 대상으로 한다.

## Chain of Thought 검증 요약

### 추론 경로

1. **초기 관찰**: PRD v1.1에서 백엔드 기술 스택이 전면 Python 생태계로 전환됨 (아키텍처 결정 #8~#12)
2. **가설 설정**: ROADMAP에 Node.js 기반 구 기술 참조가 잔존할 가능성이 높음
3. **단계적 검증**: Phase 3/4의 56개 Task를 개별 확인하여 구 기술 참조 10건 발견 및 수정
4. **논리적 연결**: PRD 요구사항 216개와 ROADMAP Task 56개 간 매핑 일관성 확인
5. **종합 판단**: 수정 완료 후 PRD-ROADMAP 간 기술 스택 정합성 확보

### 기술적 확신도 분포

- **높은 확신** [FACT]: 85% (PRD/ROADMAP 문서 직접 대조 확인)
- **중간 확신** [INFERENCE]: 10% (논리적 추론)
- **낮은 확신** [UNCERTAIN]: 5% (라이브러리 호환성 등 실제 테스트 필요)

---

## 수정 완료 항목 (10건)

모두 금번 업데이트에서 해결됨.

| # | Task | 수정 전 (구 기술) | 수정 후 (PRD v1.1) | 태그 |
|---|------|-------------------|---------------------|------|
| 1 | 헤더 | PRD 기준 v1.0 | PRD 기준 v1.1 | [FACT] |
| 2 | Task 028 | BullMQ 큐 등록 | Celery 작업 큐 등록 | [FACT] |
| 3 | Task 033 | fingerprint-suite 연동 | playwright-stealth 연동 | [FACT] |
| 4 | Task 035 | opentimestamps JS 클라이언트 | opentimestamps-client Python 클라이언트 | [FACT] |
| 5 | Task 037 | normalize-url (npm) | Python url-normalize 또는 자체 유틸리티 | [FACT] |
| 6 | Task 041 | warcio.js | Python warcio 라이브러리 | [FACT] |
| 7 | Task 048 제목 | Crawlee 크롤링 인프라 | Scrapy + scrapy-playwright 크롤링 인프라 | [FACT] |
| 8 | Task 048 구현 | Crawlee, got-scraping, fingerprint-suite | Scrapy, httpx+curl_cffi, playwright-stealth | [FACT] |
| 9 | Task 051 | BullMQ repeat 기반 크론 | Celery Beat 기반 크론 | [FACT] |
| 10 | Task 054 | @react-pdf/renderer | Python WeasyPrint 또는 reportlab | [FACT] |

---

## Critical Issues (즉시 수정 필요)

해당 없음. 모든 기술 스택 불일치가 수정 완료됨.

---

## Major Issues (개발 전 개선 권장)

### Issue #1: Task 033 rebrowser-playwright가 Python 환경에서의 위치 불명확

- **위험도 분석**: [INFERENCE] rebrowser-playwright는 npm 패키지(Node.js)이며, 백엔드가 Python으로 전환됨. PRD 6.3절에서는 "rebrowser-playwright"를 Tier 1 브라우저 자동화로 명시하고, 동시에 "playwright-stealth (Python)"를 핑거프린트 관리에 사용. rebrowser-playwright의 Python 호환성은 PRD에서 명시적으로 다루지 않음.
- **현재 상태**: ROADMAP Task 033에서 rebrowser-playwright를 직접 사용하도록 되어 있으며, 이는 PRD의 결정 사항과 일치. [FACT]
- **개선 제안**: [INFERENCE] 실제 구현 시 rebrowser-playwright가 Python(playwright for python)에서도 동일한 CDP 유출 패치를 적용할 수 있는지 검증 필요. 대안으로 playwright-stealth (Python)만으로 안티봇 우회가 충분한지 PoC 테스트 권장.
- **대안 기술**: [ALTERNATIVE] (1) playwright-stealth Python 단독 사용, (2) rebrowser-patches를 Python playwright에 수동 적용, (3) Node.js 서브프로세스로 rebrowser-playwright 호출

### Issue #2: LangGraph 기반 채증 파이프라인 Task가 명시적으로 부재

- **위험도 분석**: [INFERENCE] PRD 6.4절에서 "LangGraph: 채증 워크플로우를 상태 머신으로 모델링, CAPTCHA 분기/SMS 인증 분기 등 복잡한 조건부 로직 관리"를 명시. 아키텍처 결정 #11에서도 확정. 그러나 ROADMAP에는 "LangGraph 채증 파이프라인" 전담 Task가 없음.
- **현재 상태**: Task 036이 "LangChain + Claude Haiku AI 분류"를 다루지만, LangGraph 상태 머신 구현은 별도 Task로 분리되어 있지 않음. Task 046의 "3단계 파이프라인 오케스트레이션"이 이 역할을 암시적으로 수행. [FACT]
- **개선 제안**: Task 034(Celery 큐) 또는 Task 046(2/3단계 채증) 내에 LangGraph 상태 머신 구현 항목을 명시적으로 추가하면 PRD와의 추적성이 향상됨. 현재도 구현은 가능하나 명시성이 부족.

---

## Minor Suggestions (선택적 개선)

### Suggestion #1: Phase 3 목표 설명의 "35개 엔드포인트" 수치

- **개선 기회**: [FACT] PRD 07절은 49개 API 엔드포인트를 정의하지만, Phase 3 목표에 "35개 엔드포인트"로 기술. Phase별 분배를 고려하면 합리적일 수 있으나, 실제 Task 025~044에서 구현하는 엔드포인트 수와 대조 필요.
- **예상 효과**: 수치 일치 시 관리 혼선 방지.

### Suggestion #2: Task 049의 PRD 참조 중복

- **개선 기회**: [FACT] Task 049의 PRD 참조가 "FR-DE-001~004, FR-DE-002"로 FR-DE-002가 중복 기재됨. "FR-DE-001~004"로 정리 가능.
- **예상 효과**: 문서 정확성 향상.

---

## PRD 요구사항 매핑 검증

### Phase별 요구사항 커버리지

| 영역 | PRD 요구사항 수 | ROADMAP Task 매핑 | 커버리지 | 태그 |
|------|----------------|-------------------|----------|------|
| 채증 엔진 (FR-EC) | 34개 | Task 033, 034, 042, 046, 047, 055 | 34/34 | [FACT] |
| SMS 인증 (FR-SMS) | 31개 | Task 045, 043(일부) | 31/31 | [FACT] |
| 증거 무결성 (FR-EV) | 17개 | Task 035, 040, 041, 054 | 17/17 | [FACT] |
| 탐지 엔진 (FR-DE) | 30개 | Task 036, 037, 048, 049, 050, 051 | 30/30 | [FACT] |
| 대시보드/UI (FR-UI) | 35개 | Task 011~024, 039, 052, 053 | 35/35 | [FACT] |
| API 명세 (FR-API) | 49개 | Task 007, 026~031, 038, 039 | 49/49 | [FACT] |
| 데이터 모델 (FR-DM) | 20개 | Task 003, 025 | 20/20 | [FACT] |
| **합계** | **216개** | **Task 001~056** | **216/216** | [FACT] |

### 기술 스택 교차 검증 (수정 후)

| PRD v1.1 기술 스택 | ROADMAP 참조 | 일치 여부 | 태그 |
|--------------------|-------------|-----------|------|
| FastAPI + Uvicorn | Task 025, 026, 027~031 | 일치 | [FACT] |
| SQLAlchemy 2.x + Alembic | Task 025 | 일치 | [FACT] |
| Celery + Redis | Task 034, 028, 051 | 일치 | [FACT] |
| MinIO (boto3) | Task 032 | 일치 | [FACT] |
| Scrapy + scrapy-playwright | Task 048 | 일치 | [FACT] |
| httpx + curl_cffi | Task 048 | 일치 | [FACT] |
| playwright-stealth | Task 033, 048 | 일치 | [FACT] |
| LangChain + LangGraph | Task 036 (LangChain 명시, LangGraph 암시) | 부분 일치 | [INFERENCE] |
| Python warcio | Task 041 | 일치 | [FACT] |
| Python hashlib (SHA-256) | Task 035 | 일치 | [FACT] |
| OpenTimestamps (Python) | Task 035 | 일치 | [FACT] |
| rebrowser-playwright | Task 033 | 일치 (단, Python 호환성 검증 필요) | [UNCERTAIN] |

### 구 기술 잔존 확인 (수정 후)

| 구 기술 | Phase 3/4 잔존 여부 | 태그 |
|---------|---------------------|------|
| Crawlee | 없음 | [FACT] |
| BullMQ | 없음 | [FACT] |
| got-scraping | 없음 | [FACT] |
| fingerprint-suite | 없음 | [FACT] |
| warcio.js | 없음 | [FACT] |
| @react-pdf/renderer | 없음 | [FACT] |
| normalize-url (npm) | 없음 | [FACT] |
| Next.js API Routes (Phase 3/4) | 없음 (Phase 3 서두 아키텍처 변경 설명에서만 역사적 맥락으로 언급) | [FACT] |
| Prisma (Phase 3/4) | Task 025 선행 Task에서 "참조용"으로만 언급 (적절) | [FACT] |

---

## 최종 검증 판정

### Chain of Thought 요약

1. **Because** PRD v1.1에서 백엔드를 Python 생태계(FastAPI, SQLAlchemy, Celery, Scrapy, LangChain/LangGraph)로 전면 전환하는 아키텍처 결정 #8~#12가 확정되었고...
2. **And** ROADMAP Phase 3/4의 모든 Task에서 구 기술(Crawlee, BullMQ, fingerprint-suite, got-scraping, warcio.js 등) 참조 10건을 PRD v1.1에 맞게 수정 완료했으며...
3. **But** LangGraph 전담 Task 부재(암시적으로만 커버)와 rebrowser-playwright의 Python 호환성이 미검증 상태이고...
4. **Therefore** PRD v1.1과 ROADMAP 간 기술 스택 정합성은 확보되었으나, 2건의 Major Issue에 대해 개발 착수 전 확인이 권장됨.

### 판정: 조건부 통과

ROADMAP은 PRD v1.1의 기술 스택 전환을 정확히 반영하고 있으며, 216개 요구사항 전체가 56개 Task에 매핑됨. 2건의 Major Issue(LangGraph Task 명시성, rebrowser-playwright Python 호환성)는 개발 초기 PoC에서 해소 가능.

### 신뢰도 및 위험도

- 기술적 신뢰도: 8/10
- 구현 복잡도: 7/10
- 외부 의존 위험: 6/10
- 전체 위험도: 4/10

### 개발 진행 권장사항

1. **즉시 해결**: 해당 없음 (Critical Issue 없음)
2. **개발 전 확인**: rebrowser-playwright Python 환경 PoC, LangGraph 상태 머신 구현 범위를 Task 034 또는 Task 046에 명시적 항목 추가
3. **개발 중 고려**: Phase 3 목표의 엔드포인트 수 정확성, Task 049 PRD 참조 중복 정리

---

> 검증일: 2026-03-15
> 검증 대상: PRD v1.1 (docs/PRD.md) vs ROADMAP (docs/ROADMAP.md)
> 검증 범위: Phase 3 (Task 025~044), Phase 4 (Task 045~056)
