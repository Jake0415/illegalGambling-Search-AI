import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-037 GET /api/dashboard/summary -- 대시보드 요약 KPI
// Task에서 /api/analytics/overview로 매핑 (FR-API-034)
// Phase 3에서 PostgreSQL 집계 + Redis 캐시(1분 TTL) 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 대시보드 KPI 조회 구현
  // 1. PostgreSQL 집계 쿼리 (총 사이트, 채증 통계)
  // 2. Redis 캐시 (1분 TTL)
  // 3. BullMQ 큐 카운트
  // 4. 수동 개입 대기 건수 (캐시 없이 직접 조회)

  return apiSuccess({
    totalSites: 0,
    newSites: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    investigations: {
      in_progress: 0,
      completed: 0,
      failed: 0,
      queued: 0,
    },
    successRates: {
      stage1: 0,
      stage3: 0,
    },
    manualQueue: {
      pending: 0,
      avgWaitTime: 0,
    },
    system: {
      uptime: 0,
      lastIncident: null,
    },
    externalServices: {
      smsProvider: { status: 'healthy', balance: 0 },
      captchaSolver: { status: 'healthy', balance: 0 },
      proxy: { status: 'healthy', activeIPs: 0 },
    },
  });
}
