import type { NextRequest } from 'next/server';

import { apiPaginated } from '@/server/api/response';
import { fetchBackend } from '@/server/api/backend-client';

// PRD: FR-API-019 (mapped) GET /api/evidence -- 증거 목록 조회
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams.toString();
    const result = await fetchBackend<{
      data: unknown[];
      pagination: { total: number };
    }>(`/evidence?${params}`);

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
