// ============================================================================
// Mock 서비스 공통 헬퍼
// ============================================================================

import type { ApiMeta, ApiResponse, CursorPagination, PaginatedResponse } from '@/types/api';

let requestCounter = 0;

export function createMeta(): ApiMeta {
  requestCounter++;
  return {
    requestId: `mock-${requestCounter}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    cached: false,
  };
}

export function wrapResponse<T>(data: T): ApiResponse<T> {
  return { data, meta: createMeta() };
}

export function paginateArray<T extends { id?: string }>(
  items: T[],
  limit: number = 20,
  cursor?: string
): { paginatedItems: T[]; pagination: CursorPagination } {
  let startIndex = 0;

  if (cursor) {
    const cursorIndex = items.findIndex((item) => item.id === cursor);
    if (cursorIndex >= 0) {
      startIndex = cursorIndex + 1;
    }
  }

  const paginatedItems = items.slice(startIndex, startIndex + limit);
  const hasNextPage = startIndex + limit < items.length;
  const hasPrevPage = startIndex > 0;

  return {
    paginatedItems,
    pagination: {
      total: items.length,
      limit,
      hasNextPage,
      hasPrevPage,
      nextCursor: hasNextPage ? paginatedItems[paginatedItems.length - 1]?.id ?? null : null,
      prevCursor: hasPrevPage ? items[startIndex - 1]?.id ?? null : null,
    },
  };
}

export function wrapPaginated<T extends { id?: string }>(
  items: T[],
  limit: number = 20,
  cursor?: string
): PaginatedResponse<T> {
  const { paginatedItems, pagination } = paginateArray(items, limit, cursor);
  return {
    data: paginatedItems,
    pagination,
    meta: createMeta(),
  };
}

/** Simulate async delay */
export function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
