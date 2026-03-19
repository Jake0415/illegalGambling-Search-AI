import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';
import { fetchBackend } from '@/server/api/backend-client';
import { mockDashboardSummary } from '@/server/mock/data/stats';

// PRD: FR-API-037 GET /api/dashboard/summary -- 대시보드 요약 KPI
export async function GET(_request: NextRequest) {
  try {
    const result = await fetchBackend<{ data: unknown }>('/analytics/overview');
    return apiSuccess(result.data);
  } catch {
    // 백엔드 연결 실패 시 mock 데이터 폴백
    return apiSuccess(mockDashboardSummary);
  }
}
