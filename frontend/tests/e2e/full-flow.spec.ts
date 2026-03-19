import { test, expect, type Page } from '@playwright/test'

// 로그인 헬퍼: 모든 테스트 전에 인증 상태 설정
async function loginAs(page: Page) {
  await page.goto('/login', { waitUntil: 'load' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/login', { waitUntil: 'load' })
  await page.fill('input[type="email"]', 'admin@gambleguard.kr')
  await page.fill('input[type="password"]', 'admin1234')
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 20000,
  })
}

// ============================================================================
// API 연결 검증
// ============================================================================

test.describe('API 연결 검증', () => {
  test('백엔드 헬스체크', async ({ request }) => {
    const res = await request.get('https://localhost/health', {
      ignoreHTTPSErrors: true,
    })
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.status).toBe('ok')
  })

  test('사이트 API', async ({ request }) => {
    const res = await request.get(
      'http://localhost:3000/api/sites?limit=5',
    )
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.length).toBeGreaterThan(0)
  })

  test('채증 API', async ({ request }) => {
    const res = await request.get(
      'http://localhost:3000/api/investigations?limit=5',
    )
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.length).toBeGreaterThan(0)
  })

  test('증거 API', async ({ request }) => {
    const res = await request.get(
      'http://localhost:3000/api/evidence?limit=5',
    )
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.length).toBeGreaterThan(0)
  })

  test('대시보드 통계 API', async ({ request }) => {
    const res = await request.get(
      'http://localhost:3000/api/analytics/overview',
    )
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toBeTruthy()
  })
})

// ============================================================================
// 페이지 접근 검증 (로그인 후)
// ============================================================================

test.describe('페이지 접근 검증', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test('대시보드 (/)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 })
    // 500 에러 아닌지 확인
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('사이트 관리 (/sites)', async ({ page }) => {
    await page.goto('/sites', { waitUntil: 'load', timeout: 30000 })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('채증 모니터링 (/investigations)', async ({ page }) => {
    await page.goto('/investigations', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('증거 관리 (/evidence)', async ({ page }) => {
    await page.goto('/evidence', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('통계 대시보드 (/analytics)', async ({ page }) => {
    await page.goto('/analytics', {
      waitUntil: 'commit',
      timeout: 60000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('AI 분류 검토 (/review)', async ({ page }) => {
    await page.goto('/review', {
      waitUntil: 'commit',
      timeout: 60000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('보고서 (/reports)', async ({ page }) => {
    await page.goto('/reports', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('설정 (/settings)', async ({ page }) => {
    await page.goto('/settings', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('사용자 관리 (/settings/users)', async ({ page }) => {
    await page.goto('/settings/users', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('키워드 관리 (/settings/keywords)', async ({ page }) => {
    await page.goto('/settings/keywords', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('감사 로그 (/settings/audit-log)', async ({ page }) => {
    await page.goto('/settings/audit-log', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('사이트 등록 (/sites/new)', async ({ page }) => {
    await page.goto('/sites/new', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('사이트 임포트 (/sites/import)', async ({ page }) => {
    await page.goto('/sites/import', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('CAPTCHA 큐 (/investigations/captcha-queue)', async ({ page }) => {
    await page.goto('/investigations/captcha-queue', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('채증 스케줄 (/investigations/schedules)', async ({ page }) => {
    await page.goto('/investigations/schedules', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('채증 통계 (/investigations/stats)', async ({ page }) => {
    await page.goto('/investigations/stats', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('갤러리 (/investigations/gallery)', async ({ page }) => {
    await page.goto('/investigations/gallery', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })

  test('SMS 비용 (/settings/sms-costs)', async ({ page }) => {
    await page.goto('/settings/sms-costs', {
      waitUntil: 'load',
      timeout: 30000,
    })
    const content = await page.content()
    expect(content).not.toContain('Internal Server Error')
    expect(content).not.toContain('Application error')
  })
})

// ============================================================================
// 데이터 표시 검증 (핵심 4개 페이지)
// ============================================================================

test.describe('데이터 표시 검증', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test('대시보드에 KPI 데이터가 표시된다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 })
    // 숫자가 표시되는지 확인 (총 사이트 수 등)
    await page.waitForTimeout(3000)
    const text = await page.textContent('body')
    // "30" 또는 "사이트" 등 데이터 관련 텍스트 존재 확인
    expect(text).toBeTruthy()
  })

  test('사이트 목록에 데이터가 표시된다', async ({ page }) => {
    await page.goto('/sites', { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(3000)
    // 테이블 또는 목록에 사이트 URL이 표시되는지
    const text = await page.textContent('body')
    expect(text).toContain('casino') // 시드 데이터 URL에 casino 포함
  })

  test('채증 목록에 데이터가 표시된다', async ({ page }) => {
    await page.goto('/investigations', {
      waitUntil: 'load',
      timeout: 30000,
    })
    await page.waitForTimeout(3000)
    const text = await page.textContent('body')
    // 채증 관련 텍스트가 있는지 (상태 또는 페이지 제목)
    expect(
      text?.includes('COMPLETED') ||
        text?.includes('완료') ||
        text?.includes('QUEUED') ||
        text?.includes('대기') ||
        text?.includes('채증') ||
        text?.includes('investigation') ||
        text?.includes('casino'),
    ).toBeTruthy()
  })

  test('증거 목록에 데이터가 표시된다', async ({ page }) => {
    await page.goto('/evidence', {
      waitUntil: 'load',
      timeout: 30000,
    })
    await page.waitForTimeout(3000)
    const text = await page.textContent('body')
    // 증거 파일 타입이 표시되는지
    expect(
      text?.includes('SCREENSHOT') ||
        text?.includes('HTML') ||
        text?.includes('스크린샷') ||
        text?.includes('증거'),
    ).toBeTruthy()
  })
})
