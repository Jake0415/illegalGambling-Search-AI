'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'

import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import type { DashboardSummaryData } from '@/types/api'

import { KpiCards } from './kpi-cards'
import { InvestigationMonitor } from './investigation-monitor'
import { SystemStatusPanel } from './system-status-panel'
import { ActivityFeed } from './activity-feed'

export function DashboardView() {
  const [data, setData] = useState<DashboardSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/overview')
      const json = await res.json()
      if (json.data) {
        setData(json.data)
      }
    } catch {
      // API 호출 실패 시 무시
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 60초 자동 갱신
  useEffect(() => {
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  return (
    <PageContainer
      title="대시보드"
      description="시스템 운영 현황"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCcw className="mr-2 size-4" />
          새로고침
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI 카드 4개 */}
        <KpiCards data={data} loading={loading} />

        {/* 2컬럼: 채증 진행 모니터링 + 시스템 상태 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InvestigationMonitor data={data} loading={loading} />
          <SystemStatusPanel data={data} loading={loading} />
        </div>

        {/* 최근 활동 피드 */}
        <ActivityFeed />
      </div>
    </PageContainer>
  )
}
