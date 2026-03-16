'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { History } from 'lucide-react'
import { useMemo } from 'react'

import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MockSchedule } from '@/server/mock/data/schedules'
import {
  mockScheduleRunLogs,
  type MockScheduleRunLog,
} from '@/server/mock/data/schedules'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  if (totalMin < 60) return `${totalMin}분`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}시간 ${m}분`
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: ColumnDef<MockScheduleRunLog>[] = [
  {
    accessorKey: 'startedAt',
    header: '실행 시각',
    cell: ({ row }) => {
      const start = formatDateTime(row.original.startedAt)
      const end = formatDateTime(row.original.completedAt)
      return (
        <span className="text-xs">
          {start} ~ {end}
        </span>
      )
    },
  },
  {
    accessorKey: 'totalCount',
    header: '전체 건수',
    cell: ({ row }) => row.original.totalCount,
  },
  {
    accessorKey: 'successCount',
    header: '성공',
    cell: ({ row }) => (
      <span className="text-emerald-600 dark:text-emerald-400">
        {row.original.successCount}
      </span>
    ),
  },
  {
    accessorKey: 'failedCount',
    header: '실패',
    cell: ({ row }) => (
      <span className="text-red-600 dark:text-red-400">
        {row.original.failedCount}
      </span>
    ),
  },
  {
    accessorKey: 'durationMs',
    header: '소요시간',
    cell: ({ row }) => formatDuration(row.original.durationMs),
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScheduleRunHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: MockSchedule | null
}

export function ScheduleRunHistoryDialog({
  open,
  onOpenChange,
  schedule,
}: ScheduleRunHistoryDialogProps) {
  const logs = useMemo(() => {
    if (!schedule) return []
    return mockScheduleRunLogs.filter((l) => l.scheduleId === schedule.id)
  }, [schedule])

  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            실행 이력 - {schedule.name}
          </DialogTitle>
          <DialogDescription>
            최근 실행 이력을 확인합니다. 총 {logs.length}건
          </DialogDescription>
        </DialogHeader>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="size-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              실행 이력이 없습니다.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={logs} enablePagination={false} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
