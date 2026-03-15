'use client'

import { BarChart3, CheckCircle2, DollarSign, Search } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummaryData } from '@/types/api'
import type { CostTrendItem } from '@/server/mock/data/stats'

interface AnalyticsKpiCardsProps {
  overview: DashboardSummaryData | null
  costData: CostTrendItem[]
  loading: boolean
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function AnalyticsKpiCards({
  overview,
  costData,
  loading,
}: AnalyticsKpiCardsProps) {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const totalDetected = overview.totalSites
  const successRate = Math.round(overview.successRates.stage3 * 100)
  const totalCost = costData.reduce((sum, d) => sum + d.totalCost, 0)
  const aiClassified = Math.round(totalDetected * 0.85) // Mock: 85% AI 분류

  const cards = [
    {
      title: '탐지 사이트 수',
      value: `${totalDetected}개`,
      subtitle: `금일 +${overview.newSites.today}`,
      icon: Search,
    },
    {
      title: '채증 성공률',
      value: `${successRate}%`,
      subtitle: '최종 단계 기준',
      icon: CheckCircle2,
    },
    {
      title: '총 비용',
      value: `$${totalCost.toFixed(0)}`,
      subtitle: `SMS + 캡차 + 프록시`,
      icon: DollarSign,
    },
    {
      title: 'AI 분류 완료',
      value: `${aiClassified}건`,
      subtitle: `전체 대비 ${Math.round((aiClassified / totalDetected) * 100)}%`,
      icon: BarChart3,
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
