'use client'

import { Activity, Calendar, CheckCircle2, Clock } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { mockInvestigationKpi } from '@/server/mock/data/investigation-stats'

export function StatsKpiCards() {
  const kpi = mockInvestigationKpi
  const weekDiff = Math.round(
    ((kpi.weekCount - kpi.lastWeekCount) / kpi.lastWeekCount) * 100
  )

  const cards = [
    {
      title: '오늘 채증',
      value: `${kpi.todayCount}건`,
      subtitle: `전일비 +${kpi.todayCount - kpi.yesterdayCount}`,
      icon: Activity,
    },
    {
      title: '이번 주',
      value: `${kpi.weekCount}건`,
      subtitle: `전주비 +${weekDiff}%`,
      icon: Calendar,
    },
    {
      title: '성공률',
      value: `${kpi.successRate}%`,
      subtitle: `목표 ${kpi.targetRate}%\u2191`,
      icon: CheckCircle2,
    },
    {
      title: '평균 소요시간',
      value: kpi.avgDuration,
      subtitle: `전주비 -30초`,
      icon: Clock,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
