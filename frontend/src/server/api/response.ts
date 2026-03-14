import { NextResponse } from 'next/server';

/**
 * API 성공 응답 헬퍼
 * PRD 07절 공통 응답 래퍼 형식
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        requestId: `req_${crypto.randomUUID().slice(0, 12)}`,
        timestamp: new Date().toISOString(),
      },
    },
    { status },
  );
}

/**
 * API 에러 응답 헬퍼
 * PRD 07절 표준 에러 응답 형식
 */
export function apiError(message: string, code: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        requestId: `req_${crypto.randomUUID().slice(0, 12)}`,
        timestamp: new Date().toISOString(),
      },
    },
    { status },
  );
}

/**
 * API 페이지네이션 응답 헬퍼
 * PRD 07절 커서 기반 페이지네이션 응답 형식
 */
export function apiPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      total,
      limit: pageSize,
      hasNextPage: page * pageSize < total,
      hasPrevPage: page > 1,
      nextCursor: null,
      prevCursor: null,
    },
    meta: {
      requestId: `req_${crypto.randomUUID().slice(0, 12)}`,
      timestamp: new Date().toISOString(),
    },
  });
}
