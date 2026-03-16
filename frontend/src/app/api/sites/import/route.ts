import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';
import { bulkImportSchema } from '@/types/forms';

// PRD: FR-API-010 POST /api/sites/bulk -- 벌크 URL 임포트
// Task에서 /api/sites/import로 매핑
// Phase 3에서 BullMQ 대량 처리 + Prisma createMany 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = bulkImportSchema.safeParse(body);
    if (!validation.success) {
      const messages = validation.error.issues.map((i) => i.message).join(', ');
      return apiError(messages, 'VALIDATION_ERROR', 400);
    }

    const data = validation.data;

    // TODO: Phase 3 - 실제 벌크 임포트 구현
    // 1. 각 URL 정규화 + 중복 체크
    // 2. BullMQ 대량 처리 작업 등록
    // 3. Prisma createMany + 트랜잭션
    // 4. 처리 결과 건별 반환 (created, duplicate, invalid)

    return apiSuccess(
      {
        totalProcessed: data.urls.length,
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
