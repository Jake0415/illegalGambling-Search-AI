import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

// PRD: FR-API-003 GET /api/auth/me -- 현재 사용자 정보 조회
// Phase 3에서 NextAuth.js v5 auth() 헬퍼 연동
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 사용자 정보 조회 구현
  // 1. NextAuth.js auth() 헬퍼로 현재 세션 확인
  // 2. Prisma User 모델에서 상세 정보 조회
  // 3. 비활성화 계정 체크 (HTTP 403)

  return apiSuccess({
    id: 'usr_dummy',
    email: 'admin@example.com',
    name: '관리자',
    role: 'ADMIN',
    permissions: [
      'sites:read',
      'sites:write',
      'sites:delete',
      'investigations:read',
      'investigations:execute',
      'evidence:read',
      'evidence:download',
      'settings:read',
      'settings:write',
      'users:read',
      'users:write',
      'audit:read',
    ],
    lastLoginAt: new Date().toISOString(),
    createdAt: '2026-01-01T00:00:00.000Z',
  });
}
