import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-041 GET /api/stats/categories -- 카테고리별 사이트 분포
// Task에서 /api/analytics/costs로 매핑 (FR-API-037)
// Phase 3에서 PostgreSQL GROUP BY + Prisma groupBy 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 비용/카테고리 통계 조회 구현
  // 1. 카테고리별 사이트 수, 비율 집계
  // 2. from, to 파라미터로 기간별 추이
  // 3. activeOnly 필터
  // 4. 미분류 사이트 수 별도 표시
  // 5. Redis 캐시 (1시간 TTL)

  return apiSuccess({
    categories: [],
    unclassifiedCount: 0,
  });
}
