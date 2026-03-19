import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';
import { fetchBackend } from '@/server/api/backend-client';

// POST /api/auth/login -- FastAPI 백엔드 인증 프록시
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return apiError('이메일과 비밀번호를 입력해주세요.', 'VALIDATION_ERROR', 400);
    }

    const result = await fetchBackend<{
      data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    return apiSuccess(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '로그인에 실패했습니다.';
    // 백엔드 에러 메시지 전달
    if (message.includes('401') || message.includes('403')) {
      return apiError(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        'AUTH_FAILED',
        401,
      );
    }
    return apiError(message, 'AUTH_FAILED', 401);
  }
}
