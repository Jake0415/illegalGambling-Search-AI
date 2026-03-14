// ============================================================================
// 네비게이션 설정
// 사이드바 메뉴 항목 및 역할별 접근 권한 정의
// ============================================================================

import {
  LayoutDashboard,
  Globe,
  List,
  PlusCircle,
  Upload,
  Search,
  ListTodo,
  Image,
  ShieldAlert,
  FolderArchive,
  Bot,
  BarChart3,
  FileText,
  Settings,
  Users,
  Tags,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/enums'

// ─── Types ───────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  requiredRoles: UserRole[]
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  href?: string
  requiredRoles: UserRole[]
  children?: NavItem[]
}

// ─── Menu configuration ──────────────────────────────────────────
export const navigationItems: NavGroup[] = [
  {
    label: '대시보드',
    icon: LayoutDashboard,
    href: '/',
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
  },
  {
    label: '사이트 관리',
    icon: Globe,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
    children: [
      {
        label: '사이트 목록',
        href: '/sites',
        icon: List,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
      },
      {
        label: '사이트 등록',
        href: '/sites/new',
        icon: PlusCircle,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      },
      {
        label: '벌크 임포트',
        href: '/sites/import',
        icon: Upload,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  },
  {
    label: '채증 관리',
    icon: Search,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR'],
    children: [
      {
        label: '작업 큐',
        href: '/investigations',
        icon: ListTodo,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR'],
      },
      {
        label: '결과 갤러리',
        href: '/investigations/gallery',
        icon: Image,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR'],
      },
      {
        label: 'CAPTCHA 큐',
        href: '/investigations/captcha-queue',
        icon: ShieldAlert,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      },
    ],
  },
  {
    label: '증거 관리',
    icon: FolderArchive,
    href: '/evidence',
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
  },
  {
    label: 'AI 분류 검토',
    icon: Bot,
    href: '/review',
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
  },
  {
    label: '통계/리포트',
    icon: BarChart3,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
    children: [
      {
        label: '통계 대시보드',
        href: '/analytics',
        icon: BarChart3,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
      },
      {
        label: '정기 보고서',
        href: '/reports',
        icon: FileText,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'INVESTIGATOR', 'LEGAL'],
      },
    ],
  },
  {
    label: '시스템 설정',
    icon: Settings,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      {
        label: '일반 설정',
        href: '/settings',
        icon: Settings,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: '사용자 관리',
        href: '/settings/users',
        icon: Users,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: '키워드 관리',
        href: '/settings/keywords',
        icon: Tags,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      },
      {
        label: '감사 로그',
        href: '/settings/audit-log',
        icon: ScrollText,
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  },
]
