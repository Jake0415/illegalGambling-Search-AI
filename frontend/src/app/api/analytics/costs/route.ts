import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';
import { mockCostTrends } from '@/server/mock/data/stats';

// PRD: FR-API-041 GET /api/analytics/costs -- 비용 추이
// Phase 3에서 PostgreSQL 집계 + Redis 캐시 구현
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get('days') ?? '30', 10);

  // 최근 N일의 비용 데이터 반환
  const data = mockCostTrends.slice(-days);

  return apiSuccess(data);
}
