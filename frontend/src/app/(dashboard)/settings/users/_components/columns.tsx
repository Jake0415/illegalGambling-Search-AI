'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader, getSelectionColumn } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { UserListItem } from '@/types/api'
import { cn } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '슈퍼 관리자',
  ADMIN: '관리자',
  OPERATOR: '운영자',
  INVESTIGATOR: '수사관',
  LEGAL: '법무',
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  ADMIN:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  OPERATOR:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  INVESTIGATOR:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  LEGAL:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 30) return `${diffDays}일 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}

export function getUserColumns(): ColumnDef<UserListItem, unknown>[] {
  return [
    getSelectionColumn<UserListItem>(),
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="이름"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.getValue<string | null>('name') ?? '-'}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="이메일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm truncate max-w-[200px] block">
              {row.getValue<string>('email')}
            </span>
          </TooltipTrigger>
          <TooltipContent>{row.getValue<string>('email')}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="역할"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const role = row.getValue<string>('role')
        return (
          <Badge
            variant="outline"
            className={cn(roleColors[role])}
          >
            {roleLabels[role] ?? role}
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="상태"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>('isActive')
        return (
          <Badge
            variant="outline"
            className={cn(
              isActive
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
            )}
          >
            {isActive ? '활성' : '비활성'}
          </Badge>
        )
      },
      size: 90,
    },
    {
      accessorKey: 'lastLoginAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="최근 로그인"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue<string | null>('lastLoginAt')
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm">
                {formatRelativeTime(dateStr)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {dateStr ? new Date(dateStr).toLocaleString('ko-KR') : '-'}
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="등록일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.getValue<string>('createdAt')).toLocaleDateString('ko-KR')}
        </span>
      ),
      size: 110,
    },
  ]
}
