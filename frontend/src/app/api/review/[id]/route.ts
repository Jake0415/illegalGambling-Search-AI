import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-035 GET + FR-API-035/036 PATCH
// AI 분류 결과 상세 조회 및 승인/반려
// Task에서 FR-API-025~026으로 매핑
// Phase 3에서 Prisma ClassificationResult + 학습 데이터 적재 구현

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - AI 분류 결과 상세 조회 구현
  // 1. Prisma ClassificationResult findUnique
  // 2. 사이트 정보, 스크린샷 URL 포함
  // 3. AI 분류 결과 상세 (model, category, confidence, evidence)

  return apiSuccess({
    id,
    siteId: 'site_dummy',
    siteUrl: 'https://example.com',
    screenshotUrl: null,
    aiResult: {
      model: 'CLAUDE_HAIKU',
      category: null,
      confidence: 0,
      evidence: [],
    },
    reviewStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  });
}

// PRD: FR-API-035 approve + FR-API-036 reject
// Phase 3에서 학습 데이터 적재 + FP/FN 패턴 집계 구현
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - AI 분류 승인/반려 구현
    // 승인 (action: 'approve'):
    //   1. 분류 상태를 approved로 변경
    //   2. 사이트 category를 AI 분류 결과로 확정
    //   3. 학습 데이터 테이블에 기록
    // 반려 (action: 'reject'):
    //   1. correctedCategory, rejectionReason 필수 검증
    //   2. 분류 상태를 rejected로 변경
    //   3. 사이트 category를 수정 값으로 업데이트
    //   4. FP/FN 패턴 기록

    const action = body.action as string;

    if (action === 'reject') {
      if (!body.correctedCategory || !body.rejectionReason) {
        return apiError(
          '수정 카테고리와 반려 사유를 입력해주세요.',
          'VALIDATION_ERROR',
          422,
        );
      }
    }

    return apiSuccess({
      id,
      reviewStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
