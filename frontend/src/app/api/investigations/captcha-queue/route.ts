import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-031 GET /api/manual-queue -- 수동 개입 큐 목록 조회
// Task에서 /api/investigations/captcha-queue로 매핑
// Phase 3에서 BullMQ 수동 개입 큐 + Redis 세션 상태 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 수동 개입 큐 목록 조회 구현
  // 1. BullMQ 수동 개입 큐에서 대기 중 세션 목록 조회
  // 2. 대기 시간 기준 내림차순 정렬
  // 3. 타임아웃(5분) 초과 세션 자동 expired 처리
  // 4. S3 presigned URL로 스크린샷 미리보기

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-032 POST /api/manual-queue/:id/resolve -- 수동 개입 완료 처리
// Task에서 /api/investigations/captcha-queue에 POST 추가
// Phase 3에서 BullMQ Job.moveToCompleted() + 브라우저 세션 재개 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 수동 개입 완료 처리 구현
    // 1. Zod 스키마 검증 (resolveInterventionSchema)
    // 2. 세션 만료 체크 (HTTP 410 GONE)
    // 3. BullMQ Job.moveToCompleted()
    // 4. rebrowser-playwright 세션 재개
    // 5. 감사 로그 기록

    return apiSuccess({
      id: body.id ?? 'queue_dummy',
      status: body.result === 'success' ? 'RESOLVED' : 'FAILED',
      resolvedAt: new Date().toISOString(),
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
