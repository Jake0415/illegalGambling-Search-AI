import { test, expect } from '@playwright/test'

test.describe('보안 헤더 검증', () => {
  test('필수 보안 헤더가 모든 응답에 포함되어야 한다', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    // X-Frame-Options: 클릭재킹 방지
    expect(headers['x-frame-options']).toBe('DENY')

    // X-Content-Type-Options: MIME 스니핑 방지
    expect(headers['x-content-type-options']).toBe('nosniff')

    // Referrer-Policy: 리퍼러 정보 제한
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')

    // HSTS: HTTPS 강제
    expect(headers['strict-transport-security']).toContain('max-age=')

    // Permissions-Policy: 브라우저 기능 제한
    expect(headers['permissions-policy']).toBeDefined()

    // CSP: 콘텐츠 보안 정책
    expect(headers['content-security-policy']).toBeDefined()
    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['content-security-policy']).toContain(
      "frame-ancestors 'none'"
    )
  })

  test('X-Powered-By 헤더가 노출되지 않아야 한다', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('API 엔드포인트에도 보안 헤더가 적용되어야 한다', async ({
    request,
  }) => {
    const response = await request.get('/api/system/health')
    const headers = response.headers()

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['content-security-policy']).toBeDefined()
  })
})
