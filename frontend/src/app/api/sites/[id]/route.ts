import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-007 GET /api/sites/:id -- 사이트 상세 조회
// Phase 3에서 Prisma findUnique + include 관계 로딩 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 사이트 상세 조회 구현
  // 1. Prisma findUnique + include (whois, dns, classification, investigations, cluster)
  // 2. 소프트 삭제 사이트 접근 제어 (admin만)
  // 3. 감사 로그 기록

  return apiSuccess({
    id,
    url: 'https://example.com',
    domain: 'example.com',
    status: 'ACTIVE',
    category: null,
    confidenceScore: null,
    firstDetectedAt: new Date().toISOString(),
    lastCheckedAt: null,
    tags: [],
    whoisData: null,
    dnsRecords: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });
}

// PRD: FR-API-008 PATCH /api/sites/:id -- 사이트 정보 수정
// Phase 3에서 Prisma update + 낙관적 잠금 구현
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 사이트 수정 구현
    // 1. Zod 스키마 검증 (updateSiteSchema)
    // 2. URL 필드 변경 시도 차단 (HTTP 422 FIELD_NOT_MODIFIABLE)
    // 3. Prisma update + 낙관적 잠금 (updatedAt 비교)
    // 4. 변경 전후 값 감사 로그 기록

    return apiSuccess({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}

// PRD: FR-API-009 DELETE /api/sites/:id -- 사이트 삭제 (소프트 삭제)
// Phase 3에서 Prisma soft delete + admin 역할 제한 구현
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 소프트 삭제 구현
    // 1. admin 역할 검증 (HTTP 403)
    // 2. Zod 스키마 검증 (deleteSiteSchema - reason 필수)
    // 3. Prisma update (deletedAt = now())
    // 4. 감사 로그 기록 (삭제 사유 포함)

    if (!body.reason) {
      return apiError('삭제 사유를 입력해주세요.', 'VALIDATION_ERROR', 422);
    }

    return apiSuccess({ id, deletedAt: new Date().toISOString() });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
