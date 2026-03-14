import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-002 POST /api/auth/logout -- 로그아웃
// Phase 3에서 토큰 무효화 및 Redis 블랙리스트 구현
export async function POST(_request: NextRequest) {
  // TODO: Phase 3 - 실제 로그아웃 로직 구현
  // 1. 세션 토큰 검증
  // 2. refresh_token을 Redis 블랙리스트에 등록 (TTL = 잔여 유효기간)
  // 3. 서버 측 세션 정리
  // 4. 감사 로그 기록

  return apiSuccess(null, 204);
}
