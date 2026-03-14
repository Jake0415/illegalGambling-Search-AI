import type { NextRequest } from 'next/server';

import { apiPaginated } from '@/server/api/response';

// PRD: FR-API-019 (mapped) GET /api/evidence -- 증거 목록 조회
// Phase 3에서 Prisma EvidencePackage 모델 조회 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 증거 목록 조회 구현
  // 1. 쿼리 파라미터 파싱 (investigationId, integrityStatus)
  // 2. Prisma findMany + cursor 기반 페이지네이션
  // 3. 무결성 상태별 필터

  return apiPaginated([], 0, 1, 20);
}
