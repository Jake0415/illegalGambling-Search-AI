import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-001 POST /api/auth/login -- 관리자 로그인
// Phase 3에서 NextAuth.js v5 Credentials Provider 연동
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 인증 로직 구현
    // 1. Zod 스키마 검증 (loginSchema)
    // 2. 이메일로 사용자 조회 (Prisma)
    // 3. bcrypt 비밀번호 비교 (cost factor 12)
    // 4. 로그인 실패 카운터 관리 (Redis, 5회 연속 실패 시 15분 잠금)
    // 5. JWT 토큰 발급 (access_token 1시간, refresh_token 7일)
    // 6. 감사 로그 기록

    if (!body.email || !body.password) {
      return apiError('이메일과 비밀번호를 입력해주세요.', 'VALIDATION_ERROR', 400);
    }

    return apiSuccess(
      {
        accessToken: 'dummy_access_token',
        refreshToken: 'dummy_refresh_token',
        expiresIn: 3600,
        tokenType: 'Bearer' as const,
        user: {
          id: 'usr_dummy',
          email: body.email,
          name: '관리자',
          role: 'ADMIN',
        },
      },
      200,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
