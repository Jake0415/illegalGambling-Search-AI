import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-045 GET /api/users/:id -- 사용자 상세 조회
// Phase 3에서 Prisma findUnique 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 사용자 상세 조회 구현
  // 1. admin 역할 검증 (HTTP 403)
  // 2. Prisma findUnique
  // 3. 존재하지 않는 ID 시 HTTP 404

  return apiSuccess({
    id,
    email: 'user@example.com',
    name: '사용자',
    role: 'ADMIN',
    isActive: true,
    lastLoginAt: null,
    department: null,
    phone: null,
    createdAt: new Date().toISOString(),
  });
}

// PRD: FR-API-045 PATCH /api/users/:id -- 사용자 정보 수정
// Phase 3에서 Prisma update + 역할 변경 시 토큰 무효화 구현
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 사용자 수정 구현
    // 1. admin 역할 검증 (HTTP 403)
    // 2. Zod 스키마 검증 (updateUserSchema)
    // 3. Prisma update
    // 4. 역할 변경 시 기존 토큰 무효화 (재로그인 필요)
    // 5. 감사 로그 기록

    return apiSuccess({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}

// PRD: FR-API-045 DELETE /api/users/:id -- 사용자 비활성화
// Phase 3에서 Prisma update (isActive: false) 구현
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 사용자 비활성화 구현
  // 1. admin 역할 검증 (HTTP 403)
  // 2. 자기 자신 비활성화 방지
  // 3. Prisma update (isActive: false)
  // 4. 기존 세션/토큰 무효화
  // 5. 감사 로그 기록

  return apiSuccess({
    id,
    isActive: false,
    deactivatedAt: new Date().toISOString(),
  });
}
