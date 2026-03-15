'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, RefreshCcw } from 'lucide-react'

import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import type {
  CategoryDistributionData,
  DashboardSummaryData,
  DetectionStatsData,
  InvestigationStatsData,
} from '@/types/api'
import type { CostTrendItem } from '@/server/mock/data/stats'

import { PeriodSelector, type Period } from './period-selector'
import { AnalyticsKpiCards } from './analytics-kpi-cards'
import { DetectionTrendChart } from './detection-trend-chart'
import { InvestigationCharts } from './investigation-charts'
import { CategoryCharts } from './category-charts'

function getPeriodDays(period: Period): number {
  switch (period) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case '1y':
      return 365
    default:
      return 30
  }
}

export function AnalyticsView() {
  const [period, setPeriod] = useState<Period>('30d')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<DashboardSummaryData | null>(null)
  const [detectionStats, setDetectionStats] =
    useState<DetectionStatsData | null>(null)
  const [investigationStats, setInvestigationStats] =
    useState<InvestigationStatsData | null>(null)
  const [categoryData, setCategoryData] =
    useState<CategoryDistributionData | null>(null)
  const [costData, setCostData] = useState<CostTrendItem[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const days = getPeriodDays(period)
      const [overviewRes, sitesRes, invRes, catRes, costsRes] =
        await Promise.all([
          fetch('/api/analytics/overview'),
          fetch(`/api/analytics/sites?period=daily`),
          fetch(`/api/analytics/investigations?period=daily`),
          fetch('/api/analytics/categories'),
          fetch(`/api/analytics/costs?days=${days}`),
        ])

      const [overviewJson, sitesJson, invJson, catJson, costsJson] =
        await Promise.all([
          overviewRes.json(),
          sitesRes.json(),
          invRes.json(),
          catRes.json(),
          costsRes.json(),
        ])

      if (overviewJson.data) setOverview(overviewJson.data)
      if (sitesJson.data) setDetectionStats(sitesJson.data)
      if (invJson.data) setInvestigationStats(invJson.data)
      if (catJson.data) setCategoryData(catJson.data)
      if (costsJson.data) setCostData(costsJson.data)
    } catch {
      // API 호출 실패 시 무시
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExportCsv = () => {
    // CSV 내보내기 - Phase 3에서 papaparse로 구현
    // 현재는 간단한 CSV 다운로드
    if (!detectionStats) return

    const header = 'date,detectedCount,google,crawling,community,manual\n'
    const rows = detectionStats.data
      .map(
        (d) =>
          `${d.date},${d.detectedCount},${d.bySource['GOOGLE_SEARCH'] ?? 0},${d.bySource['CRAWLING'] ?? 0},${d.bySource['COMMUNITY'] ?? 0},${d.bySource['MANUAL'] ?? 0}`
      )
      .join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 기간에 따라 데이터 슬라이싱
  const days = getPeriodDays(period)
  const slicedDetection = detectionStats
    ? { ...detectionStats, data: detectionStats.data.slice(-days) }
    : null
  const slicedInvestigation = investigationStats
    ? { ...investigationStats, data: investigationStats.data.slice(-days) }
    : null

  return (
    <PageContainer
      title="통계 및 분석"
      description="탐지/채증 현황 통계"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={loading || !detectionStats}
          >
            <Download className="mr-2 size-4" />
            CSV 내보내기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 size-4" />
            새로고침
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* 기간 선택기 */}
        <PeriodSelector value={period} onChange={setPeriod} />

        {/* KPI 요약 카드 */}
        <AnalyticsKpiCards
          overview={overview}
          costData={costData}
          loading={loading}
        />

        {/* 섹션 1: 탐지 추이 차트 */}
        <DetectionTrendChart data={slicedDetection} loading={loading} />

        {/* 섹션 2: 채증 통계 차트 (2컬럼) */}
        <InvestigationCharts data={slicedInvestigation} loading={loading} />

        {/* 섹션 3: 카테고리별 분포 */}
        <CategoryCharts data={categoryData} loading={loading} />
      </div>
    </PageContainer>
  )
}
