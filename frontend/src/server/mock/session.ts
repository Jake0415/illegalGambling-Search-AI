// ============================================================================
// Mock 세션 및 역할 전환
// ============================================================================

import type { CurrentUserData } from '@/types/api';
import type { UserRole } from '@/types/enums';
import { mockUsers } from './data/users';

/** 개발 모드에서 역할 전환 UI 활성화 여부 */
export const MOCK_ROLE_SWITCHER_ENABLED =
  process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// 역할별 Mock 사용자 매핑
// ---------------------------------------------------------------------------
const roleUserMap: Record<string, typeof mockUsers[number]> = {
  SUPER_ADMIN: mockUsers[0], // 김철수
  ADMIN: mockUsers[1],       // 이영희
};

function toCurrentUser(user: typeof mockUsers[number]): CurrentUserData {
  const permissionMap: Record<string, string[]> = {
    SUPER_ADMIN: [
      'sites:read', 'sites:write', 'sites:delete',
      'investigations:read', 'investigations:write', 'investigations:delete',
      'evidence:read', 'evidence:download', 'evidence:verify',
      'users:read', 'users:write', 'users:delete',
      'settings:read', 'settings:write',
      'audit:read',
      'analytics:read',
      'classifications:read', 'classifications:review',
    ],
    ADMIN: [
      'sites:read', 'sites:write', 'sites:delete',
      'investigations:read', 'investigations:write', 'investigations:delete',
      'evidence:read', 'evidence:download', 'evidence:verify',
      'users:read', 'users:write',
      'settings:read', 'settings:write',
      'audit:read',
      'analytics:read',
      'classifications:read', 'classifications:review',
    ],
  };

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: permissionMap[user.role] ?? [],
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 역할별 Mock 현재 사용자
// ---------------------------------------------------------------------------
export const mockCurrentUsers = {
  SUPER_ADMIN: toCurrentUser(roleUserMap.SUPER_ADMIN),
  ADMIN: toCurrentUser(roleUserMap.ADMIN),
} as const;

/** 기본 Mock 사용자 (SUPER_ADMIN) */
export const mockCurrentUser = mockCurrentUsers.SUPER_ADMIN;

/**
 * 지정한 역할의 Mock 세션을 반환합니다.
 * role을 생략하면 SUPER_ADMIN 세션을 반환합니다.
 */
export function getMockSession(role?: UserRole): {
  user: CurrentUserData;
  accessToken: string;
  expires: string;
} {
  const userRole = role ?? 'SUPER_ADMIN';
  const user = mockCurrentUsers[userRole as keyof typeof mockCurrentUsers]
    ?? mockCurrentUsers.SUPER_ADMIN;

  return {
    user,
    accessToken: `mock-token-${user.role.toLowerCase()}-${Date.now()}`,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
