'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InvestigationStatsData } from '@/types/api'

interface InvestigationChartsProps {
  data: InvestigationStatsData | null
  loading: boolean
}

export function InvestigationCharts({
  data,
  loading,
}: InvestigationChartsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 채증 성공/실패 데이터
  const areaData = data.data.map((d) => {
    const successRate = d.successRateByStage.stage3
    const successCount = Math.round(d.totalInvestigations * successRate)
    const failCount = d.totalInvestigations - successCount
    return {
      date: d.date.slice(5),
      성공: successCount,
      실패: failCount,
    }
  })

  // 성공률 추이 데이터
  const rateData = data.data.map((d) => ({
    date: d.date.slice(5),
    성공률: Math.round(d.successRateByStage.stage3 * 100),
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 채증 성공/실패 AreaChart */}
      <Card>
        <CardHeader>
          <CardTitle>채증 성공/실패</CardTitle>
          <CardDescription>일별 채증 성공 및 실패 건수</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="성공"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="실패"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 성공률 추이 LineChart */}
      <Card>
        <CardHeader>
          <CardTitle>성공률 추이</CardTitle>
          <CardDescription>
            최종 단계(stage3) 성공률 / 목표 70%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rateData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value) => [`${value}%`, '성공률']}
              />
              <ReferenceLine
                y={70}
                stroke="#f59e0b"
                strokeDasharray="8 4"
                label={{
                  value: '목표 70%',
                  position: 'right',
                  fill: '#f59e0b',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="성공률"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
