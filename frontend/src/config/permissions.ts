// ============================================================================
// 권한 매핑 설정
// 역할 × 리소스별 CRUD 권한 매트릭스
// ============================================================================

import type { UserRole } from '@/types/enums'

// ─── Types ───────────────────────────────────────────────────────
export type Permission = 'create' | 'read' | 'update' | 'delete'

export type Resource =
  | 'sites'
  | 'investigations'
  | 'evidence'
  | 'review'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'users'
  | 'keywords'
  | 'audit_log'
  | 'system_settings'

// ─── 권한 매트릭스 ──────────────────────────────────────────────
export const rolePermissions: Record<UserRole, Record<Resource, Permission[]>> = {
  SUPER_ADMIN: {
    sites: ['create', 'read', 'update', 'delete'],
    investigations: ['create', 'read', 'update', 'delete'],
    evidence: ['create', 'read', 'update', 'delete'],
    review: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    keywords: ['create', 'read', 'update', 'delete'],
    audit_log: ['read'],
    system_settings: ['create', 'read', 'update', 'delete'],
  },
  ADMIN: {
    sites: ['create', 'read', 'update', 'delete'],
    investigations: ['create', 'read', 'update', 'delete'],
    evidence: ['create', 'read', 'update', 'delete'],
    review: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    users: ['read', 'update'],
    keywords: ['create', 'read', 'update', 'delete'],
    audit_log: ['read'],
    system_settings: ['read', 'update'],
  },
}
