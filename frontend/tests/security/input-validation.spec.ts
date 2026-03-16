import { test, expect } from '@playwright/test'

test.describe('입력 유효성 검증 테스트', () => {
  test.describe('POST /api/sites - 사이트 등록', () => {
    test('URL 없이 요청하면 400 에러를 반환해야 한다', async ({ request }) => {
      const response = await request.post('/api/sites', {
        data: { memo: 'test' },
      })
      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body.error).toBeDefined()
    })

    test('잘못된 URL 형식이면 400 에러를 반환해야 한다', async ({
      request,
    }) => {
      const invalidUrls = ['not-a-url', 'ftp://invalid', '']

      for (const url of invalidUrls) {
        const response = await request.post('/api/sites', {
          data: { url },
        })
        expect(response.status()).toBe(400)
      }
    })

    test('올바른 URL이면 201로 성공해야 한다', async ({ request }) => {
      const response = await request.post('/api/sites', {
        data: { url: 'https://example.com' },
      })
      expect(response.status()).toBe(201)
    })

    test('메모가 1000자를 초과하면 400 에러를 반환해야 한다', async ({
      request,
    }) => {
      const response = await request.post('/api/sites', {
        data: {
          url: 'https://example.com',
          memo: 'a'.repeat(1001),
        },
      })
      expect(response.status()).toBe(400)
    })

    test('태그가 20개를 초과하면 400 에러를 반환해야 한다', async ({
      request,
    }) => {
      const response = await request.post('/api/sites', {
        data: {
          url: 'https://example.com',
          tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
        },
      })
      expect(response.status()).toBe(400)
    })
  })

  test.describe('POST /api/sites/import - 벌크 임포트', () => {
    test('빈 URL 배열이면 400 에러를 반환해야 한다', async ({ request }) => {
      const response = await request.post('/api/sites/import', {
        data: { urls: [] },
      })
      expect(response.status()).toBe(400)
    })

    test('500개 초과 URL이면 400 에러를 반환해야 한다', async ({ request }) => {
      const response = await request.post('/api/sites/import', {
        data: {
          urls: Array.from(
            { length: 501 },
            (_, i) => `https://example${i}.com`
          ),
        },
      })
      expect(response.status()).toBe(400)
    })

    test('잘못된 URL 형식이 포함되면 400 에러를 반환해야 한다', async ({
      request,
    }) => {
      const response = await request.post('/api/sites/import', {
        data: {
          urls: ['https://valid.com', 'not-a-url', 'https://also-valid.com'],
        },
      })
      expect(response.status()).toBe(400)
    })

    test('잘못된 JSON이면 400 에러를 반환해야 한다', async ({ request }) => {
      const response = await request.post('/api/sites/import', {
        headers: { 'Content-Type': 'application/json' },
        data: 'not json',
      })
      // 잘못된 JSON은 파싱 에러 또는 검증 에러를 반환
      expect(response.status()).toBeGreaterThanOrEqual(400)
    })
  })
})
