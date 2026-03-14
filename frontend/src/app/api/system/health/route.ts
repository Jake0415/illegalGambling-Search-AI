import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-042 GET /api/system/health -- 시스템 헬스 체크
// Task에서 FR-API-046으로 매핑
// 인증 불필요, 로드 밸런서/모니터링용
// Phase 3에서 실제 DB/Redis/Queue/Storage 연결 상태 확인 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 헬스 체크 구현
  // 1. Prisma $queryRaw('SELECT 1') - DB 연결 확인
  // 2. Redis PING - 캐시 연결 확인
  // 3. BullMQ 큐 연결 확인
  // 4. S3 headBucket - 스토리지 연결 확인
  // 5. 개별 서비스 타임아웃 3초
  // 6. 전체 상태 판별 (healthy/degraded/unhealthy)

  return apiSuccess({
    status: 'healthy' as const,
    version: '1.0.0',
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: 'healthy' as const,
        responseTime: 0,
        version: 'PostgreSQL 16.2',
      },
      redis: {
        status: 'healthy' as const,
        responseTime: 0,
        version: '7.2.4',
        memoryUsage: '0MB',
      },
      queue: {
        status: 'healthy' as const,
        activeJobs: 0,
        waitingJobs: 0,
      },
      storage: {
        status: 'healthy' as const,
        responseTime: 0,
        provider: 'MinIO',
        usedSpace: '0GB',
      },
    },
  });
}
