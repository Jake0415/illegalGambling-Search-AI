import type { NextRequest } from 'next/server';

import { apiPaginated } from '@/server/api/response';

// PRD: FR-API-034 GET /api/classification/review-queue -- AI 분류 검토 큐 조회
// Task에서 /api/review로 매핑 (FR-API-024)
// Phase 3에서 Prisma ClassificationResult 모델 조회 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 AI 분류 검토 큐 조회 구현
  // 1. 신뢰도 점수 < 임계값(0.7) 항목 필터
  // 2. 신뢰도 오름차순 정렬 (낮은 것 우선)
  // 3. reviewStatus 필터 (pending/approved/rejected)
  // 4. 커서 기반 페이지네이션
  // 5. pendingCount 메타 데이터 포함

  return apiPaginated([], 0, 1, 20);
}
