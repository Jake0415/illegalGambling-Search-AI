import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-010 POST /api/sites/bulk -- 벌크 URL 임포트
// Task에서 /api/sites/import로 매핑
// Phase 3에서 BullMQ 대량 처리 + Prisma createMany 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 벌크 임포트 구현
    // 1. Zod 스키마 검증 (bulkImportSchema, 최대 500건)
    // 2. 각 URL 정규화 + 중복 체크
    // 3. BullMQ 대량 처리 작업 등록
    // 4. Prisma createMany + 트랜잭션
    // 5. 처리 결과 건별 반환 (created, duplicate, invalid)

    const urls: string[] = body.urls ?? [];

    if (urls.length === 0) {
      return apiError('최소 1개의 URL을 입력해주세요.', 'VALIDATION_ERROR', 400);
    }

    if (urls.length > 500) {
      return apiError(
        'URL은 최대 500개까지 가능합니다.',
        'BATCH_SIZE_EXCEEDED',
        422,
      );
    }

    return apiSuccess(
      {
        totalProcessed: urls.length,
        created: 0,
        duplicates: 0,
        errors: 0,
        results: [],
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
