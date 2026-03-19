import { test, expect } from '@playwright/test'

// Nginx HTTPS를 통해 백엔드 API에 접근
const API_BASE = 'https://localhost'

test.describe('인증 플로우 E2E 검증', () => {
  // ──────────────────────────────────────
  // API 검증
  // ──────────────────────────────────────

  test('GET /api/v1/auth/setup-status가 isSetupComplete을 반환한다', async ({
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
  })

  // ──────────────────────────────────────
  // 리다이렉트 검증
  // ──────────────────────────────────────

  test('미인증 상태에서 대시보드(/) 접근 시 /login 또는 /setup으로 리다이렉트', async ({
    page,
  }) => {
    // localStorage 초기화 (미인증 상태)
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.clear()
    })

    await page.goto('/')
    // AuthGuard가 setup 상태에 따라 /login 또는 /setup으로 리다이렉트
    await page.waitForURL(/(login|setup)/, { timeout: 20000 })
    const url = page.url()
    expect(url.includes('/login') || url.includes('/setup')).toBeTruthy()
  })

  test('슈퍼어드민 존재 시 /setup 접근하면 /login으로 리다이렉트', async ({
    page,
  }) => {
    // localStorage에 setup 완료 상태 설정 (백엔드 호출 실패 대비 폴백)
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.setItem('gambleguard_setup_complete', 'true')
    })

    await page.goto('/setup')
    await page.waitForURL('**/login', { timeout: 20000 })
    expect(page.url()).toContain('/login')
  })

  // ──────────────────────────────────────
  // 페이지 렌더링 검증
  // ──────────────────────────────────────

  test('로그인 페이지가 정상 렌더링된다', async ({ page }) => {
    // setup 완료 상태 설정
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.setItem('gambleguard_setup_complete', 'true')
      localStorage.removeItem('gambleguard_auth_token')
    })

    await page.goto('/login', { waitUntil: 'networkidle' })

    // 로그인 폼 요소 확인
    await expect(page.locator('text=로그인').first()).toBeVisible({
      timeout: 20000,
    })
  })
})
