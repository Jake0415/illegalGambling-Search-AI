import { test, expect } from '@playwright/test'

// Nginx HTTPS를 통해 백엔드 API에 접근
const API_BASE = 'https://localhost'

test.describe('인증 플로우 E2E 검증', () => {
  // ──────────────────────────────────────
  // API 검증
  // ──────────────────────────────────────

  test('백엔드 setup-status API가 슈퍼어드민 존재 여부를 반환한다', async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE}/api/v1/auth/setup-status`,
      { ignoreHTTPSErrors: true },
    )
    expect(response.ok()).toBeTruthy()

    const json = await response.json()
    expect(json.data).toHaveProperty('isSetupComplete')
    expect(typeof json.data.isSetupComplete).toBe('boolean')
    // DB에 시드 데이터로 슈퍼어드민이 존재하므로 true
    expect(json.data.isSetupComplete).toBe(true)
  })

  test('Next.js 프록시 setup-status API가 정상 동작한다', async ({
    request,
  }) => {
    const response = await request.get(
      'http://localhost:3000/api/auth/setup-status',
    )
    expect(response.ok()).toBeTruthy()

    const json = await response.json()
    expect(json.data.isSetupComplete).toBe(true)
  })

  // ──────────────────────────────────────
  // 슈퍼어드민 등록 시 리다이렉트 검증
  // ──────────────────────────────────────

  test('슈퍼어드민이 등록된 상태에서 / 접근 시 /login으로 리다이렉트', async ({
    page,
  }) => {
    // localStorage 완전 초기화 (미인증 + setup 미완료 상태 시뮬레이션)
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.clear()
    })

    await page.goto('/')
    // DB에 슈퍼어드민 존재 → checkSetupStatus()=true → 미인증이므로 /login
    await page.waitForURL('**/login', { timeout: 20000 })
    expect(page.url()).toContain('/login')
  })

  test('슈퍼어드민이 등록된 상태에서 /setup 접근 시 /login으로 리다이렉트', async ({
    page,
  }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.clear()
    })

    await page.goto('/setup')
    // SetupWizard가 checkSetupStatus() → true → /login 리다이렉트
    await page.waitForURL('**/login', { timeout: 20000 })
    expect(page.url()).toContain('/login')
  })

  // ──────────────────────────────────────
  // 페이지 렌더링 검증
  // ──────────────────────────────────────

  test('로그인 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })

    // 로그인 폼 요소 확인
    await expect(page.locator('text=로그인').first()).toBeVisible({
      timeout: 20000,
    })
  })
})
