# Topic 4: Claude LLM 연동 검토

> 작성일: 2026-03-14
> 담당: team-leader

---

## 1. 사이트 콘텐츠 분석·분류

### 1.1 도박 사이트 분류 능력

**Claude의 한국어 처리 능력:**
Claude는 한국어를 포함한 다국어 벤치마크(MMLU-ProX 등)에서 평가되고 있으며, 중국어/일본어/한국어에서 관용구, 공식 문서, 기술 용어 처리에 뛰어난 성능을 보인다. Claude는 표준 유니코드 문자를 사용하는 대부분의 세계 언어로 입출력을 처리할 수 있다.
- 출처: [Multilingual support - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/multilingual-support), [Artificial Analysis Multilingual Benchmark](https://artificialanalysis.ai/models/multilingual)

**도박 사이트 탐지 관련 연구:**
- 상용 LLM을 활용한 불법 콘텐츠 제로샷 분류 연구에서, 도박(Gambling)과 같이 명확한 어휘적 단서가 있는 태스크는 모든 모델에서 F1-score 94~95%를 초과하는 성능을 보임
- Few-shot 모델(CarMaNet 등)이 포르노, 도박, 위조 웹사이트 데이터셋에서 기존 모델 대비 우수한 성능을 보인 연구 결과 존재
- URL, WHOIS, INDEX, 랜딩 페이지 정보 등 복합적 특징을 텍스트·이미지 분석과 앙상블 조합하는 접근이 효과적
- 출처: [Zero-Shot Classification of Illicit Content (MDPI)](https://www.mdpi.com/2079-9292/14/20/4101), [Illegal Gambling Site Detection (Springer)](https://link.springer.com/article/10.1007/s10899-024-10337-z)

**추천 접근법:**
```
시스템 프롬프트: 도박 사이트 분류 전문가 역할 부여
+ 한국어 도박 용어 사전 (배팅, 충전, 환전, 롤링, 꽁머니, 먹튀 등)
+ Few-shot 예시 5~10개 (도박 사이트 vs 정상 사이트)
→ 분류 결과: {is_gambling: boolean, confidence: 0~1, evidence: [...]}
```

### 1.2 Claude vs 전통 ML 비교

| 항목 | Claude (LLM) | BERT/RoBERTa | XGBoost/LightGBM |
|------|-------------|--------------|-------------------|
| **정확도** | Few-shot F1 94~95% (도박 분류) | Fine-tuned F1 86~90% | F1 75~86% |
| **학습 데이터 필요량** | 0개 (zero-shot) ~ 10개 (few-shot) | 수천~수만 건 | 수천~수만 건 |
| **한국어 지원** | 네이티브 다국어 지원 | KLUE-BERT 등 한국어 전용 모델 필요 | 피처 엔지니어링 필요 |
| **추론 비용** | API 호출당 ~$0.01~0.05 | GPU 서버 필요 (자체 호스팅) | CPU 가능, 매우 저렴 |
| **추론 속도** | 1~3초 | 100~500ms | 10~50ms |
| **유지보수** | 프롬프트 업데이트만 필요 | 재학습 파이프라인 필요 | 재학습 파이프라인 필요 |
| **새 패턴 적응** | 프롬프트 수정으로 즉시 대응 | 데이터 수집 + 재학습 | 데이터 수집 + 재학습 |

**핵심 발견사항:**
- XGBoost는 대부분의 데이터셋 시나리오에서 가장 균형 잡힌 성능을 보이지만, 중간 규모 데이터셋에서는 BERT-base가 약간 우수
- 전통 ML(XGBoost)이 종종 고급 트랜스포머를 능가하면서 10배 적은 리소스를 사용
- LLM 방식은 학습 데이터가 제한적이거나 매우 긴 컨텍스트 처리가 필요한 시나리오에 최적
- Fine-tuned LLM(Llama3-70B)은 intent classification에서 90.8% 정확도 달성
- 출처: [When XGBoost Outperforms GPT-4 (ACL)](https://aclanthology.org/2024.trustnlp-1.5.pdf), [Long Document Classification Benchmark](https://procycons.com/en/blogs/long-document-classification-benchmark-2025/)

**결론:** 본 프로젝트에서는 학습 데이터가 초기에 부족하므로, Claude few-shot 분류로 시작하고, 데이터가 축적되면 XGBoost/BERT 하이브리드로 전환하는 단계적 접근을 추천한다.

### 1.3 분류당 비용 분석

한 페이지의 HTML 콘텐츠를 분류하는 데 필요한 토큰 수 추정:
- 입력: ~2,000 토큰 (시스템 프롬프트 + few-shot 예시 + 페이지 텍스트)
- 출력: ~200 토큰 (분류 결과 JSON)

| 모델 | 입력 비용 | 출력 비용 | **건당 비용** |
|------|----------|----------|-------------|
| Haiku 4.5 | $1/1M | $5/1M | **$0.003** |
| Sonnet 4.6 | $3/1M | $15/1M | **$0.009** |
| Opus 4.6 | $5/1M | $25/1M | **$0.015** |

프롬프트 캐싱 적용 시 반복되는 시스템 프롬프트에 대해 90% 비용 절감 가능.

---

## 2. 폼 필드 자동 탐지

**Claude Vision API를 활용한 웹페이지 스크린샷 분석:**

Claude Vision은 PNG, JPEG, GIF, WebP 형식을 지원하며, 단일 요청에 최대 100개 이미지(API)를 포함할 수 있다. 이미지 토큰 수는 `(width px * height px) / 750`으로 계산된다.

**폼 필드 자동 탐지 능력:**
- Claude는 폼, 송장, 영수증, 계약서, 수기 메모에서 구조화된 데이터를 높은 정확도로 추출
- 문맥에 따른 필드 해석 가능: 의료 양식의 "날짜" vs 배송 라벨의 "날짜"를 구분
- 공간 관계를 이해하지만, 정확한 픽셀 좌표는 반환하지 않음
- 출처: [Vision - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/vision), [Claude Vision for Document Analysis](https://getstream.io/blog/anthropic-claude-visual-reasoning/)

**도박 사이트 회원가입 폼 탐지 워크플로우:**
```
1. Playwright로 회원가입 페이지 스크린샷 캡처
2. Claude Vision에 스크린샷 전송 + 프롬프트:
   "이 웹페이지에서 회원가입 폼 필드를 식별하세요.
    각 필드의 라벨, 타입(text/password/select 등),
    필수 여부를 JSON으로 반환하세요."
3. 반환된 필드 정보를 Playwright selector와 매핑
4. 자동 폼 작성 실행
```

**스크린샷 분석 비용 (1920x1080 해상도 기준):**
- 이미지 토큰: ~2,765 토큰 (1920*1080/750)
- Haiku 4.5 기준: ~$0.003/장
- Sonnet 4.6 기준: ~$0.008/장

**제약사항:**
- 90도 회전되거나 뒤집힌 텍스트는 인식 어려움
- 정확한 CSS selector나 XPath는 직접 제공 불가 → HTML 소스 분석과 병행 필요
- 이미지 앞에 텍스트를 배치하는 것보다 이미지를 먼저 배치하는 구조가 더 높은 성능

---

## 3. CAPTCHA 분석 (탐지 vs 풀이)

### 3.1 Anthropic 이용 정책 관련

**중요:** Anthropic의 Usage Policy에서는 자동화된 보안 우회 행위를 금지하고 있다.
- "자동화된 수단(봇, 스크립트 등)을 통한 서비스 접근은 API Key를 통한 접근 또는 명시적 허가가 없는 한 금지"
- 악의적 활동 조율, 자동 계정 생성, 제품 가드레일 우회 등을 금지
- 출처: [Anthropic Usage Policy](https://www.anthropic.com/legal/aup), [Exceptions to Usage Policy](https://support.claude.com/en/articles/9528712-exceptions-to-our-usage-policy)

**CAPTCHA "풀이"는 ToS 위반 가능성이 높으므로, Claude는 CAPTCHA 유형 "탐지"에만 사용할 것을 권장.**

### 3.2 CAPTCHA 유형 탐지 활용 방안

Claude Vision을 CAPTCHA 유형 식별(solving이 아닌 detection/classification)에 활용:

```
입력: CAPTCHA가 포함된 페이지 스크린샷
Claude 프롬프트: "이 페이지에 CAPTCHA가 있습니까?
  있다면 유형을 식별하세요:
  - reCAPTCHA v2 (체크박스)
  - reCAPTCHA v3 (보이지 않음)
  - hCaptcha
  - 이미지 선택형
  - 텍스트 입력형
  - 슬라이더형"

출력: {has_captcha: true, type: "reCAPTCHA_v2", confidence: 0.95}
```

**라우팅 전략:**
```
CAPTCHA 유형 탐지 (Claude Vision)
  ├→ reCAPTCHA v2/v3 → CapSolver API
  ├→ hCaptcha → CapSolver API
  ├→ 이미지 선택형 → 2Captcha (human)
  ├→ 텍스트 입력형 → CapSolver API
  └→ 미식별/복잡 → Dashboard 수동 처리
```

### 3.3 비용 영향

CAPTCHA 탐지는 스크린샷 분석 1회만 필요하므로:
- Haiku 4.5: ~$0.003/건
- 월 500사이트 기준: ~$1.50/월 (무시할 수준)

---

## 4. 증거 보고서 생성

### 4.1 보고서 생성 능력

Claude는 수집된 증거 데이터를 기반으로 구조화된 수사 보고서를 생성하는 데 적합하다.

**연구 기반 근거:**
- AI 에이전트는 법률 텍스트 분석, 관련 판례 식별, 계약 수정 제안, 법률 문서 생성, 컴플라이언스 체크를 수행 가능
- LLM은 추출된 정보를 미리 정의된 템플릿에 채워넣고 보고서를 생성할 수 있어 문서 처리 속도를 대폭 향상
- 단, 복잡한 법률 용어가 포함된 문서의 정확한 요약에는 도메인 전문 지식이 필요
- 한국어 법률 텍스트 분류에서 KLUE-BERT를 한국어 법률 데이터로 fine-tuning한 소규모 모델이 GPT-3.5/4.0보다 우수한 성능을 보임
- 출처: [Legal text classification in Korean (Springer)](https://link.springer.com/article/10.1007/s10506-025-09454-w), [AI agents for legal documents (LeewayHertz)](https://www.leewayhertz.com/ai-agents-for-legal-documents/)

### 4.2 보고서 생성 전략

**하이브리드 접근 (템플릿 + LLM):**

```markdown
## 불법 도박 사이트 수사 보고서

### 기본 정보 (템플릿 - 자동 채움)
- 사이트 URL: {url}
- 수집 일시: {timestamp}
- 도메인 등록 정보: {whois_data}

### AI 분석 결과 (Claude 생성)
- 사이트 유형 판정: {classification_result}
- 주요 도박 서비스: {detected_services}
- 위법 근거 분석: {legal_analysis}

### 증거 자료 (자동 첨부)
- 스크린샷: {screenshots[]}
- HTML 스냅샷: {html_snapshots[]}
```

**비용 추정 (보고서 1건):**
- 입력: ~5,000 토큰 (수집 데이터 요약)
- 출력: ~2,000 토큰 (보고서 본문)
- Sonnet 4.6: ~$0.045/건
- Haiku 4.5: ~$0.015/건
- 월 500건: Sonnet $22.50, Haiku $7.50

---

## 5. 크롤링 워크플로우 오케스트레이션

### 5.1 Claude를 에이전트로 활용

Claude는 "결정 루프(decision loop)" 내에서 작동하는 자율 AI 시스템으로, 복잡한 목표를 분해하고, 도구를 선택·사용하며, 결과를 평가하고, 단계별 인간 지도 없이 반복할 수 있다.

- 브라우저 사용 스킬을 통해 실제 웹사이트 탐색 가능
- 포털 로그인, 폼 작성, 테이블 데이터 추출, 결과 요약 등을 수행
- 멀티 에이전트 시스템: Manager Agent → Research/Analyst/Writer Agent 순차 실행
- 출처: [Anthropic - Building Effective Agents](https://www.anthropic.com/research/building-effective-agents), [Claude Agents Solutions](https://claude.com/solutions/agents)

### 5.2 오케스트레이션 아키텍처

```
┌─────────────────────────────────────────────────┐
│            Claude Orchestrator (Sonnet 4.6)       │
│  "3단계 증거 수집 절차를 실행하세요"               │
├─────────────────────────────────────────────────┤
│                                                   │
│  Step 1: 메인 페이지 분석                          │
│  ├→ Playwright: 페이지 로드 + 스크린샷             │
│  ├→ Claude (Haiku): 콘텐츠 분류                   │
│  └→ 결과 평가 → 도박 사이트? → Step 2로 진행       │
│                                                   │
│  Step 2: 회원가입 시도                             │
│  ├→ Claude Vision (Haiku): 폼 필드 탐지            │
│  ├→ Claude Vision (Haiku): CAPTCHA 유형 탐지       │
│  ├→ CapSolver/2Captcha: CAPTCHA 풀이              │
│  ├→ Playwright: 폼 작성 + 제출                    │
│  └→ 결과 평가 → 성공? → Step 3로 진행             │
│                                                   │
│  Step 3: 배팅 페이지 증거 수집                     │
│  ├→ Playwright: 내부 페이지 탐색                   │
│  ├→ 스크린샷 + HTML 수집                          │
│  └→ Claude (Sonnet): 증거 보고서 생성              │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 5.3 비용 추정 (사이트 1건당 LLM 호출)

| 단계 | 모델 | 호출 수 | 건당 비용 |
|------|------|---------|----------|
| 콘텐츠 분류 | Haiku 4.5 | 1회 | $0.003 |
| 폼 필드 탐지 | Haiku 4.5 | 1회 | $0.003 |
| CAPTCHA 탐지 | Haiku 4.5 | 1회 | $0.003 |
| 워크플로우 결정 | Haiku 4.5 | 2회 | $0.006 |
| 보고서 생성 | Sonnet 4.6 | 1회 | $0.045 |
| **합계** | | **6회** | **~$0.06** |

---

## 6. API 가격 및 모델 선택

### 6.1 모델별 가격 (2026년 3월 기준)

| 모델 | 입력 ($/1M 토큰) | 출력 ($/1M 토큰) | 특징 |
|------|-----------------|-----------------|------|
| **Opus 4.6** | $5.00 | $25.00 | 최고 성능, 복잡한 추론 |
| Opus 4.6 Fast | $30.00 | $150.00 | 초저지연 모드 (6x) |
| **Sonnet 4.6** | $3.00 | $15.00 | 균형잡힌 성능/비용 |
| Sonnet 4.6 Long (>200K) | $6.00 | $22.50 | 장문 컨텍스트 |
| **Haiku 4.5** | $1.00 | $5.00 | 경량, 빠른 응답 |
| Opus 4 (이전 세대) | $15.00 | $75.00 | 레거시 |
| Sonnet 4 (이전 세대) | $3.00 | $15.00 | 레거시 |

**비용 최적화 기능:**
- **프롬프트 캐싱**: 반복 컨텍스트 90% 절감
- **배치 API**: 전 모델 50% 할인 (24시간 내 비동기 처리)
- 배치 API + 프롬프트 캐싱 동시 적용 가능

출처: [Pricing - Claude API Docs](https://platform.claude.com/docs/en/about-claude/pricing), [Claude API Pricing (TLDL)](https://www.tldl.io/resources/anthropic-api-pricing)

### 6.2 모델별 용도 추천

| 용도 | 추천 모델 | 이유 |
|------|----------|------|
| 콘텐츠 분류 | **Haiku 4.5** | 간단한 분류, 빠른 응답, 최저 비용 |
| 폼 필드 탐지 (Vision) | **Haiku 4.5** | 구조화된 출력, 비용 효율 |
| CAPTCHA 유형 탐지 | **Haiku 4.5** | 단순 분류 태스크 |
| 증거 보고서 생성 | **Sonnet 4.6** | 복잡한 한국어 문서 생성 품질 |
| 워크플로우 오케스트레이션 | **Sonnet 4.6** | 멀티스텝 추론 능력 |
| 난이도 높은 분석 | **Opus 4.6** | 복잡한 법적 판단, 최고 정확도 |

### 6.3 월 비용 시뮬레이션 (500 사이트/월)

**시나리오 A: 기본 (Haiku 중심)**
| 항목 | 호출 수 | 모델 | 비용 |
|------|---------|------|------|
| 콘텐츠 분류 | 500 | Haiku 4.5 | $1.50 |
| 폼 필드 탐지 | 500 | Haiku 4.5 | $1.50 |
| CAPTCHA 탐지 | 500 | Haiku 4.5 | $1.50 |
| 워크플로우 결정 | 1,000 | Haiku 4.5 | $3.00 |
| 보고서 생성 | 500 | Haiku 4.5 | $7.50 |
| **합계** | **3,000** | | **$15.00/월** |

**시나리오 B: 권장 (Haiku + Sonnet 혼합)**
| 항목 | 호출 수 | 모델 | 비용 |
|------|---------|------|------|
| 콘텐츠 분류 | 500 | Haiku 4.5 | $1.50 |
| 폼 필드 탐지 | 500 | Haiku 4.5 | $1.50 |
| CAPTCHA 탐지 | 500 | Haiku 4.5 | $1.50 |
| 워크플로우 결정 | 1,000 | Haiku 4.5 | $3.00 |
| 보고서 생성 | 500 | Sonnet 4.6 | $22.50 |
| **합계** | **3,000** | | **$30.00/월** |

**시나리오 C: 배치 API 적용 (시나리오 B 기준)**
- 비동기 처리 가능한 항목(보고서 생성, 분류)에 배치 API 50% 할인 적용
- **예상 비용: ~$18.00/월**

**시나리오 D: 프롬프트 캐싱 + 배치 API 동시 적용**
- 시스템 프롬프트 캐싱으로 입력 토큰 추가 절감
- **예상 비용: ~$12.00~15.00/월**

---

## 7. Claude Computer Use

### 7.1 기능 평가

**현재 기능 (2026년 3월):**
- Claude Computer Use는 스크린샷 캡처 + 마우스/키보드 제어를 통해 데스크톱 환경과 자율적으로 상호작용
- WebArena 벤치마크에서 단일 에이전트 시스템 중 최고 성능 달성
- 주요 도구: Computer Tool (마우스/키보드), Text Editor Tool (파일 편집)
- 네이티브 앱, PDF, Electron 도구, 레거시 GUI 등 DOM이 없는 인터페이스에서도 작동
- 베타 상태로, 모델 버전별 특정 베타 헤더 필요
- 출처: [Computer Use Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool), [Claude Code Chrome Integration](https://www.adwaitx.com/claude-code-chrome-integration-browser-automation/)

**Computer Use vs Playwright 비교:**

| 항목 | Computer Use | Playwright |
|------|-------------|------------|
| **속도** | ~5초/액션 (MCP 오버헤드) | ~100ms/액션 |
| **비용** | LLM 토큰 비용 발생 | 무료 (컴퓨트만) |
| **안정성** | 동적 UI 대응 가능 | Selector 변경 시 30일 내 15~25% 수정 필요 |
| **DOM 필요** | 불필요 (스크린샷 기반) | 필요 |
| **대규모 처리** | 10K건/일 → $50~200/일 LLM 비용 | 10K건/일 → 컴퓨트 비용만 |
| **유지보수** | 프롬프트 조정 <5% | Selector 수정 15~25%/30일 |
| **컨텍스트** | 접근성 트리로 50K+ 토큰 소모 가능 | N/A |

출처: [Browser Automation in Claude Code: 5 Tools Compared](https://www.heyuan110.com/posts/ai/2026-01-28-claude-code-browser-automation/), [Stagehand vs Browser Use vs Playwright](https://www.nxcode.io/resources/news/stagehand-vs-browser-use-vs-playwright-ai-browser-automation-2026)

### 7.2 하이브리드 Playwright + Computer Use 아키텍처

**추천 전략: "Playwright First, Computer Use Fallback"**

```
사이트 접근
  │
  ├─ [알려진 패턴] → Playwright 스크립트
  │   (98% 성공률, 빠르고 저렴)
  │
  └─ [미지 패턴 / 실패 시] → Claude Computer Use
      (동적 UI 대응, 높은 적응성)
      ├─ 예상치 못한 팝업
      ├─ 비표준 UI 컴포넌트
      ├─ JavaScript 기반 동적 렌더링
      └─ 알 수 없는 CAPTCHA 유형
```

**Playwright CLI 권장 (2026):**
- Playwright CLI는 동일한 Playwright 엔진이지만 4배 적은 토큰을 사용
- Playwright MCP의 가장 큰 문제는 컨텍스트 사용량: 복잡한 페이지에서 접근성 트리가 50,000+ 토큰을 소모하여 컨텍스트 윈도우를 빠르게 채움

**비용 영향:**
- 정상 흐름 (Playwright): $0/건
- Computer Use 폴백 (예상 10% 사이트): ~$0.30~0.50/건
- 월 500사이트 중 50건 폴백: ~$15~25 추가 비용

---

## 8. MCP 연동

### 8.1 관련 MCP 서버

2026년 2월 기준 MCP 생태계는 200개 이상의 서버를 보유하며, stdio, SSE, HTTP streamable 세 가지 전송 모드를 지원한다.

**본 프로젝트 관련 MCP 서버:**

| MCP 서버 | 용도 | 비고 |
|----------|------|------|
| **Playwright MCP** (Microsoft 공식) | 브라우저 자동화, 접근성 스냅샷 기반 | 인기 2위, ~6,000 뷰 |
| **Playwright MCP** (executeautomation) | 커뮤니티 버전, 추가 기능 | 확장 기능 제공 |
| **Filesystem MCP** | 파일 시스템 접근, 증거 파일 관리 | 표준 서버 |
| **Database MCP** | DB 쿼리, 수집 결과 저장 | 스키마 접근 |
| **Custom MCP** | 도박 사이트 수사 전용 도구 | 직접 구축 필요 |

출처: [Playwright MCP (Microsoft)](https://github.com/microsoft/playwright-mcp), [Top 10 Most Popular MCP Servers](https://fastmcp.me/blog/top-10-most-popular-mcp-servers), [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture)

**Playwright MCP의 핵심 장점:**
- 접근성 스냅샷(accessibility snapshot) 기반으로 스크린샷 없이 구조화된 페이지 뷰 제공
- AI가 광고, 모달, 동적 콘텐츠에 혼동 없이 웹 인터페이스를 안정적으로 탐색
- 스크린샷 기반 대비 더 빠르고 안정적

### 8.2 아키텍처 통합

**MCP 기반 "Claude-as-Investigator" 아키텍처:**

```
┌──────────────────────────────────────────────┐
│           Claude Agent (Host)                 │
│    "불법 도박 사이트 수사관" 역할              │
├──────────────────────────────────────────────┤
│                MCP Clients                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │Playwright│ │Filesystem│ │ Database │     │
│  │MCP Server│ │MCP Server│ │MCP Server│     │
│  └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐                   │
│  │ CAPTCHA  │ │ Report   │                   │
│  │MCP Server│ │MCP Server│                   │
│  │ (Custom) │ │ (Custom) │                   │
│  └──────────┘ └──────────┘                   │
└──────────────────────────────────────────────┘
```

**MCP 3대 핵심 프리미티브:**
1. **Tools**: Claude가 호출할 수 있는 함수 (브라우저 조작, CAPTCHA 풀이 요청 등)
2. **Resources**: Claude가 읽을 수 있는 데이터 (문서, DB 스키마 등)
3. **Prompt Templates**: 재사용 가능한 워크플로우 인코딩

**워크플로우 중심 설계 권장:**
- API 중심 설계 → 워크플로우 중심 MCP 아키텍처 전환 시 토큰 사용량 98.7% 절감 가능
- API 중심은 단일 MCP 서버 + 단순 쿼리에 적합하지만, 여러 MCP 서버를 횡단하는 복잡한 워크플로우에서는 워크플로우 중심 설계가 필수
- 출처: [Advanced MCP Development (Hugging Face)](https://huggingface.co/learn/mcp-course/en/unit3/introduction), [Architecture Patterns for Agentic Apps (Speakeasy)](https://www.speakeasy.com/mcp/using-mcp/ai-agents/architecture-patterns)

**Custom MCP 서버 구축 항목:**

```typescript
// gambling-investigator-mcp-server
const tools = [
  {
    name: "classify_gambling_site",
    description: "URL의 콘텐츠를 분석하여 도박 사이트 여부 판정",
    inputSchema: { url: string, html_content?: string }
  },
  {
    name: "detect_form_fields",
    description: "회원가입 페이지의 폼 필드 자동 탐지",
    inputSchema: { screenshot_base64: string, html?: string }
  },
  {
    name: "route_captcha",
    description: "CAPTCHA 유형 탐지 및 적절한 풀이 서비스 라우팅",
    inputSchema: { screenshot_base64: string }
  },
  {
    name: "generate_evidence_report",
    description: "수집된 증거를 기반으로 수사 보고서 생성",
    inputSchema: { site_data: object, screenshots: string[], classification: object }
  }
];
```

---

## 9. 최종 추천 (우선순위별 연동 포인트)

### 우선순위 1: 즉시 도입 (MVP)

| # | 연동 포인트 | 모델 | 월 비용 (500건) | ROI |
|---|-----------|------|----------------|-----|
| 1 | **콘텐츠 분류** (few-shot) | Haiku 4.5 | $1.50 | 학습 데이터 없이 즉시 시작, ML 파이프라인 생략 |
| 2 | **증거 보고서 생성** | Sonnet 4.6 | $22.50 | 수동 보고서 작성 시간 90% 절감 |
| 3 | **CAPTCHA 유형 탐지** | Haiku 4.5 | $1.50 | 기존 라우팅 로직 자동화 |

**MVP 합계: ~$25.50/월**

### 우선순위 2: 단기 개선 (1~2개월)

| # | 연동 포인트 | 모델 | 월 비용 (500건) | ROI |
|---|-----------|------|----------------|-----|
| 4 | **폼 필드 자동 탐지** (Vision) | Haiku 4.5 | $1.50 | 사이트별 수동 매핑 제거 |
| 5 | **워크플로우 오케스트레이션** | Haiku 4.5 | $3.00 | 에러 처리 자동화 |

**단기 개선 추가: ~$4.50/월**

### 우선순위 3: 중기 고도화 (3~6개월)

| # | 연동 포인트 | 모델 | 월 비용 (500건) | ROI |
|---|-----------|------|----------------|-----|
| 6 | **MCP 서버 통합** | - | 개발 비용만 | 에이전트 아키텍처 통합 |
| 7 | **Computer Use 폴백** | Sonnet 4.6 | $15~25 | 미지 사이트 처리율 향상 |

### 우선순위 4: 장기 전환 (6개월+)

| # | 연동 포인트 | 비고 |
|---|-----------|------|
| 8 | **ML 하이브리드** | 축적된 데이터로 XGBoost/BERT 학습, LLM은 어려운 케이스만 처리 |
| 9 | **완전 자율 에이전트** | Claude-as-Investigator: MCP 기반 자율 수사 시스템 |

### 총 비용 요약

| 단계 | 월 비용 | 비고 |
|------|---------|------|
| MVP (우선순위 1) | **~$25.50** | 배치 API 적용 시 ~$15 |
| 전체 도입 (1~3) | **~$45~55** | 프롬프트 캐싱 + 배치 API 적용 시 ~$25~30 |

### 핵심 권장사항

1. **Haiku 4.5를 기본 모델로 채택**: 분류, 탐지 등 단순 태스크에 최적. 비용 대비 성능이 가장 우수
2. **Sonnet 4.6은 보고서 생성 전용**: 한국어 문서 생성 품질이 필요한 곳에만 사용
3. **Opus 4.6은 사용 자제**: 일반적 용도에서는 비용 대비 이점이 크지 않음. 복잡한 법적 분석이 필요할 때만 고려
4. **배치 API + 프롬프트 캐싱 반드시 적용**: 두 할인을 조합하면 비용을 60~70% 절감 가능
5. **Playwright 우선, Computer Use 보조**: 결정론적 작업은 Playwright, 예외 상황만 Computer Use로 처리
6. **CAPTCHA "풀이"에 Claude 사용 금지**: Anthropic ToS 위반 가능성. "탐지"만 허용
7. **MCP 아키텍처를 중기 목표로 설정**: 워크플로우 중심 MCP 설계로 토큰 사용량 최적화

---

**참고 자료:**
- [Pricing - Claude API Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [Vision - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/vision)
- [Computer Use Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- [Multilingual Support - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/multilingual-support)
- [Anthropic - Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture)
- [Playwright MCP (Microsoft)](https://github.com/microsoft/playwright-mcp)
- [Zero-Shot Classification of Illicit Content (MDPI)](https://www.mdpi.com/2079-9292/14/20/4101)
- [Illegal Gambling Site Detection (Springer)](https://link.springer.com/article/10.1007/s10899-024-10337-z)
- [When XGBoost Outperforms GPT-4 (ACL)](https://aclanthology.org/2024.trustnlp-1.5.pdf)
- [Legal text classification in Korean (Springer)](https://link.springer.com/article/10.1007/s10506-025-09454-w)
- [Browser Automation Tools Compared (2026)](https://www.heyuan110.com/posts/ai/2026-01-28-claude-code-browser-automation/)
- [Top 10 MCP Servers (FastMCP)](https://fastmcp.me/blog/top-10-most-popular-mcp-servers)
- [Advanced MCP Development (Hugging Face)](https://huggingface.co/learn/mcp-course/en/unit3/introduction)
