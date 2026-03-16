import { test, expect } from '@playwright/test'

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '"><img src=x onerror=alert(1)>',
  "javascript:alert('xss')",
  '<svg onload=alert(1)>',
  '{{constructor.constructor("return this")()}}',
  '<iframe src="javascript:alert(1)">',
  "'-alert(1)-'",
  '<body onload=alert(1)>',
]

test.describe('XSS 인젝션 방어 테스트', () => {
  test('사이트 등록 API에서 XSS 페이로드가 실행되지 않아야 한다', async ({
    request,
  }) => {
    for (const payload of XSS_PAYLOADS) {
      const response = await request.post('/api/sites', {
        data: {
          url: `https://example.com`,
          memo: payload,
        },
      })

      const body = await response.json()

      // 응답에 스크립트 태그가 이스케이프되지 않은 채로 반환되지 않아야 함
      const responseText = JSON.stringify(body)
      expect(responseText).not.toContain('<script>')
      expect(responseText).not.toContain('onerror=')
      expect(responseText).not.toContain('onload=')
    }
  })

  test('URL 파라미터에 XSS 페이로드를 주입할 수 없어야 한다', async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // URL에 XSS 페이로드를 포함하여 페이지 접근 시도
    await page.goto(
      '/sites?search=' + encodeURIComponent('<script>alert(1)</script>')
    )

    // 페이지에 스크립트 태그가 직접 렌더링되지 않아야 함
    const content = await page.content()
    expect(content).not.toContain('<script>alert(1)</script>')
  })

  test('사이트 등록 시 악성 URL이 거부되어야 한다', async ({ request }) => {
    const maliciousUrls = [
      "javascript:alert('xss')",
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ]

    for (const url of maliciousUrls) {
      const response = await request.post('/api/sites', {
        data: { url },
      })

      // javascript: 프로토콜 URL은 Zod url() 검증에서 거부되어야 함
      expect(response.status()).toBe(400)
    }
  })
})
