import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-013 GET /api/investigations -- 채증 작업 목록 조회
// Phase 3에서 Prisma findMany + cursor pagination + BullMQ 상태 연동
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 채증 목록 조회 구현
  // 1. 쿼리 파라미터 파싱 (status, siteId, createdAfter, createdBefore)
  // 2. Prisma findMany + cursor 기반 페이지네이션
  // 3. BullMQ Job.getState() 연동으로 최신 상태 반영

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-012 POST /api/investigations -- 채증 작업 생성
// Phase 3에서 BullMQ Queue.add() + Prisma 모델 연동
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 채증 작업 생성 구현
    // 1. Zod 스키마 검증 (createInvestigationSchema)
    // 2. 사이트 존재 확인
    // 3. 동일 사이트 진행 중 채증 체크 (HTTP 409)
    // 4. BullMQ 큐에 작업 등록
    // 5. Prisma Investigation 생성
    // 6. 감사 로그 기록

    if (!body.siteId) {
      return apiError('사이트를 선택해주세요.', 'VALIDATION_ERROR', 400);
    }

    return apiSuccess(
      {
        id: `inv_${crypto.randomUUID().slice(0, 8)}`,
        siteId: body.siteId,
        status: 'QUEUED',
        mode: body.mode ?? 'immediate',
        scope: body.scope ?? 'full',
        currentStage: null,
        progress: 0,
        retryCount: 0,
        queuePosition: 1,
        estimatedStartAt: new Date(Date.now() + 120000).toISOString(),
        createdBy: 'usr_dummy',
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
