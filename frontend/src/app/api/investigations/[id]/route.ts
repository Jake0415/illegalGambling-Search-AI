import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-014 GET /api/investigations/:id -- 채증 작업 상세 조회
// Phase 3에서 Prisma findUnique + BullMQ Job.progress 연동
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 채증 상세 조회 구현
  // 1. Prisma findUnique + include (stages, screenshots, metadata)
  // 2. BullMQ Job.progress 실시간 상태 반영
  // 3. 존재하지 않는 ID 시 HTTP 404

  const stageDetail = {
    status: 'pending' as const,
    startedAt: null,
    completedAt: null,
    duration: null,
    filesCollected: 0,
    errors: [],
  };

  return apiSuccess({
    id,
    siteId: 'site_dummy',
    status: 'QUEUED',
    mode: 'immediate',
    scope: 'full',
    currentStage: null,
    progress: 0,
    retryCount: 0,
    stages: {
      stage1: stageDetail,
      stage2: stageDetail,
      stage3: stageDetail,
    },
    proxyInfo: null,
    queuePosition: null,
    estimatedStartAt: null,
    createdBy: 'usr_dummy',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  });
}

// PRD: FR-API-015 POST (cancel) + FR-API-016 POST (retry)
// PATCH를 통한 채증 작업 상태 변경
// Phase 3에서 BullMQ Job.remove() / Job.moveToFailed() 구현
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - 채증 작업 취소/재시도 구현
    // 취소: BullMQ Job.remove() (대기), Job.moveToFailed() (진행)
    // 재시도: BullMQ Queue.add() + 프록시 로테이션

    return apiSuccess({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}

// PRD: FR-API-015 DELETE -- 채증 작업 취소 (대안 메서드)
// Phase 3에서 BullMQ 연동 구현
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 채증 작업 취소 구현
  // 1. 작업 상태 확인 (queued/in_progress만 취소 가능)
  // 2. 이미 완료/취소된 작업 시 HTTP 409
  // 3. BullMQ Job.remove() 또는 Job.moveToFailed()
  // 4. 취소 시점까지 수집된 데이터 보존
  // 5. 감사 로그 기록

  return apiSuccess({ id, status: 'CANCELLED', cancelledAt: new Date().toISOString() });
}
