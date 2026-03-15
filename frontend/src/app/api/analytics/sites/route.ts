import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';
import { mockAnalyticsService } from '@/server/mock/services/analytics-service';

// PRD: FR-API-039 GET /api/stats/detection -- 탐지 통계
// Task에서 /api/analytics/sites로 매핑 (FR-API-035)
// Phase 3에서 PostgreSQL DATE_TRUNC 집계 + Redis 캐시 구현
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period = searchParams.get('period') as
    | 'daily'
    | 'weekly'
    | 'monthly'
    | undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const result = await mockAnalyticsService.getSiteStats({
    period: period ?? undefined,
    from,
    to,
  });

  return apiSuccess(result.data);
}
