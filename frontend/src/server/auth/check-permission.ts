// ============================================================================
// 권한 확인 유틸리티
// 역할 기반 권한 검사 및 네비게이션 필터링
// ============================================================================

import type { UserRole } from '@/types/enums'
import type { Permission, Resource } from '@/config/permissions'
import { rolePermissions } from '@/config/permissions'
import type { NavGroup, NavItem } from '@/config/navigation'

/**
 * 특정 역할이 리소스에 대해 해당 권한을 가지고 있는지 확인
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Permission
): boolean {
  const permissions = rolePermissions[role]
  if (!permissions) return false

  const resourcePermissions = permissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

/**
 * 특정 역할이 라우트에 접근할 수 있는지 확인
 * 라우트-리소스 매핑 기반
 */
export function canAccessRoute(role: UserRole, href: string): boolean {
  const resourceMap: Record<string, Resource> = {
    '/sites': 'sites',
    '/investigations': 'investigations',
    '/evidence': 'evidence',
    '/review': 'review',
    '/analytics': 'analytics',
    '/reports': 'reports',
    '/settings': 'settings',
    '/settings/users': 'users',
    '/settings/keywords': 'keywords',
    '/settings/audit-log': 'audit_log',
  }

  // 대시보드는 모든 역할 접근 가능
  if (href === '/') return true

  // 정확한 경로 매치 먼저 시도
  const exactResource = resourceMap[href]
  if (exactResource) {
    return hasPermission(role, exactResource, 'read')
  }

  // prefix 매치 시도 (긴 경로부터 매칭)
  const sortedPaths = Object.keys(resourceMap).sort(
    (a, b) => b.length - a.length
  )
  for (const path of sortedPaths) {
    if (href.startsWith(path + '/') || href === path) {
      return hasPermission(role, resourceMap[path], 'read')
    }
  }

  return false
}

/**
 * 역할에 따라 접근 가능한 네비게이션 항목만 필터링
 */
export function filterNavItems(role: UserRole, items: NavGroup[]): NavGroup[] {
  return items
    .filter((group) => group.requiredRoles.includes(role))
    .map((group) => {
      if (!group.children) return group

      const filteredChildren = group.children.filter((child: NavItem) =>
        child.requiredRoles.includes(role)
      )

      // 자식이 모두 필터링된 경우 그룹 자체를 제외
      if (filteredChildren.length === 0) return null

      return { ...group, children: filteredChildren }
    })
    .filter((group): group is NavGroup => group !== null)
}
