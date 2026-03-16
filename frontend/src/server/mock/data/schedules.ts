// ============================================================================
// 자동 채증 스케줄 Mock 데이터
// ============================================================================

export interface MockSchedule {
  id: string
  name: string
  scheduleType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'HOURLY' | 'CRON' | 'CONTINUOUS'
  cronExpression: string | null
  startTime: string | null
  endTime: string | null
  targetFilter: { type: string; [key: string]: unknown }
  scope: number
  maxConcurrent: number
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  runCount: number
}

export const mockSchedules: MockSchedule[] = [
  {
    id: 'sched-001',
    name: '매일 새벽 전체 사이트 1단계 채증',
    scheduleType: 'DAILY',
    cronExpression: null,
    startTime: '02:00',
    endTime: '06:00',
    targetFilter: { type: 'all' },
    scope: 1,
    maxConcurrent: 5,
    isActive: true,
    lastRunAt: '2026-03-17T02:00:00',
    nextRunAt: '2026-03-18T02:00:00',
    runCount: 45,
  },
  {
    id: 'sched-002',
    name: '주 1회 고위험 사이트 전체 채증',
    scheduleType: 'WEEKLY',
    cronExpression: null,
    startTime: '03:00',
    endTime: null,
    targetFilter: { type: 'risk_score', minRiskScore: 80 },
    scope: 3,
    maxConcurrent: 3,
    isActive: true,
    lastRunAt: '2026-03-10T03:00:00',
    nextRunAt: '2026-03-24T03:00:00',
    runCount: 12,
  },
  {
    id: 'sched-003',
    name: '상시 모니터링 모드',
    scheduleType: 'CONTINUOUS',
    cronExpression: null,
    startTime: null,
    endTime: null,
    targetFilter: { type: 'all' },
    scope: 1,
    maxConcurrent: 3,
    isActive: false,
    lastRunAt: null,
    nextRunAt: null,
    runCount: 0,
  },
]

export interface MockScheduleRunLog {
  id: string
  scheduleId: string
  startedAt: string
  completedAt: string
  totalCount: number
  successCount: number
  failedCount: number
  durationMs: number
}

export const mockScheduleRunLogs: MockScheduleRunLog[] = [
  // 10 run logs for sched-001
  ...Array.from({ length: 10 }, (_, i) => {
    const durationMinutes = 18 + ((i * 7 + 3) % 15)
    const total = 22 + ((i * 3 + 1) % 6)
    const failed = 1 + (i % 3)
    return {
      id: `run-${String(i + 1).padStart(3, '0')}`,
      scheduleId: 'sched-001',
      startedAt: `2026-03-${String(17 - i).padStart(2, '0')}T02:00:00`,
      completedAt: `2026-03-${String(17 - i).padStart(2, '0')}T02:${String(durationMinutes).padStart(2, '0')}:00`,
      totalCount: total,
      successCount: total - failed,
      failedCount: failed,
      durationMs: durationMinutes * 60 * 1000,
    }
  }),
]
