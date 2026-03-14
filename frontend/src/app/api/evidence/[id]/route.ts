import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-020 GET /api/evidence/:id -- 증거 상세 조회
// Phase 3에서 Prisma EvidencePackage + S3 presigned URL 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 증거 상세 조회 구현
  // 1. Prisma EvidencePackage findUnique + include (files, chainOfCustody)
  // 2. S3 presigned URL 생성 (각 파일 downloadUrl)
  // 3. 증거 조회 이벤트 감사 로그 기록
  // 4. 존재하지 않는 ID 시 HTTP 404

  return apiSuccess({
    id,
    investigationId: 'inv_dummy',
    files: [],
    integrityStatus: 'VERIFIED' as const,
    lastVerifiedAt: null,
    chainOfCustody: [],
  });
}
