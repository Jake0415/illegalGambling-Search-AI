'use client'

import { Calendar, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import {
  mockSchedules,
  type MockSchedule,
} from '@/server/mock/data/schedules'

import { ScheduleCard } from './schedule-card'
import { ScheduleFormDialog } from './schedule-form-dialog'
import { ScheduleRunHistoryDialog } from './schedule-run-history-dialog'

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MockSchedule[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedSchedule, setSelectedSchedule] =
    useState<MockSchedule | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySchedule, setHistorySchedule] =
    useState<MockSchedule | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setSchedules([...mockSchedules])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handlers
  function handleCreate() {
    setFormMode('create')
    setSelectedSchedule(null)
    setFormOpen(true)
  }

  function handleEdit(schedule: MockSchedule) {
    setFormMode('edit')
    setSelectedSchedule(schedule)
    setFormOpen(true)
  }

  function handleDelete(schedule: MockSchedule) {
    setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
    toast.success(`"${schedule.name}" 스케줄이 삭제되었습니다.`)
  }

  function handleToggle(schedule: MockSchedule) {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === schedule.id ? { ...s, isActive: !s.isActive } : s
      )
    )
    toast.success(
      `"${schedule.name}" 스케줄이 ${schedule.isActive ? '비활성화' : '활성화'}되었습니다.`
    )
  }

  function handleViewHistory(schedule: MockSchedule) {
    setHistorySchedule(schedule)
    setHistoryOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSave(data: any) {
    if (formMode === 'create') {
      const newSchedule: MockSchedule = {
        id: `sched-${String(Date.now()).slice(-6)}`,
        name: data.name,
        scheduleType: data.scheduleType,
        cronExpression:
          data.scheduleType === 'CRON' ? data.cronExpression : null,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        targetFilter: { type: data.targetType },
        scope: data.scope,
        maxConcurrent: data.maxConcurrent,
        isActive: true,
        lastRunAt: null,
        nextRunAt: null,
        runCount: 0,
      }
      setSchedules((prev) => [...prev, newSchedule])
      toast.success('새 스케줄이 추가되었습니다.')
    } else if (selectedSchedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                name: data.name,
                scheduleType: data.scheduleType,
                cronExpression:
                  data.scheduleType === 'CRON' ? data.cronExpression : null,
                startTime: data.startTime || null,
                endTime: data.endTime || null,
                targetFilter: { type: data.targetType },
                scope: data.scope,
                maxConcurrent: data.maxConcurrent,
              }
            : s
        )
      )
      toast.success('스케줄이 수정되었습니다.')
    }
  }

  return (
    <PageContainer
      title="자동 채증 스케줄"
      description="주기적 자동 채증 관리"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="mr-1.5 size-4" />
          스케줄 추가
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">
            스케줄을 불러오는 중...
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Calendar className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold">
            등록된 스케줄이 없습니다
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            자동 채증 스케줄을 추가하여 주기적으로 채증을 실행하세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <ScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialData={selectedSchedule}
        onSave={handleSave}
      />

      {/* Run History Dialog */}
      <ScheduleRunHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        schedule={historySchedule}
      />
    </PageContainer>
  )
}
