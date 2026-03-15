'use client'

import {
  DollarSign,
  CalendarDays,
  CreditCard,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { CostTrendItem } from '@/server/mock/data/stats'

// 기본 한도 값 (mock)
const DAILY_COST_LIMIT = 30
const MONTHLY_COST_LIMIT = 500

interface SmsCostKpiCardsProps {
  costData: CostTrendItem[]
  loading: boolean
}

export function SmsCostKpiCards({ costData, loading }: SmsCostKpiCardsProps) {
  if (loading || costData.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 금일 비용 (마지막 항목)
  const todayCost = costData[costData.length - 1]?.smsCost ?? 0
  const dailyUsagePercent = Math.round((todayCost / DAILY_COST_LIMIT) * 100)

  // 월간 비용 (전체 합산)
  const monthlyCost = costData.reduce((sum, d) => sum + d.smsCost, 0)
  const monthlyUsagePercent = Math.round(
    (monthlyCost / MONTHLY_COST_LIMIT) * 100
  )

  // 잔여 크레딧 (PVAPins mock)
  const remainingCredit = 245.5

  // 평균 성공률 (mock)
  const avgSuccessRate = 82.5
  const prevDaySuccessRate = 80.4
  const successRateDiff = +(avgSuccessRate - prevDaySuccessRate).toFixed(1)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 금일 비용 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              금일 비용
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${todayCost.toFixed(2)}</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>한도: ${DAILY_COST_LIMIT}</span>
              <span>{dailyUsagePercent}%</span>
            </div>
            <Progress
              value={Math.min(dailyUsagePercent, 100)}
              className={
                dailyUsagePercent >= 100
                  ? '[&>[data-slot=progress-indicator]]:bg-red-500'
                  : dailyUsagePercent >= 80
                    ? '[&>[data-slot=progress-indicator]]:bg-yellow-500'
                    : ''
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 월간 비용 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              월간 비용
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyCost.toFixed(2)}</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>한도: ${MONTHLY_COST_LIMIT}</span>
              <span>{monthlyUsagePercent}%</span>
            </div>
            <Progress
              value={Math.min(monthlyUsagePercent, 100)}
              className={
                monthlyUsagePercent >= 100
                  ? '[&>[data-slot=progress-indicator]]:bg-red-500'
                  : monthlyUsagePercent >= 80
                    ? '[&>[data-slot=progress-indicator]]:bg-yellow-500'
                    : ''
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 잔여 크레딧 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              잔여 크레딧
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${remainingCredit.toFixed(2)}</div>
          <div className="mt-1 text-xs text-muted-foreground">PVAPins 기준</div>
        </CardContent>
      </Card>

      {/* 평균 성공률 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 성공률
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgSuccessRate}%</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">전일 대비</span>
            <Badge
              variant="outline"
              className={
                successRateDiff >= 0
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
              }
            >
              {successRateDiff >= 0 ? '+' : ''}
              {successRateDiff}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
