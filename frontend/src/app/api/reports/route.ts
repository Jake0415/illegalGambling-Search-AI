import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-038 GET /api/reports -- 보고서 목록 조회
// Phase 3에서 Prisma Report 모델 조회 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 보고서 목록 조회 구현
  // 1. 생성일, 유형별 필터
  // 2. 커서 기반 페이지네이션
  // 3. 보고서 상태 (generating, completed, failed) 필터

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-039 POST /api/reports -- 보고서 생성
// Phase 3에서 BullMQ 비동기 생성 + Claude Sonnet 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 보고서 생성 구현
    // 1. 보고서 유형 선택 (daily, weekly, monthly, custom)
    // 2. BullMQ 비동기 생성 작업 등록
    // 3. PDF 생성 (Playwright page.pdf() 또는 @react-pdf/renderer)
    // 4. S3에 저장

    return apiSuccess(
      {
        reportId: `rpt_${crypto.randomUUID().slice(0, 8)}`,
        type: body.type ?? 'custom',
        status: 'generating',
        statusUrl: `/api/reports/rpt_dummy/status`,
        estimatedCompletionAt: new Date(Date.now() + 60000).toISOString(),
      },
      202,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
