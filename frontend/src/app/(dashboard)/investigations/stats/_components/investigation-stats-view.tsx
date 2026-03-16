'use client'

import { useState } from 'react'

import { PageContainer } from '@/components/common/page-container'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { StatsKpiCards } from './stats-kpi-cards'
import { CalendarHeatmap } from './calendar-heatmap'
import { HourlyDistributionChart } from './hourly-distribution-chart'
import { DailyTimeline } from './daily-timeline'
import { StatsTrendChart } from './stats-trend-chart'

export function InvestigationStatsView() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedDate, setSelectedDate] = useState<string | null>(
    '2026-03-17'
  )

  return (
    <PageContainer
      title="채증 통계"
      description="증거 수집(채증) 활동 통계 대시보드"
      actions={
        <ToggleGroup
          type="single"
          value={selectedPeriod}
          onValueChange={(value) => {
            if (value) setSelectedPeriod(value)
          }}
          variant="outline"
        >
          <ToggleGroupItem value="7">7일</ToggleGroupItem>
          <ToggleGroupItem value="30">30일</ToggleGroupItem>
          <ToggleGroupItem value="90">90일</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI 카드 */}
        <StatsKpiCards />

        {/* 캘린더 히트맵 + 시간대별 분포 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CalendarHeatmap
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <HourlyDistributionChart />
        </div>

        {/* 일별 타임라인 (날짜 선택 시) */}
        {selectedDate && <DailyTimeline selectedDate={selectedDate} />}

        {/* 채증 추이 차트 */}
        <StatsTrendChart />
      </div>
    </PageContainer>
  )
}
