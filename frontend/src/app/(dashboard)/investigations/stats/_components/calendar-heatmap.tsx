'use client'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { mockDailyCounts } from '@/server/mock/data/investigation-stats'

interface CalendarHeatmapProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

function getColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 10) return 'bg-emerald-200 dark:bg-emerald-900'
  if (count <= 20) return 'bg-emerald-400 dark:bg-emerald-700'
  return 'bg-emerald-600 dark:bg-emerald-500'
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarHeatmap({
  selectedDate,
  onSelectDate,
}: CalendarHeatmapProps) {
  // 2026년 3월 1일 = 일요일 (0)
  const firstDayOfWeek = new Date(2026, 2, 1).getDay()
  const daysInMonth = 31

  // 주 단위로 그리드 생성
  const weeks: (typeof mockDailyCounts[number] | null)[][] = []
  let currentWeek: (typeof mockDailyCounts[number] | null)[] = []

  // 첫째 주 앞쪽 빈칸
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null)
  }

  for (let day = 0; day < daysInMonth; day++) {
    currentWeek.push(mockDailyCounts[day])
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // 마지막 주 뒤쪽 빈칸
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  const legend = [
    { label: '0건', className: 'bg-muted' },
    { label: '1~10', className: 'bg-emerald-200 dark:bg-emerald-900' },
    { label: '11~20', className: 'bg-emerald-400 dark:bg-emerald-700' },
    { label: '21+', className: 'bg-emerald-600 dark:bg-emerald-500' },
  ]

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>월별 채증 현황</CardTitle>
        <CardDescription>2026년 3월 - 날짜를 클릭하면 상세 결과를 확인합니다</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-muted-foreground text-center text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((dayData, di) => {
                if (!dayData) {
                  return <div key={`empty-${wi}-${di}`} className="aspect-square" />
                }

                const isSelected = selectedDate === dayData.date
                const dayNum = parseInt(dayData.date.slice(-2))

                return (
                  <button
                    key={dayData.date}
                    onClick={() => onSelectDate(dayData.date)}
                    title={`${dayData.date}: ${dayData.count}건`}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-md text-xs transition-all hover:ring-2 hover:ring-ring',
                      getColor(dayData.count),
                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      dayData.count > 0 && 'cursor-pointer',
                      dayData.count === 0 && 'cursor-default'
                    )}
                  >
                    <span
                      className={cn(
                        'font-medium',
                        dayData.count === 0 && 'text-muted-foreground',
                        dayData.count > 0 && dayData.count <= 10 && 'text-emerald-900 dark:text-emerald-100',
                        dayData.count > 10 && 'text-white dark:text-emerald-50'
                      )}
                    >
                      {dayNum}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-muted-foreground text-xs">적음</span>
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={cn('size-3 rounded-sm', item.className)} />
              <span className="text-muted-foreground text-xs">{item.label}</span>
            </div>
          ))}
          <span className="text-muted-foreground text-xs">많음</span>
        </div>
      </CardContent>
    </Card>
  )
}
