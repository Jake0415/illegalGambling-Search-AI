import type { NextRequest } from 'next/server';

import { apiError, apiPaginated, apiSuccess } from '@/server/api/response';

// PRD: FR-API-043 GET /api/users -- 사용자 목록 조회
// Task에서 /api/settings/users로 매핑 (FR-API-043)
// Phase 3에서 Prisma User 모델 조회 + admin 역할 제한 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 사용자 목록 조회 구현
  // 1. admin 역할 검증 (HTTP 403)
  // 2. Prisma findMany + 페이지네이션
  // 3. 역할, 활성 상태별 필터

  return apiPaginated([], 0, 1, 20);
}

// PRD: FR-API-044 POST /api/users -- 사용자 생성
// Task에서 /api/settings/users로 매핑 (FR-API-044)
// Phase 3에서 Prisma create + bcrypt 비밀번호 해싱 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 사용자 생성 구현
    // 1. admin 역할 검증 (HTTP 403)
    // 2. Zod 스키마 검증 (createUserSchema)
    // 3. 이메일 중복 체크 (HTTP 409)
    // 4. bcrypt 비밀번호 해싱
    // 5. Prisma create
    // 6. 감사 로그 기록

    if (!body.email || !body.password || !body.name || !body.role) {
      return apiError(
        '필수 항목을 모두 입력해주세요.',
        'VALIDATION_ERROR',
        400,
      );
    }

    return apiSuccess(
      {
        id: `usr_${crypto.randomUUID().slice(0, 8)}`,
        email: body.email,
        name: body.name,
        role: body.role,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      },
      201,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
