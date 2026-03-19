import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';
import { fetchBackend } from '@/server/api/backend-client';
import { createSiteSchema } from '@/types/forms';

// PRD: FR-API-005 GET /api/sites -- 사이트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams.toString();
    const result = await fetchBackend<{
      data: unknown[];
      pagination: { total: number };
    }>(`/sites?${params}`);

    return apiPaginated(
      result.data,
      result.pagination?.total ?? 0,
      1,
      20,
    );
  } catch {
    return apiPaginated([], 0, 1, 20);
  }
}

// PRD: FR-API-006 POST /api/sites -- 사이트 등록 (단건)
// Phase 3에서 URL 정규화, 중복 체크, Claude Haiku 분류 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createSiteSchema.safeParse(body);
    if (!validation.success) {
      const messages = validation.error.issues.map((i) => i.message).join(', ');
      return apiError(messages, 'VALIDATION_ERROR', 400);
    }

    const data = validation.data;

    // TODO: Phase 3 - 실제 사이트 등록 구현
    // 1. URL 정규화 (normalize-url)
    // 2. 중복 체크 (HTTP 409)
    // 3. Prisma create
    // 4. WHOIS/DNS 수집 작업 BullMQ 등록
    // 5. Claude Haiku 초기 분류 비동기 실행
    // 6. 감사 로그 기록

    return apiSuccess(
      {
        id: `site_${crypto.randomUUID().slice(0, 8)}`,
        url: data.url,
        domain: new URL(data.url).hostname,
        status: 'ACTIVE',
        category: null,
        confidenceScore: null,
        source: data.source ?? 'manual',
        memo: data.memo ?? null,
        tags: data.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
