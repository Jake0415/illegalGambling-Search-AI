'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
import { mockInvestigationTrend } from '@/server/mock/data/investigation-stats'

export function StatsTrendChart() {
  const chartData = mockInvestigationTrend.map((d) => ({
    date: d.date.slice(5),
    성공: d.success,
    실패: d.failed,
    합계: d.success + d.failed,
  }))

  // 목표선: 전체 건수의 70% 기준 -> 평균 total의 70%
  const avgTotal =
    chartData.reduce((sum, d) => sum + d.합계, 0) / chartData.length
  const targetLine = Math.round(avgTotal * 0.7)

  return (
    <Card>
      <CardHeader>
        <CardTitle>채증 추이</CardTitle>
        <CardDescription>
          최근 30일간 일별 채증 성공/실패 추이 (점선: 70% 목표선)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Legend />
            <ReferenceLine
              y={targetLine}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: `목표 ${targetLine}건`,
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="성공"
              stackId="1"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorSuccess)"
            />
            <Area
              type="monotone"
              dataKey="실패"
              stackId="1"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorFailed)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
