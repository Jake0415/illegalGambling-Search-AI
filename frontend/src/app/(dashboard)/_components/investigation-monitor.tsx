'use client'

import Link from 'next/link'
import { Clock, ExternalLink } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummaryData } from '@/types/api'

// 진행 중인 채증 작업 mock 데이터
const mockInProgressItems = [
  {
    id: 'inv-015',
    siteUrl: 'top-score-bet.com',
    currentStage: 2,
    progress: 50,
    elapsedMinutes: 12,
  },
  {
    id: 'inv-016',
    siteUrl: 'dragon-tiger.asia',
    currentStage: 1,
    progress: 25,
    elapsedMinutes: 4,
  },
  {
    id: 'inv-017',
    siteUrl: 'night-casino.live',
    currentStage: 1,
    progress: 25,
    elapsedMinutes: 2,
  },
]

interface InvestigationMonitorProps {
  data: DashboardSummaryData | null
  loading: boolean
}

export function InvestigationMonitor({ data, loading }: InvestigationMonitorProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const inProgressCount = data.investigations.in_progress

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          채증 진행 모니터링 ({inProgressCount}건)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockInProgressItems.map((item) => (
          <Link
            key={item.id}
            href={`/investigations/${item.id}`}
            className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.id}</span>
                <Badge variant="outline" className="text-xs">
                  {item.currentStage}단계 진행 중
                </Badge>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {item.siteUrl}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={item.progress} className="flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {item.progress}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              경과: {item.elapsedMinutes}분
            </div>
          </Link>
        ))}
        {inProgressCount === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            진행 중인 채증 작업이 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  )
}
