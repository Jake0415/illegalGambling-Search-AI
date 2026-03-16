'use client'

import { Clock, Edit2, History, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { MockSchedule } from '@/server/mock/data/schedules'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCHEDULE_TYPE_LABELS: Record<MockSchedule['scheduleType'], string> = {
  ONCE: '1회 예약',
  DAILY: '매일',
  WEEKLY: '매주',
  HOURLY: '매 N시간',
  CRON: '크론',
  CONTINUOUS: '항시',
}

const SCHEDULE_TYPE_COLORS: Record<MockSchedule['scheduleType'], string> = {
  DAILY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  WEEKLY:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  HOURLY:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  CRON: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  CONTINUOUS:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ONCE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

function formatTime(schedule: MockSchedule): string {
  if (schedule.scheduleType === 'CONTINUOUS') return '상시 실행'
  if (schedule.scheduleType === 'HOURLY') return '매 N시간'
  if (schedule.scheduleType === 'CRON')
    return schedule.cronExpression ?? '크론 표현식'
  if (!schedule.startTime) return '-'
  if (schedule.endTime) return `${schedule.startTime}~${schedule.endTime}`
  return schedule.startTime
}

function formatTargetFilter(filter: MockSchedule['targetFilter']): string {
  switch (filter.type) {
    case 'all':
      return '활성 사이트 전체'
    case 'risk_score':
      return `위험도 ${filter.minRiskScore}+`
    case 'category':
      return `카테고리: ${filter.category}`
    case 'manual':
      return `${filter.count}개 사이트 선택됨`
    default:
      return '-'
  }
}

function formatScope(scope: number): string {
  if (scope === 1) return '1단계'
  if (scope === 2) return '1~2단계'
  return '전체(1~3단계)'
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScheduleCardProps {
  schedule: MockSchedule
  onEdit: (schedule: MockSchedule) => void
  onDelete: (schedule: MockSchedule) => void
  onToggle: (schedule: MockSchedule) => void
  onViewHistory: (schedule: MockSchedule) => void
}

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onToggle,
  onViewHistory,
}: ScheduleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {schedule.name}
          </CardTitle>
          <Switch
            checked={schedule.isActive}
            onCheckedChange={() => onToggle(schedule)}
            aria-label={schedule.isActive ? '비활성화' : '활성화'}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={SCHEDULE_TYPE_COLORS[schedule.scheduleType]}
          >
            {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-1 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            <span>{formatTime(schedule)}</span>
          </div>
          <div>
            <span className="text-muted-foreground/70">대상:</span>{' '}
            {formatTargetFilter(schedule.targetFilter)}
          </div>
          <div>
            <span className="text-muted-foreground/70">범위:</span>{' '}
            {formatScope(schedule.scope)}
          </div>
          <div>
            <span className="text-muted-foreground/70">동시:</span>{' '}
            {schedule.maxConcurrent}건
          </div>
        </div>

        {/* Run info */}
        <div className="space-y-0.5 border-t pt-2 text-xs text-muted-foreground">
          <div>
            <span className="text-muted-foreground/70">마지막 실행:</span>{' '}
            {schedule.lastRunAt
              ? formatDateTime(schedule.lastRunAt)
              : '실행 이력 없음'}
          </div>
          <div>
            <span className="text-muted-foreground/70">다음 실행:</span>{' '}
            {schedule.nextRunAt
              ? formatDateTime(schedule.nextRunAt)
              : '-'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewHistory(schedule)}
        >
          <History className="mr-1 size-3.5" />
          실행이력
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(schedule)}>
          <Edit2 className="mr-1 size-3.5" />
          편집
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(schedule)}
        >
          <Trash2 className="mr-1 size-3.5" />
          삭제
        </Button>
      </CardFooter>
    </Card>
  )
}
