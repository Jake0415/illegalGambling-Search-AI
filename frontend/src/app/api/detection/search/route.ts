import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-025 POST /api/detection/scan -- 수동 탐지 실행
// Task에서 /api/detection/search로 매핑 (FR-API-027)
// Phase 3에서 Google Custom Search API + Crawlee + Claude Haiku 파이프라인 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 수동 탐지 실행 구현
    // 1. 키워드 세트 ID 또는 직접 키워드 입력 검증
    // 2. 동시 스캔 제한 체크 (최대 3건, HTTP 429)
    // 3. BullMQ 스캔 작업 큐 등록
    // 4. Google Custom Search API 호출
    // 5. Crawlee PlaywrightCrawler 탐색
    // 6. Claude Haiku 4.5 AI 분류

    return apiSuccess(
      {
        scanId: `scan_${crypto.randomUUID().slice(0, 8)}`,
        keywords: body.keywords ?? [],
        statusUrl: `/api/detection/search/scan_dummy/status`,
        estimatedCompletionAt: new Date(Date.now() + 300000).toISOString(),
      },
      202,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
