import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-040 GET /api/stats/investigation -- 채증 통계
// Task에서 /api/analytics/investigations로 매핑 (FR-API-036)
// Phase 3에서 PostgreSQL 집계 + Prisma aggregate/groupBy 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 채증 통계 조회 구현
  // 1. period, from, to, siteId 파라미터 파싱
  // 2. PostgreSQL 집계 쿼리
  // 3. 단계별 성공률, 평균 소요 시간
  // 4. 실패 원인별 분포
  // 5. 시계열 데이터 형식 반환

  return apiSuccess({
    period: 'daily',
    data: [],
  });
}
