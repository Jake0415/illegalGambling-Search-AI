import { type NextRequest, NextResponse } from 'next/server';

import type { UserRole } from '@/types/enums';

import { apiError } from './response';

// ============================================================================
// API 미들웨어 체인 유틸리티
// PRD: FR-API-004 RBAC 역할 기반 접근 제어 미들웨어
// Phase 3에서 실제 인증/인가 로직 구현
// ============================================================================

type RouteHandler = (
  request: NextRequest,
  context?: unknown,
) => Promise<NextResponse>;

/**
 * 인증 미들웨어 래퍼 (Phase 3에서 실제 구현)
 * 현재는 인증 없이 통과
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    // TODO: Phase 3 - NextAuth.js v5 세션 검증
    // const session = await auth();
    // if (!session) {
    //   return apiError('인증이 필요합니다.', 'UNAUTHORIZED', 401);
    // }
    return handler(request, context);
  };
}

/**
 * 역할 기반 접근 제어 미들웨어 래퍼 (Phase 3에서 실제 구현)
 * 현재는 역할 검증 없이 통과
 */
export function withRole(..._roles: UserRole[]): (handler: RouteHandler) => RouteHandler {
  return (handler: RouteHandler) => {
    return async (request: NextRequest, context?: unknown) => {
      // TODO: Phase 3 - RBAC 역할 검증
      // const session = await auth();
      // if (!roles.includes(session.user.role)) {
      //   return apiError('접근 권한이 없습니다.', 'FORBIDDEN', 403);
      // }
      return handler(request, context);
    };
  };
}

/**
 * Zod 유효성 검증 미들웨어 래퍼 (Phase 3에서 실제 구현)
 * 현재는 검증 없이 통과
 */
export function withValidation<T>(
  _schema: { parse: (data: unknown) => T },
) {
  return (handler: RouteHandler) => {
    return async (request: NextRequest, context?: unknown) => {
      // TODO: Phase 3 - Zod 스키마 검증
      // try {
      //   const body = await request.json();
      //   schema.parse(body);
      // } catch (error) {
      //   return apiError('요청 데이터의 유효성 검증에 실패했습니다.', 'VALIDATION_ERROR', 400);
      // }
      return handler(request, context);
    };
  };
}

// _roles와 _schema에 언더스코어를 사용하여 미사용 경고를 방지합니다.
// apiError는 Phase 3에서 미들웨어 내부에서 사용될 예정입니다.
void apiError;
