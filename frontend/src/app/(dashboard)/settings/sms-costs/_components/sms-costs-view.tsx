'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'

import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import type { CostTrendItem } from '@/server/mock/data/stats'

import { SmsCostKpiCards } from './sms-cost-kpi-cards'
import { SmsServiceCards } from './sms-service-cards'
import { SmsCostLimitsForm } from './sms-cost-limits-form'

export function SmsCostsView() {
  const [costData, setCostData] = useState<CostTrendItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/costs?days=30')
      const json = await res.json()
      if (json.data) {
        setCostData(json.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <PageContainer
      title="SMS 비용 대시보드"
      description="SMS 서비스별 사용량, 비용, 성공률 모니터링"
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
        <SmsCostKpiCards costData={costData} loading={loading} />

        {/* 비용 추이 차트 영역 - Round 3에서 Recharts 구현 예정 */}
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          비용 추이 차트 (Round 3에서 Recharts로 구현 예정)
        </div>

        {/* 서비스별 상세 카드 */}
        <SmsServiceCards loading={loading} />

        {/* 한도 설정 */}
        <SmsCostLimitsForm />
      </div>
    </PageContainer>
  )
}
