import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';
import { mockAnalyticsService } from '@/server/mock/services/analytics-service';

// PRD: FR-API-040 GET /api/stats/investigation -- 채증 통계
// Task에서 /api/analytics/investigations로 매핑 (FR-API-036)
// Phase 3에서 PostgreSQL 집계 + Prisma aggregate/groupBy 구현
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period = searchParams.get('period') as
    | 'daily'
    | 'weekly'
    | 'monthly'
    | undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const result = await mockAnalyticsService.getInvestigationStats({
    period: period ?? undefined,
    from,
    to,
  });

  return apiSuccess(result.data);
}
