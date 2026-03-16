'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, Menu, Settings, User } from 'lucide-react'
import { getCurrentUser, mockLogout } from '@/lib/mock-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'

// ─── Breadcrumb label map ────────────────────────────────────────
const pathLabels: Record<string, string> = {
  '': '대시보드',
  sites: '사이트 관리',
  new: '사이트 등록',
  import: '벌크 임포트',
  investigations: '채증 관리',
  gallery: '결과 갤러리',
  'captcha-queue': 'CAPTCHA 큐',
  evidence: '증거 관리',
  review: 'AI 분류 검토',
  analytics: '통계 대시보드',
  reports: '정기 보고서',
  settings: '시스템 설정',
  users: '사용자 관리',
  keywords: '키워드 관리',
  'audit-log': '감사 로그',
}

function getLabel(segment: string): string {
  return pathLabels[segment] ?? segment
}

// ─── AutoBreadcrumb ──────────────────────────────────────────────
function AutoBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    return { label: getLabel(segment), href }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage>대시보드</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/">대시보드</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// ─── DashboardHeader ─────────────────────────────────────────────
interface DashboardHeaderProps {
  onMobileMenuToggle: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const router = useRouter()
  const currentUser = getCurrentUser()

  // Dummy notification count
  const notificationCount = 3

  function handleLogout() {
    mockLogout()
    router.push('/login')
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="size-5" />
        <span className="sr-only">메뉴 열기</span>
      </Button>

      {/* Breadcrumb */}
      <div className="flex-1 overflow-hidden">
        <AutoBreadcrumb />
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {notificationCount}
            </Badge>
          )}
          <span className="sr-only">알림</span>
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="size-8">
                <AvatarImage src="" alt={currentUser?.name || '사용자'} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || '관'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser?.name || '관리자'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email || 'admin@gambleguard.kr'}
                </p>
                <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                  {currentUser?.role === 'SUPER_ADMIN'
                    ? '슈퍼관리자'
                    : '시스템 관리자'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 size-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/users">
                  <User className="mr-2 size-4" />
                  프로필
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
