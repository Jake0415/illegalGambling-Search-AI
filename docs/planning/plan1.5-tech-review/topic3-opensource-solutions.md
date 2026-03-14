# Topic 3: 오픈소스 솔루션 검토

> 작성일: 2026-03-14
> 담당: crawler-search-specialist + investigation-architect

## 1. 웹 크롤링 프레임워크

### 1.1 Crawlee (Node.js)

| 항목 | 내용 |
|------|------|
| GitHub | [apify/crawlee](https://github.com/apify/crawlee) |
| Stars | ~22.2k |
| 최신 버전 | v3.16.0 (2026년 2월) |
| 라이선스 | Apache 2.0 |
| 언어 | TypeScript/JavaScript |

**핵심 기능:**
- **Playwright 네이티브 통합**: `PlaywrightCrawler` 클래스로 Chromium, Firefox, WebKit 헤드리스 브라우저 병렬 크롤링 지원
- **자동 스케일링**: 시스템 리소스에 따른 동적 동시성 조절
- **안티블로킹**: 프록시 로테이션, 자동 재시도, 세션 관리 내장
- **요청 큐**: 중복 URL 제거, 크롤링 상태 영속화 지원
- **fingerprint-suite 통합**: 브라우저 핑거프린트 생성/주입 도구와 연동
- **robots.txt 준수**: `respectRobotsTxtFile` 옵션으로 규정 준수 모드 지원

**우리 프로젝트 적합성:**
- Node.js/TypeScript 스택과 100% 호환
- Playwright 기반이므로 기존 자동화 코드 재활용 가능
- 도메인 호핑 대응: 리다이렉트 추적, 요청 큐 기반 동적 URL 관리 가능
- `got-scraping` 패키지로 HTTP 수준 TLS 핑거프린트 위장도 가능

**관련 패키지:**
- [`got-scraping`](https://github.com/apify/got-scraping): 브라우저 수준 HTTP 헤더/TLS 핑거프린트 모방 HTTP 클라이언트
- [`fingerprint-suite`](https://github.com/apify/fingerprint-suite): 브라우저 핑거프린트 생성(header-generator, fingerprint-generator) + Playwright/Puppeteer 주입(fingerprint-injector)

### 1.2 Scrapy (Python)

| 항목 | 내용 |
|------|------|
| GitHub | [scrapy/scrapy](https://github.com/scrapy/scrapy) |
| Stars | ~60.8k |
| 최신 버전 | v2.13.4 (2026년 1월 5일) |
| 라이선스 | BSD |
| 언어 | Python |

**핵심 기능:**
- **비동기 아키텍처**: Twisted 기반 이벤트 구동 네트워킹으로 높은 동시성
- **분산 크롤링**: `scrapy-redis`와 연동하여 Redis 기반 다수 노드 분산 처리 가능
- **미들웨어 시스템**: 요청/응답 파이프라인 커스터마이징
- **데이터 파이프라인**: 크롤링 데이터의 검증, 변환, 저장 자동화
- **XPath/CSS 셀렉터**: 유연한 HTML 파싱

**우리 프로젝트 적합성:**
- Python 기반이므로 Node.js 스택과 직접 통합 불가 (별도 프로세스 또는 API 연동 필요)
- ML 기반 탐지 엔진을 Python으로 구축할 경우 유용
- 분산 크롤링이 필요한 대규모 도메인 스캐닝에 적합
- 브라우저 자동화(Playwright)가 아닌 HTTP 수준 크롤링에 특화

### 1.3 기타 (Colly, node-crawler)

#### Colly (Go)

| 항목 | 내용 |
|------|------|
| GitHub | [gocolly/colly](https://github.com/gocolly/colly) |
| Stars | ~25.1k |
| 언어 | Go |

- 단일 코어에서 초당 1,000+ 요청 처리 가능한 고성능
- Go 언어의 goroutine 기반 동시성으로 오버헤드 최소화
- 경량 바이너리로 배포 간편
- **한계**: JavaScript 렌더링 미지원, 브라우저 자동화 불가 -> 불법 도박 사이트 크롤링에 부적합

#### node-crawler

| 항목 | 내용 |
|------|------|
| GitHub | [bda-research/node-crawler](https://github.com/bda-research/node-crawler) |
| Stars | ~3.3k |
| 최신 버전 | v2.0.2 |
| 언어 | JavaScript (ESM) |

- Node.js 18+ 필요, ESM 전용 (v2부터)
- HTTP/2 지원, jQuery 스타일 DOM 조작
- **한계**: 브라우저 자동화 미지원, 안티봇 우회 기능 없음, 프록시 관리 기본적

### 1.4 비교 표

| 기준 | Crawlee | Scrapy | Colly | node-crawler |
|------|---------|--------|-------|-------------|
| 언어 | TypeScript | Python | Go | JavaScript |
| Playwright 통합 | O (네이티브) | X | X | X |
| JS 렌더링 | O | X (Splash 별도) | X | X |
| 안티봇 우회 | O (내장) | 미들웨어 | X | X |
| 분산 크롤링 | Apify 플랫폼 | scrapy-redis | 자체 구현 | X |
| 프록시 관리 | O (내장) | O (미들웨어) | O (기본) | 기본 |
| 도메인 호핑 대응 | O (요청 큐) | O (파이프라인) | 제한적 | X |
| 우리 스택 호환성 | **최고** | 낮음 | 낮음 | 중간 |
| GitHub Stars | 22.2k | 60.8k | 25.1k | 3.3k |
| 추천도 | **최우선 채택** | ML 연동 시 고려 | 비추천 | 비추천 |

---

## 2. CAPTCHA 풀이 오픈소스

### 2.1 Tesseract.js / Tesseract OCR

| 항목 | 내용 |
|------|------|
| GitHub | [naptha/tesseract.js](https://github.com/naptha/tesseract.js) |
| Stars | ~35k+ |
| 언어 | JavaScript (브라우저/Node.js) |

**주요 CAPTCHA 풀이 프로젝트:**
- [Captcha-Solver (SomnathKar000)](https://github.com/SomnathKar000/Captcha-Solver): Tesseract OCR 기반 웹 앱
- [GOTCHA (SchaeferJ)](https://github.com/SchaeferJ/GOTCHA): Tesseract OCR 기반 CAPTCHA 풀이
- [captcha-solver (Atharva2864)](https://github.com/Atharva2864/captcha-solver): 자체 호스팅 가능, HTTP API 제공, 외부 서비스 불필요
  - CLAHE, 적응형 임계값, 형태학적 연산 등 고급 전처리
  - 다중 전략 OCR + 투표 메커니즘

**정확도 한계:**
- 단순 텍스트 CAPTCHA (숫자/문자)에는 전처리 최적화 시 70-90% 정확도 가능
- 왜곡이 심한 CAPTCHA, reCAPTCHA, hCAPTCHA에는 사실상 무용

### 2.2 ML 기반 CAPTCHA 풀이

| 프로젝트 | 모델 | 특징 |
|----------|------|------|
| [CAPTCHA-Solver (jameskokoska)](https://github.com/jameskokoska/CAPTCHA-Solver) | CNN + 양방향 LSTM | CTC 손실함수, 문자 시퀀스 인식 |
| [Simple-Captcha-Solver](https://github.com/AlessandroZanatta/Simple-Captcha-Solver) | ML 기반 | 높은 정확도, 빠른 처리 |
| TensorFlow OCR 모델 | CNN + CTC | ONNX 변환 가능, 로컬 실행 |

**ONNX 로컬 실행:**
- [ONNX Runtime](https://onnxruntime.ai/): 크로스 플랫폼 ML 모델 가속 엔진
- PyTorch/TensorFlow 모델을 ONNX 포맷으로 변환 후 Node.js에서 `onnxruntime-node`로 실행 가능
- 단, ONNX Model Zoo의 LFS 다운로드는 2025년 7월부터 중단 -> Hugging Face로 이전

### 2.3 비용 대비 효과 분석

```
현실 분석 결과:
- 불법 도박 사이트에서 CAPTCHA 출현 빈도: 매우 낮음 (드물게 발견)
- 상용 서비스 비용: CapSolver/2Captcha 기준 ~$2/월 (월 200건 기준)
- 오픈소스 자체 구축 비용: 모델 학습 + 전처리 파이프라인 + 유지보수 = 40시간+

결론: 오픈소스 CAPTCHA 풀이에 투자하는 것은 비용 대비 효과가 극히 낮음
-> CapSolver/2Captcha API를 우선 사용하되, 볼륨 증가 시 재검토
```

---

## 3. 안티봇 우회 라이브러리

### 3.1 undetected-chromedriver (Python)

| 항목 | 내용 |
|------|------|
| GitHub | [ultrafunkamsterdam/undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) |
| Stars | ~12.4k |
| 언어 | Python |

- Selenium ChromeDriver의 커스텀 포크
- Cloudflare, Distil, Imperva, DataDome 등 주요 안티봇 시스템 우회
- Zero-Config 설정으로 즉시 사용 가능
- **한계**: Python 전용, Selenium 기반이므로 Playwright와 직접 호환 불가

### 3.2 nodriver (Python)

| 항목 | 내용 |
|------|------|
| GitHub | [ultrafunkamsterdam/nodriver](https://github.com/ultrafunkamsterdam/nodriver) |
| Stars | ~5k+ |
| 언어 | Python |

- undetected-chromedriver의 공식 후속작
- Selenium/WebDriver 바이너리 없이 CDP(Chrome DevTools Protocol) 직접 통신
- 비동기 설계로 성능 향상
- Captcha/CloudFlare/Imperva/hCaptcha 우회
- **한계**: Python 전용, Node.js 스택과 직접 통합 불가

### 3.3 curl-impersonate

| 항목 | 내용 |
|------|------|
| GitHub | [lwthiker/curl-impersonate](https://github.com/lwthiker/curl-impersonate) |
| 활성 포크 | [lexiforest/curl-impersonate](https://github.com/lexiforest/curl-impersonate) |
| 언어 | C (curl 패치) |

- curl을 Chrome/Firefox/Safari의 TLS 핑거프린트와 동일하게 만드는 패치
- BoringSSL(Chrome용) 또는 NSS(Firefox용)로 컴파일
- TLS ClientHello, HTTP/2 설정, 헤더 순서까지 브라우저와 동일
- Python 바인딩: [`curl_cffi`](https://github.com/lexiforest/curl_cffi) (브라우저 TLS/JA3/HTTP2 핑거프린트 모방)
- **Node.js 직접 사용**: 제한적, 커뮤니티 래퍼 존재하나 성숙도 낮음

### 3.4 got-scraping (Node.js)

| 항목 | 내용 |
|------|------|
| GitHub | [apify/got-scraping](https://github.com/apify/got-scraping) |
| npm | `got-scraping` |
| 언어 | TypeScript |

- `got` HTTP 클라이언트 확장판
- 브라우저 수준 HTTP 헤더 자동 생성 (`header-generator` 패키지 활용)
- TLS 핑거프린트 모방: `TLS_AES_256_GCM_SHA384` 등 브라우저 동일 cipher 사용
- HTTP/2 자동 ALPN 협상
- 프록시 URL 간편 설정
- **Crawlee와 네이티브 통합**: `HttpCrawler`에서 기본 HTTP 클라이언트로 사용

### 3.5 Canvas/WebGL 스푸핑

| 프로젝트 | 내용 |
|----------|------|
| [undetectable-fingerprint-browser](https://github.com/itbrowser-net/undetectable-fingerprint-browser) | 오픈소스 Multilogin 대안, Canvas/WebGL/User-Agent 스푸핑 |
| [fingerprint-suite (Apify)](https://github.com/apify/fingerprint-suite) | Playwright/Puppeteer용 핑거프린트 생성+주입 |
| Camoufox | C++ 수준 Firefox 수정, JS 후킹보다 탐지 회피율 높음 |

**현실적 고려사항:**
- WebGL 핑거프린트는 하드웨어 수준 데이터 의존으로 완벽한 스푸핑 어려움
- 오픈소스 우회 도구는 공개되어 있으므로 안티봇 시스템이 빠르게 대응
- C++ 수준 수정(Camoufox 등)이 JS 후킹보다 효과적

### 3.6 안티봇 라이브러리 비교 표

| 기준 | undetected-chromedriver | nodriver | curl-impersonate | got-scraping | fingerprint-suite |
|------|------------------------|----------|-----------------|-------------|-------------------|
| 언어 | Python | Python | C | **TypeScript** | **TypeScript** |
| 우리 스택 호환 | X | X | 제한적 | **O** | **O** |
| 브라우저 자동화 | O (Selenium) | O (CDP) | X (HTTP만) | X (HTTP만) | **O (Playwright)** |
| TLS 핑거프린트 | 부분적 | 부분적 | **완벽** | 양호 | N/A |
| 핑거프린트 스푸핑 | 기본 | 기본 | N/A | 헤더 | **Canvas/WebGL** |
| Playwright 호환 | X | X | X | X | **O** |
| 추천도 | 참고용 | 참고용 | HTTP 전용 시 고려 | **채택** | **채택** |

---

## 4. 디지털 증거 수집 도구

### 4.1 Autopsy / Sleuth Kit

| 항목 | 내용 |
|------|------|
| GitHub | [sleuthkit/autopsy](https://github.com/sleuthkit/autopsy) |
| Stars | ~3k |
| 최신 버전 | v4.21.0 |
| 라이선스 | Apache 2.0 |
| 언어 | Java |

**핵심 기능:**
- 디스크 이미지 분석, 파일 시스템 포렌식 (NTFS, FAT, exFAT, ext2/3, HFS, APFS)
- 웹 브라우저 아티팩트 추출 (Chrome, Firefox, IE)
- 키워드 검색, 타임라인 분석
- HTML, PDF, Excel 형태 보고서 생성
- 법 집행 기관, 군대, 기업에서 활용

**우리 프로젝트 적합성:**
- 디스크 포렌식 도구이므로 웹 크롤링 증거 수집에는 직접 사용 부적합
- 수집된 증거 파일의 사후 분석 도구로는 활용 가능
- Java 기반이므로 Node.js와 통합 어려움
- **결론**: 직접 채택보다는 증거 분석 참고 도구로 활용

### 4.2 Webrecorder / ArchiveWeb.page / ReplayWeb.page

| 항목 | 내용 |
|------|------|
| GitHub | [webrecorder/archiveweb.page](https://github.com/webrecorder/archiveweb.page) |
| Stars | ~1.4k |
| 최신 버전 | v0.16.0 (2025년 12월 6일) |
| 라이선스 | AGPL-3.0 |

**핵심 기능:**
- Chrome DevTools Protocol 기반 네트워크 트래픽 캡처
- WARC (Web ARChive) / WACZ (Web Archive Collection Zipped) 포맷으로 내보내기
- ReplayWeb.page로 아카이브된 웹페이지 재현(Replay)
- 내장 전체 텍스트 검색
- IPFS 기반 P2P 아카이브 공유 (실험적)

**증거 수집 적합성:**
- WARC 포맷은 인터넷 아카이브(Wayback Machine)와 동일한 표준 포맷
- 네트워크 수준 캡처로 높은 충실도 (high-fidelity) 보장
- Chrome 확장 프로그램 형태 -> Playwright와 직접 통합은 커스터마이징 필요
- **핵심 가치**: WARC/WACZ 포맷의 라이브러리(`wabac.js`, `warcio.js`)를 활용하여 자체 증거 저장 파이프라인 구축 가능

### 4.3 SingleFile

| 항목 | 내용 |
|------|------|
| GitHub | [gildas-lormeau/SingleFile](https://github.com/gildas-lormeau/SingleFile) |
| Stars | ~20.6k |
| CLI 도구 | [single-file-cli](https://github.com/gildas-lormeau/single-file-cli) |
| 라이선스 | AGPL-3.0 |

**핵심 기능:**
- 웹페이지 전체를 단일 HTML 파일로 저장 (이미지, CSS, JS, 폰트, 프레임 포함)
- Chrome, Firefox, Edge, Safari, Brave 등 다수 브라우저 지원
- **CLI 도구**: `single-file-cli`로 커맨드라인에서 자동화 가능
- 원본과 시각적으로 동일한 결과물

**증거 수집 적합성:**
- CLI 도구로 Playwright 크롤링 파이프라인에 통합 가능
- 단일 HTML 파일이므로 증거 보관/전달 용이
- **한계**: 네트워크 수준 캡처가 아닌 DOM 수준 저장 -> 동적 콘텐츠 일부 누락 가능
- 메타데이터(타임스탬프, URL 등) 포함되나 법적 증거로서의 무결성 증명은 별도 필요

### 4.4 법적 증거력 분석

**법정 제출 가능한 디지털 증거 요건:**
1. **진정성 (Authenticity)**: 증거가 원본과 동일함을 증명
2. **무결성 (Integrity)**: 수집 이후 변조되지 않았음을 증명
3. **연쇄 보관 (Chain of Custody)**: 증거의 취급 이력 문서화
4. **메타데이터 보존**: 타임스탬프, 지오로케이션, URL, 사용자 정보

**스크린샷의 한계:**
- 미국 연방증거규칙(Federal Rules of Evidence) 기준, 스크린샷은 변조 가능성으로 인해 단독 증거로 부족
- 전문 포렌식 도구로 수집 + 해시값 기록 + 타임스탬프 인증이 병행되어야 증거력 확보

**권장 증거 패키지 구성:**
```
evidence_package/
  evidence.warc.gz          # WARC 포맷 원본 트래픽
  screenshot.png            # 시각적 증거
  page.html                 # SingleFile 단일 HTML
  metadata.json             # URL, 타임스탬프, 해시, 수집 조건
  hash_manifest.sha256      # SHA-256 해시 목록
  timestamp_proof.ots       # OpenTimestamps 인증
  collection_log.json       # 수집 과정 상세 로그
```

---

## 5. 도박/불법 사이트 탐지 프로젝트

### 5.1 학술 연구

#### 불법 온라인 도박 사이트 탐지 (Journal of Gambling Studies, 2024)

| 항목 | 내용 |
|------|------|
| 논문 | "Illegal Online Gambling Site Detection using Multiple Resource-Oriented Machine Learning" |
| 출처 | [Springer Link](https://link.springer.com/article/10.1007/s10899-024-10337-z) |
| 분석 규모 | 11,172개 사이트 |

**핵심 기법:**
- URL, WHOIS, INDEX(메인 페이지), 랜딩 페이지 정보를 핵심 특징(feature)으로 분류
- 텍스트 분석 + 이미지 분석을 결합한 ML 기반 접근
- 다중 리소스 지향 모델로 높은 탐지 성능 달성

#### KAIST Gamble Tracker

| 항목 | 내용 |
|------|------|
| 기관 | KAIST 사이버보안연구센터 (CSRC) |
| 출처 | [보안뉴스 기사](https://m.boannews.com/html/detail.html?idx=133333) |
| 지원 기관 | 문화체육관광부, 사행산업통합감독위원회, 한국마사회, 강원랜드, 체육진흥공단 |

**핵심 기능:**
- BERT 언어 모델 기반 불법 도박 사이트 탐지
- 불법 도박 외 8종 유해 웹사이트(웹툰, 토렌트, 성인사이트 등) 분류 가능
- **설명 가능한 AI (XAI)**: 키워드와 관계를 그래프로 시각화하여 비전문가도 분류 근거 이해 가능
- 웹 기반 API로 대량 도메인 분석 지원
- **맥락**: KISA 신고 스팸 문자 연간 약 1,000만 건 중 ~50%가 불법 도박 관련

### 5.2 악성 URL 탐지 프로젝트 (GitHub)

| 프로젝트 | 모델 | Stars | 특징 |
|----------|------|-------|------|
| [URLBERT](https://github.com/Davidup1/URLBERT) | BERT 기반 사전학습 | - | 대규모 URL 데이터셋으로 사전학습, 다운스트림 분류 |
| [URLNet](https://github.com/Antimalweb/URLNet) | 딥러닝 (CNN) | - | URL 표현 학습으로 악성 URL 탐지 |
| [URLTran](https://github.com/bfilar/URLTran) | Transformer | - | PyTorch/HuggingFace 구현, 피싱 URL 탐지 |
| [PMANet](https://github.com/Alixyvtte/Malicious-URL-Detection-PMANet) | 사전학습 언어모델 + 어텐션 | - | 다중 수준 특징 어텐션 네트워크 |
| [End-to-End 악성 URL 탐지](https://github.com/Priyanshu9898/End-to-End-Malicious-URL-Detection) | CNN, RNN, Transformer | - | 전통적 ML + 딥러닝 + NLP 기법 종합 |

### 5.3 우리 프로젝트에 적용 가능한 접근법

```
1단계 (규칙 기반): URL 패턴, 도메인 등록 정보, 페이지 키워드 매칭
  -> 즉시 구현 가능, 높은 정밀도(precision)

2단계 (ML 기반): URLBERT/URLTran 등 사전학습 모델 파인튜닝
  -> KAIST 논문의 다중 리소스 접근법 참고
  -> URL + WHOIS + 페이지 콘텐츠 + 스크린샷 이미지 결합

3단계 (BERT 파인튜닝): 한국어 불법 도박 특화 모델
  -> KAIST Gamble Tracker의 BERT 접근법 참고
  -> 자체 레이블링 데이터 축적 후 파인튜닝
```

---

## 6. 증거 무결성 도구

### 6.1 OpenTimestamps

| 항목 | 내용 |
|------|------|
| 웹사이트 | [opentimestamps.org](https://opentimestamps.org/) |
| GitHub | [opentimestamps/opentimestamps-client](https://github.com/opentimestamps/opentimestamps-client) |
| 비용 | **무료** |
| 방식 | 비트코인 블록체인 기반 |

**핵심 원리:**
- 파일의 해시값을 비트코인 블록체인에 앵커링
- 무한 확장 가능: 여러 타임스탬프를 하나의 비트코인 트랜잭션에 통합
- 공개 캘린더 서버가 트랜잭션 비용 부담 -> 사용자 무료
- 파일 자체는 로컬에 유지 (해시만 전송)

**법적 증거력:**
- 분산, 탈중앙화, 검열 불가능, 크로스 관할권 설계
- 비트코인 풀노드만 있으면 독립적 검증 가능 (서버/벤더 불필요)
- 10년 후에도 검증 가능한 영속성

**사용법:**
```bash
# 타임스탬프 생성
ots stamp evidence_package.zip

# 검증
ots verify evidence_package.zip.ots
```

**우리 프로젝트 적합성: 최우선 채택 권장**
- 무료, 설치 간편, 법적 증거력 보강에 가장 효과적
- 증거 패키지 해시에 타임스탬프를 찍어 수집 시점 증명

### 6.2 RFC 3161 타임스탬프

| 항목 | 내용 |
|------|------|
| 표준 | RFC 3161 (Internet X.509 PKI Time-Stamp Protocol) |
| Node.js 라이브러리 | [`pdf-rfc3161`](https://github.com/mingulov/pdf-rfc3161) |
| 기타 npm | `timestamp-trusted` (6년 전 마지막 업데이트, 비추천) |

**RFC 3161 원리:**
- 클라이언트가 데이터 해시를 TSA(Timestamp Authority)에 제출
- TSA가 해시 + 타임스탬프 + 디지털 인증서를 포함한 서명 토큰 반환
- 전통적 PKI 기반으로 법적 인정 범위 넓음

**Node.js 활용:**
- `pdf-rfc3161`: 순수 JS/TS 라이브러리, Node.js/Cloudflare Workers/브라우저 호환
  - PDF에 RFC 3161 타임스탬프 추가 특화
  - 네이티브 의존성 없음, 2026년 1월 Hacker News 발표
- 일반 RFC 3161 Node.js 클라이언트는 아직 성숙한 라이브러리 부족
  - 자체 HTTP 클라이언트로 TSA 서버와 통신하는 경량 구현 고려

**우리 프로젝트 적합성:**
- OpenTimestamps와 병행 사용 권장 (이중 타임스탬프)
- RFC 3161은 기존 법률 체계에서 더 넓은 인정 기반
- OpenTimestamps는 탈중앙화 + 무료의 장점

### 6.3 WORM (Write-Once Read-Many) 스토리지

**옵션:**
| 솔루션 | 방식 | 비용 |
|--------|------|------|
| AWS S3 Object Lock | 클라우드 WORM | 종량제 |
| Azure Immutable Blob Storage | 클라우드 WORM | 종량제 |
| MinIO Object Lock | 자체 호스팅 S3 호환 | 오픈소스 무료 |

**권장:**
- 초기에는 로컬 파일 시스템 + 해시 매니페스트 + OpenTimestamps로 충분
- 규모 확대 시 MinIO Object Lock (S3 호환, WORM 모드) 도입 검토

---

## 7. 최종 추천 (채택 vs 자체 구현)

### 7.1 의사결정 테이블

| 도구/영역 | 결정 | 근거 | 우선순위 |
|-----------|------|------|----------|
| **Crawlee** | **채택** | Node.js 네이티브, Playwright 통합, 안티블로킹 내장, 22.2k stars 활발한 커뮤니티 | P0 |
| **got-scraping** | **채택** | Crawlee와 통합, HTTP 수준 TLS 핑거프린트 모방, 경량 요청에 활용 | P0 |
| **fingerprint-suite** | **채택** | Playwright 핑거프린트 주입, Crawlee 생태계 일부 | P0 |
| **Scrapy** | 보류 | Python ML 엔진 구축 시 재검토, 현재 Node.js 스택과 미스매치 | P2 |
| **Colly / node-crawler** | **비채택** | JS 렌더링 미지원, 안티봇 우회 없음, 불법 도박 사이트에 부적합 | - |
| **CAPTCHA 오픈소스** | **비채택** | 월 $2 비용 대비 자체 구축 ROI 극히 낮음 | - |
| **CapSolver/2Captcha API** | **채택** | 저비용, 높은 정확도, 유지보수 불필요 | P1 |
| **undetected-chromedriver / nodriver** | **참고만** | Python 전용, 우회 전략과 아키텍처 패턴을 참고하여 Playwright에 적용 | - |
| **curl-impersonate** | 보류 | Node.js 래퍼 미성숙, got-scraping이 대안 역할 수행 | P3 |
| **SingleFile CLI** | **채택** | 증거 보관용 단일 HTML 생성, CLI로 파이프라인 통합 용이 | P1 |
| **WARC/WACZ (warcio.js)** | **자체 구현** | Webrecorder의 라이브러리 활용하여 WARC 저장 파이프라인 자체 구축 | P1 |
| **Autopsy / Sleuth Kit** | **비채택** | 디스크 포렌식 도구, 웹 증거 수집과 목적 불일치 | - |
| **URL 탐지 모델 (URLBERT 등)** | **2단계 채택** | 1단계 규칙 기반 후, 데이터 축적 시 파인튜닝 | P2 |
| **KAIST Gamble Tracker 접근법** | **참고** | BERT + XAI 아키텍처를 자체 모델 설계 시 벤치마크로 활용 | P2 |
| **OpenTimestamps** | **채택** | 무료, 비트코인 기반 타임스탬프, 증거 무결성 핵심 도구 | P0 |
| **RFC 3161 타임스탬프** | **자체 구현** | pdf-rfc3161 참고하여 경량 TSA 클라이언트 구현, OpenTimestamps와 병행 | P1 |
| **WORM 스토리지** | 보류 | 초기에는 해시 매니페스트로 충분, 규모 확대 시 MinIO 검토 | P3 |

### 7.2 우선순위별 구현 로드맵

```
Phase 1 (P0 - 즉시 채택):
  - Crawlee + PlaywrightCrawler 기반 크롤링 엔진
  - got-scraping으로 경량 HTTP 요청 처리
  - fingerprint-suite로 브라우저 핑거프린트 관리
  - OpenTimestamps로 증거 타임스탬프 자동화

Phase 2 (P1 - 핵심 구현):
  - SingleFile CLI 통합 (증거 HTML 생성)
  - WARC 저장 파이프라인 (warcio.js 활용)
  - CapSolver/2Captcha API 연동 (CAPTCHA 발생 시)
  - RFC 3161 경량 클라이언트 구현

Phase 3 (P2 - ML 고도화):
  - 규칙 기반 도박 사이트 탐지 엔진 구축
  - 데이터 축적 후 URLBERT/URLTran 파인튜닝
  - KAIST 접근법 참고한 다중 리소스 분류 모델

Phase 4 (P3 - 확장):
  - WORM 스토리지 도입 (MinIO Object Lock)
  - 분산 크롤링 아키텍처 (필요 시 Scrapy 또는 Crawlee 분산 모드)
  - curl-impersonate Node.js 래퍼 성숙 시 재검토
```

### 7.3 핵심 아키텍처 요약

```
[크롤링 계층]
  Crawlee (PlaywrightCrawler)
    + fingerprint-suite (핑거프린트 관리)
    + got-scraping (HTTP 요청)
    + CapSolver API (CAPTCHA)

[증거 수집 계층]
  Playwright 스크린샷/PDF
    + SingleFile CLI (단일 HTML)
    + WARC 저장 (warcio.js)
    + 메타데이터 JSON 생성

[증거 무결성 계층]
  SHA-256 해시 매니페스트
    + OpenTimestamps (비트코인 타임스탬프)
    + RFC 3161 TSA (PKI 타임스탬프)
    + 수집 로그 체인

[탐지 계층]
  1단계: 규칙 기반 (URL 패턴, 키워드)
  2단계: ML 기반 (URLBERT 파인튜닝)
  3단계: BERT 한국어 특화 모델
```

---

## 참고 자료

### 웹 크롤링
- [Crawlee 공식 사이트](https://crawlee.dev/)
- [Crawlee GitHub](https://github.com/apify/crawlee)
- [Scrapy 공식 사이트](https://www.scrapy.org/)
- [Scrapy GitHub](https://github.com/scrapy/scrapy)
- [Colly GitHub](https://github.com/gocolly/colly)
- [node-crawler GitHub](https://github.com/bda-research/node-crawler)
- [got-scraping GitHub](https://github.com/apify/got-scraping)
- [fingerprint-suite GitHub](https://github.com/apify/fingerprint-suite)

### CAPTCHA 풀이
- [Tesseract.js CAPTCHA Solver](https://github.com/SomnathKar000/Captcha-Solver)
- [GOTCHA - Tesseract CAPTCHA](https://github.com/SchaeferJ/GOTCHA)
- [ML CAPTCHA Solver (LSTM)](https://github.com/jameskokoska/CAPTCHA-Solver)
- [ONNX Runtime](https://onnxruntime.ai/)

### 안티봇 우회
- [undetected-chromedriver GitHub](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
- [nodriver GitHub](https://github.com/ultrafunkamsterdam/nodriver)
- [curl-impersonate GitHub](https://github.com/lwthiker/curl-impersonate)
- [curl_cffi GitHub](https://github.com/lexiforest/curl_cffi)
- [undetectable-fingerprint-browser](https://github.com/itbrowser-net/undetectable-fingerprint-browser)
- [Anti-detect Framework Evolution (Security Boulevard)](https://securityboulevard.com/2025/06/from-puppeteer-stealth-to-nodriver-how-anti-detect-frameworks-evolved-to-evade-bot-detection/)

### 디지털 증거
- [Autopsy GitHub](https://github.com/sleuthkit/autopsy)
- [ArchiveWeb.page GitHub](https://github.com/webrecorder/archiveweb.page)
- [SingleFile GitHub](https://github.com/gildas-lormeau/SingleFile)
- [single-file-cli GitHub](https://github.com/gildas-lormeau/single-file-cli)
- [Digital Evidence Admissibility (UNODC)](https://www.unodc.org/e4j/en/cybercrime/module-6/key-issues/digital-evidence-admissibility.html)

### 도박/불법 사이트 탐지
- [Illegal Online Gambling Site Detection (Springer, 2024)](https://link.springer.com/article/10.1007/s10899-024-10337-z)
- [KAIST 사이버보안연구센터](https://csrc.kaist.ac.kr/content?menu=211)
- [KAIST Gamble Tracker 보안뉴스](https://m.boannews.com/html/detail.html?idx=133333)
- [URLBERT GitHub](https://github.com/Davidup1/URLBERT)
- [URLTran GitHub](https://github.com/bfilar/URLTran)

### 증거 무결성
- [OpenTimestamps 공식 사이트](https://opentimestamps.org/)
- [OpenTimestamps Client GitHub](https://github.com/opentimestamps/opentimestamps-client)
- [pdf-rfc3161 GitHub](https://github.com/mingulov/pdf-rfc3161)
- [Blockchain Timestamping 2025 (OriginStamp)](https://originstamp.com/blog/reader/blockchain-timestamping-2025-data-integrity/en)
