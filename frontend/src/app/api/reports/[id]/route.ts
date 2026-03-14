import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-040 GET /api/reports/:id -- 보고서 상세/다운로드
// Phase 3에서 Prisma Report 모델 + S3 presigned URL 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 보고서 상세 조회 구현
  // 1. 보고서 존재 확인 (HTTP 404)
  // 2. 생성 상태 확인 (generating, completed, failed)
  // 3. completed 시 S3 presigned URL 반환
  // 4. 다운로드 이벤트 감사 로그 기록

  return apiSuccess({
    id,
    type: 'custom',
    status: 'completed',
    format: 'pdf',
    downloadUrl: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
}
