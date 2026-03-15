import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';
import { mockDashboardSummary } from '@/server/mock/data/stats';

// PRD: FR-API-037 GET /api/dashboard/summary -- 대시보드 요약 KPI
// Task에서 /api/analytics/overview로 매핑 (FR-API-034)
// Phase 3에서 PostgreSQL 집계 + Redis 캐시(1분 TTL) 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 대시보드 KPI 조회 구현
  // 현재는 mock 데이터 반환

  return apiSuccess(mockDashboardSummary);
}
