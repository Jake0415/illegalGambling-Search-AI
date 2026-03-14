# Playwright 실제 사이트 접속 테스트 보고서

> 테스트일: 2026-03-14

---

## 1. 테스트 개요

Playwright MCP를 사용하여 실제 도박 관련 사이트에 접속하고, 자동화 채증 파이프라인의 기술적 타당성을 검증했다.

---

## 2. 테스트 결과 요약

### 2.1 사이트 접속 결과

| 사이트 | 유형 | 접속 결과 | 안티봇 | 비고 |
|--------|------|----------|--------|------|
| lenezrouge.com | 사설토토 | ❌ DNS 실패 | - | 도메인 폐쇄/만료 |
| webulk.bio | 사설토토 | ❌ DNS 실패 | - | 도메인 폐쇄/만료 |
| tiendamundomuebles.com | 사설토토 | ⚠️ 리디렉트 | - | 도메인 만료 → 교육 사이트로 전환 |
| 82savage.com | 원엑스벳 한국 | ❌ 연결 거부 | - | CONNECTION_RESET |
| 1win-abc82.com | 1WIN 한국 | ❌ 연결 거부 | - | CONNECTION_RESET |
| **wego88casino.com** | **위고88** | **✅ 접속 성공** | **없음** | **한국어 지원, 전체 테스트 수행** |
| **totohot.net** | **먹튀검증** | **✅ 접속 성공** | **Cloudflare** | **챌린지 자동 통과됨** |

**핵심 발견**: 불법 도박 사이트는 도메인을 빈번하게 변경(도메인 호핑)하여 6개 중 4개가 접속 불가. 실제 운영 중인 사이트를 실시간으로 추적해야 함.

---

### 2.2 Wego88 (위고88) — 상세 테스트

#### 메인화면 (1단계 채증) ✅
- **접속 URL**: `https://www.wego88casino.com/`
- **안티봇**: 없음 (Playwright 기본 설정으로 접속 성공)
- **팝업**: 3개의 프로모션 팝업 자동 출현 → 닫기 버튼으로 처리 필요
- **캡처**: 풀페이지 스크린샷 성공 (`screenshot-wego88-main.png`)
- **특이사항**: 라이브챗(LiveChat) 위젯이 화면을 일부 가림

#### 회원가입 페이지 (2단계 채증) ✅
- **URL**: `/register`
- **CAPTCHA**: ❌ **CAPTCHA 없음**
- **SMS OTP 인증**: ✅ **필수** — "+82" 한국번호 + OTP 인증코드 입력
- **캡처**: 가입 폼 전체 스크린샷 성공 (`screenshot-wego88-register.png`)

**가입 폼 필드 분석:**

| 필드 | 유형 | 필수 | 자동화 난이도 |
|------|------|------|-------------|
| 회원아이디 | 텍스트 | ✅ | 쉬움 (랜덤 생성) |
| 비밀번호 | 텍스트 | ✅ | 쉬움 (4~20자, 문자+숫자) |
| 비밀번호 확인 | 텍스트 | ✅ | 쉬움 |
| 통화 | 드롭다운 | ✅ | 쉬움 (KRW 기본값) |
| 전화번호 | +82 입력 | ✅ | **핵심** (가상번호 필요) |
| OTP 인증코드 | 텍스트 | ✅ | **핵심** (SMS 수신 → 파싱 → 입력) |
| 친구 추천 | 텍스트 | ❌ | 불필요 |
| 에이전트 이름 | 읽기전용 | ❌ | 자동 설정됨 |

#### 스포츠 배팅 페이지 (배팅 시작 화면) ✅
- **URL**: `/sports`
- **접근 제한**: 로그인 없이도 배팅 목록 페이지 접근 가능
- **캡처**: 스포츠북 목록 스크린샷 성공 (`screenshot-wego88-sports.png`)
- **스포츠북 6개**: SBO Sports Modern, BTi Sports, APGaming(Pinnacle), Saba Sports, Saba E-Sports, SBO Sports Global
- **실제 배팅 화면**: 로그인 필수 → 회원가입 완료 후 접근 가능

---

### 2.3 TotoHot (토토핫) — Cloudflare 챌린지 테스트

- **초기 접속**: "보안 확인 수행 중" 페이지 표시 (Cloudflare Turnstile)
- **결과**: **Playwright 기본 설정으로 자동 통과** (약 3~5초 소요)
- **캡처**: Cloudflare 통과 후 정상 페이지 캡처 성공 (`screenshot-cloudflare-challenge.png`)

**시사점**: Cloudflare JS Challenge는 Playwright stealth 플러그인 없이도 통과 가능한 경우가 있음. 다만 Turnstile CAPTCHA(체크박스)가 표시되는 경우는 별도 처리 필요.

---

## 3. 핵심 발견사항

### 3.1 CAPTCHA 상황 (예상과 다름)

| 예상 | 실제 |
|------|------|
| 회원가입 시 CAPTCHA 필수 | Wego88: CAPTCHA 없음, SMS OTP만 필수 |
| 모든 사이트에 Cloudflare | 일부만 사용 (Wego88: 없음, TotoHot: 있음) |
| reCAPTCHA/hCaptcha 빈번 | 테스트한 사이트에서는 미출현 |

**결론**: 불법 도박 사이트의 주요 보안 장벽은 CAPTCHA보다 **SMS OTP 인증**이다. CAPTCHA는 부차적 장벽.

### 3.2 실제 채증 플로우 수정

기존 계획에서 CAPTCHA를 최대 난관으로 상정했으나, 실제 테스트 결과:

```
[주요 난관 순위]
1위: SMS OTP 인증 (거의 모든 사이트 필수) ← 핵심 해결 과제
2위: 도메인 호핑 (6개 중 4개 접속 불가) ← 실시간 도메인 추적 필요
3위: 팝업/광고 처리 (접속 시 다수 팝업)
4위: Cloudflare/안티봇 (일부 사이트만)
5위: CAPTCHA (예상보다 적음)
```

### 3.3 팝업 처리 자동화 필요

Wego88 접속 시 **3개의 팝업 광고**가 연속 출현하여 UI 인터랙션을 차단했다. 자동화 시:
- 팝업 감지 → 닫기 버튼 자동 클릭
- `dialog` 이벤트 핸들링
- 오버레이 감지 후 제거

---

## 4. 기획 문서 반영 사항

### captcha-strategy.md 업데이트 필요
- CAPTCHA 비중 하향 조정
- SMS OTP를 최우선 해결 과제로 격상
- 팝업 처리 로직 추가

### service-concept.md 업데이트 필요
- 도메인 호핑 대응 전략 강화 (실시간 도메인 추적)
- 채증 플로우에 팝업 처리 단계 추가

### research-report.md 업데이트 필요
- 실제 테스트 기반 사이트 특성 추가
- 안티봇 현황 업데이트 (Cloudflare 자동 통과 가능성)

---

## 5. 캡처된 증거 파일

| 파일명 | 내용 | 단계 |
|--------|------|------|
| `screenshot-wego88-main.png` | Wego88 메인화면 | 1단계 채증 |
| `screenshot-wego88-register.png` | Wego88 회원가입 폼 | 2단계 (가입) |
| `screenshot-wego88-sports.png` | Wego88 스포츠 배팅 목록 | 2단계 (배팅시작) |
| `screenshot-cloudflare-challenge.png` | TotoHot Cloudflare 통과 후 | 안티봇 테스트 |
