import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-039 GET /api/stats/detection -- 탐지 통계
// Task에서 /api/analytics/sites로 매핑 (FR-API-035)
// Phase 3에서 PostgreSQL DATE_TRUNC 집계 + Redis 캐시 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 탐지 통계 조회 구현
  // 1. period (daily/weekly/monthly), from, to 파라미터 파싱
  // 2. PostgreSQL DATE_TRUNC 집계
  // 3. Prisma groupBy
  // 4. Redis 캐시 (일 단위 24시간 TTL)
  // 5. 최대 조회 범위 1년 (초과 시 HTTP 422)

  return apiSuccess({
    period: 'daily',
    data: [],
  });
}
