'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { DataTableColumnHeader, getSelectionColumn } from '@/components/common/data-table'
import { StatusBadge } from '@/components/common/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SiteListItem } from '@/types/api'
import type { SiteCategory } from '@/types/enums'

const categoryLabels: Record<string, string> = {
  SPORTS_BETTING: '스포츠 도박',
  HORSE_RACING: '경마',
  CASINO: '카지노',
  OTHER_GAMBLING: '기타 도박',
  NON_GAMBLING: '비도박',
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

function ConfidenceBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-muted-foreground">-</span>
  const pct = Math.round(score * 100)
  const color =
    score >= 0.8
      ? 'bg-emerald-500'
      : score >= 0.5
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums">{pct}%</span>
    </div>
  )
}

export function getSiteColumns(): ColumnDef<SiteListItem, unknown>[] {
  return [
    getSelectionColumn<SiteListItem>(),
    {
      accessorKey: 'url',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="URL"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const url = row.getValue<string>('url')
        return (
          <div className="flex items-center gap-1 max-w-[280px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/sites/${row.original.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {url}
                </Link>
              </TooltipTrigger>
              <TooltipContent>{url}</TooltipContent>
            </Tooltip>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )
      },
    },
    {
      accessorKey: 'domain',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="도메인"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue<string>('domain')}</span>
      ),
      size: 160,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="상태"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <StatusBadge type="site" value={row.getValue<string>('status')} />
      ),
      size: 100,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="카테고리"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const cat = row.getValue<SiteCategory | null>('category')
        return (
          <span className="text-sm">
            {cat ? (categoryLabels[cat] ?? cat) : '-'}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'confidenceScore',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="AI 신뢰도"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <ConfidenceBar score={row.getValue<number | null>('confidenceScore')} />
      ),
      size: 140,
    },
    {
      accessorKey: 'lastCheckedAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="최근 채증일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue<string | null>('lastCheckedAt')
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
      accessorKey: 'investigationCount',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="채증 수"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.getValue<number>('investigationCount')}
        </span>
      ),
      size: 80,
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
      size: 120,
    },
  ]
}
