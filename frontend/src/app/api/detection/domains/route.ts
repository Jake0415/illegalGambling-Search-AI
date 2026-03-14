import type { NextRequest } from 'next/server';

import { apiPaginated } from '@/server/api/response';

// PRD: FR-API-030 GET /api/detection/domains/:id/status -- 도메인 생존 상태 조회
// Task에서 /api/detection/domains로 매핑
// Phase 3에서 DNS resolve + HTTP HEAD 체크 + Redis 캐시 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 도메인 목록/상태 조회 구현
  // 1. 등록된 도메인 목록 조회
  // 2. 각 도메인의 현재 생존 상태 (alive, dead, redirected)
  // 3. DNS 레코드 (A, CNAME, NS)
  // 4. 상태 변경 이력 (includeHistory=true)
  // 5. checkNow=true 시 즉시 상태 체크 트리거

  return apiPaginated([], 0, 1, 20);
}
