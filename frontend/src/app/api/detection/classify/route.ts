import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-029 POST /api/detection/classify -- AI 분류 실행
// Phase 3에서 Claude Haiku 4.5 분류 파이프라인 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 AI 분류 실행 구현
    // 1. 대상 사이트 URL 또는 사이트 ID 검증
    // 2. Claude Haiku 4.5 API 호출 (스크린샷 + HTML 분석)
    // 3. XGBoost/BERT 앙상블 모델 결과 병합
    // 4. 신뢰도 < 임계값 시 검토 큐에 등록
    // 5. 분류 결과 저장

    return apiSuccess(
      {
        classificationId: `cls_${crypto.randomUUID().slice(0, 8)}`,
        siteId: body.siteId ?? 'site_dummy',
        status: 'processing',
        estimatedCompletionAt: new Date(Date.now() + 30000).toISOString(),
      },
      202,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
