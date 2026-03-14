import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-027 GET /api/detection/keywords -- 키워드 목록 조회
// Task에서 FR-API-032로 매핑
// Phase 3에서 Prisma Keyword 모델 + PostgreSQL 집계 쿼리 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 키워드 목록 조회 구현
  // 1. 카테고리별 그룹화
  // 2. 활성/비활성 상태 포함
  // 3. 탐지 건수, 정밀도 통계
  // 4. category 필터, search 파라미터

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-028 POST /api/detection/keywords -- 키워드 추가
// Task에서 FR-API-033으로 매핑
// Phase 3에서 Prisma create/createMany + Claude Haiku 유사 키워드 추천 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 키워드 추가 구현
    // 1. Zod 스키마 검증 (createKeywordSchema, 최대 50건)
    // 2. 중복 키워드 체크 (HTTP 409)
    // 3. Prisma create/createMany
    // 4. autoSuggest 옵션 시 Claude Haiku 유사 키워드 추천
    // 5. 감사 로그 기록

    const keywords = body.keywords ?? [];

    if (keywords.length === 0) {
      return apiError(
        '최소 1개의 키워드를 입력해주세요.',
        'VALIDATION_ERROR',
        400,
      );
    }

    return apiSuccess(
      {
        created: [],
        duplicates: [],
        suggestions: body.autoSuggest ? [] : undefined,
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
