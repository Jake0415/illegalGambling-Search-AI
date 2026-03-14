'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader, getSelectionColumn } from '@/components/common/data-table'
import { StatusBadge } from '@/components/common/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { InvestigationListItem } from '@/types/api'

const modeLabels: Record<string, string> = {
  immediate: '즉시',
  scheduled: '예약',
}

function ProgressBar({ progress }: { progress: number }) {
  const color =
    progress >= 100
      ? 'bg-emerald-500'
      : progress >= 50
        ? 'bg-blue-500'
        : progress > 0
          ? 'bg-yellow-500'
          : 'bg-gray-400'

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs tabular-nums">{progress}%</span>
    </div>
  )
}

export function getInvestigationColumns(): ColumnDef<InvestigationListItem, unknown>[] {
  return [
    getSelectionColumn<InvestigationListItem>(),
    {
      accessorKey: 'siteId',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="사이트 ID"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue<string>('siteId')}</span>
      ),
      size: 140,
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
        <StatusBadge type="investigation" value={row.getValue<string>('status')} />
      ),
      size: 120,
    },
    {
      accessorKey: 'mode',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="모드"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {modeLabels[row.getValue<string>('mode')] ?? row.getValue<string>('mode')}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: 'currentStage',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="현재 단계"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const stage = row.getValue<number | null>('currentStage')
        return (
          <span className="text-sm tabular-nums">
            {stage != null ? `${stage}단계` : '-'}
          </span>
        )
      },
      size: 90,
    },
    {
      accessorKey: 'progress',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="진행률"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <ProgressBar progress={row.getValue<number>('progress')} />
      ),
      size: 140,
    },
    {
      accessorKey: 'startedAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="시작일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue<string | null>('startedAt')
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm">
                {dateStr ? new Date(dateStr).toLocaleDateString('ko-KR') : '-'}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {dateStr ? new Date(dateStr).toLocaleString('ko-KR') : '-'}
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 110,
    },
    {
      accessorKey: 'completedAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="완료일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue<string | null>('completedAt')
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm">
                {dateStr ? new Date(dateStr).toLocaleDateString('ko-KR') : '-'}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {dateStr ? new Date(dateStr).toLocaleString('ko-KR') : '-'}
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 110,
    },
  ]
}
