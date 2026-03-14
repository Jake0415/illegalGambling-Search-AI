import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-005 GET /api/sites -- 사이트 목록 조회
// Phase 3에서 Prisma findMany + cursor pagination 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 사이트 목록 조회 구현
  // 1. 쿼리 파라미터 파싱 (status, category, search, createdAfter, createdBefore)
  // 2. Prisma findMany + cursor 기반 페이지네이션
  // 3. PostgreSQL 인덱스 활용 (status, category, createdAt)
  // 4. Full-text search (to_tsvector)

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-006 POST /api/sites -- 사이트 등록 (단건)
// Phase 3에서 URL 정규화, 중복 체크, Claude Haiku 분류 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 사이트 등록 구현
    // 1. Zod 스키마 검증 (createSiteSchema)
    // 2. URL 정규화 (normalize-url)
    // 3. 중복 체크 (HTTP 409)
    // 4. Prisma create
    // 5. WHOIS/DNS 수집 작업 BullMQ 등록
    // 6. Claude Haiku 초기 분류 비동기 실행
    // 7. 감사 로그 기록

    if (!body.url) {
      return apiError('URL을 입력해주세요.', 'VALIDATION_ERROR', 400);
    }

    return apiSuccess(
      {
        id: `site_${crypto.randomUUID().slice(0, 8)}`,
        url: body.url,
        domain: new URL(body.url).hostname,
        status: 'ACTIVE',
        category: null,
        confidenceScore: null,
        source: body.source ?? 'manual',
        memo: body.memo ?? null,
        tags: body.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
