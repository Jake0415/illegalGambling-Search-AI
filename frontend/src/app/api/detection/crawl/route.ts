import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-028 POST /api/detection/crawl -- 크롤링 기반 탐지
// Phase 3에서 Crawlee PlaywrightCrawler 파이프라인 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 크롤링 기반 탐지 구현
    // 1. 시드 URL 또는 탐지 결과 기반 크롤링 범위 설정
    // 2. BullMQ 크롤링 작업 큐 등록
    // 3. Crawlee PlaywrightCrawler 실행
    // 4. 발견된 URL 정규화 + 중복 체크
    // 5. Claude Haiku 분류 비동기 실행

    return apiSuccess(
      {
        crawlId: `crawl_${crypto.randomUUID().slice(0, 8)}`,
        seedUrls: body.seedUrls ?? [],
        status: 'queued',
        estimatedCompletionAt: new Date(Date.now() + 600000).toISOString(),
      },
      202,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
