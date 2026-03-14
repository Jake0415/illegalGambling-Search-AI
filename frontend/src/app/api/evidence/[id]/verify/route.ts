import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-022 POST /api/evidence/:id/verify -- 증거 무결성 검증
// Task에서 FR-API-021로 매핑
// Phase 3에서 SHA-256 해시 검증, OpenTimestamps, RFC 3161 구현
export async function POST(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 무결성 검증 구현
  // 1. SHA-256 해시 재계산 + hash_manifest.sha256 대조
  // 2. OpenTimestamps 비트코인 블록체인 검증
  // 3. RFC 3161 타임스탬프 검증
  // 4. 검증 결과 기록 (VERIFIED, PARTIAL, TAMPERED)
  // 5. 감사 로그 기록 + lastVerifiedAt 업데이트

  return apiSuccess({
    evidenceId: id,
    overallStatus: 'VERIFIED' as const,
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'usr_dummy',
    hashVerification: {
      status: 'PASSED' as const,
      totalFiles: 0,
      verifiedFiles: 0,
      failedFiles: 0,
      details: [],
    },
    openTimestamps: null,
    rfc3161: null,
  });
}
