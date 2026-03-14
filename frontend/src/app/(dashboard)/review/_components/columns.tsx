'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { DataTableColumnHeader, getSelectionColumn } from '@/components/common/data-table'
import { StatusBadge } from '@/components/common/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ClassificationReviewItem } from '@/types/api'

const modelLabels: Record<string, string> = {
  CLAUDE_HAIKU: 'Claude Haiku',
  XGBOOST: 'XGBoost',
  BERT: 'BERT',
  ENSEMBLE: 'Ensemble',
}

const categoryLabels: Record<string, string> = {
  SPORTS_BETTING: '스포츠 도박',
  HORSE_RACING: '경마',
  CASINO: '카지노',
  OTHER_GAMBLING: '기타 도박',
  NON_GAMBLING: '비도박',
}

function ConfidenceBar({ score }: { score: number }) {
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

export function getReviewColumns(): ColumnDef<ClassificationReviewItem, unknown>[] {
  return [
    getSelectionColumn<ClassificationReviewItem>(),
    {
      accessorKey: 'siteUrl',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="사이트 URL"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const url = row.getValue<string>('siteUrl')
        return (
          <div className="flex items-center gap-1 max-w-[280px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/review/${row.original.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {url}
                </Link>
              </TooltipTrigger>
              <TooltipContent>{url}</TooltipContent>
            </Tooltip>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )
      },
    },
    {
      id: 'aiModel',
      accessorFn: (row) => row.aiResult.model,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="AI 모델"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {modelLabels[row.original.aiResult.model] ?? row.original.aiResult.model}
        </span>
      ),
      size: 120,
    },
    {
      id: 'aiCategory',
      accessorFn: (row) => row.aiResult.category,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="분류 결과"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const cat = row.original.aiResult.category
        return (
          <span className="text-sm">
            {cat ? (categoryLabels[cat] ?? cat) : '-'}
          </span>
        )
      },
      size: 120,
    },
    {
      id: 'aiConfidence',
      accessorFn: (row) => row.aiResult.confidence,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="신뢰도"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <ConfidenceBar score={row.original.aiResult.confidence} />
      ),
      size: 140,
    },
    {
      accessorKey: 'reviewStatus',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="검토 상태"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <StatusBadge type="review" value={row.getValue<string>('reviewStatus')} />
      ),
      size: 100,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="생성일"
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
