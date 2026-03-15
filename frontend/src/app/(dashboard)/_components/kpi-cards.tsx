'use client'

import Link from 'next/link'
import {
  Globe,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummaryData } from '@/types/api'

interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  href: string
  trend?: { label: string; positive: boolean }
}

function KpiCard({ title, value, subtitle, icon: Icon, href, trend }: KpiCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{subtitle}</span>
            {trend && (
              <Badge
                variant="outline"
                className={
                  trend.positive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }
              >
                <TrendingUp className="mr-1 size-3" />
                {trend.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
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
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  )
}

interface KpiCardsProps {
  data: DashboardSummaryData | null
  loading: boolean
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const successRate = Math.round(data.successRates.stage3 * 100)
  const integrityRate = 100 // 모든 증거가 유효하다고 가정 (mock)

  const cards: KpiCardProps[] = [
    {
      title: '총 탐지 사이트',
      value: `${data.totalSites}개`,
      subtitle: `금일 +${data.newSites.today}`,
      icon: Globe,
      href: '/sites',
      trend: {
        label: `+${data.newSites.today}`,
        positive: true,
      },
    },
    {
      title: '채증 성공률',
      value: `${successRate}%`,
      subtitle: '목표 70%',
      icon: CheckCircle2,
      href: '/investigations',
      trend: {
        label: `목표 대비 +${successRate - 70}%`,
        positive: successRate >= 70,
      },
    },
    {
      title: '진행 중 작업',
      value: `${data.investigations.in_progress}건`,
      subtitle: `대기 ${data.investigations.queued}건`,
      icon: Loader2,
      href: '/investigations?status=IN_PROGRESS',
    },
    {
      title: '무결성 검증률',
      value: `${integrityRate}%`,
      subtitle: '전체 증거 대비 VALID',
      icon: ShieldCheck,
      href: '/evidence',
      trend: {
        label: '100%',
        positive: true,
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  )
}
