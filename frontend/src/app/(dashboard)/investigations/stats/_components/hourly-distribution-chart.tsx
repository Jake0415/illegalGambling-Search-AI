'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { mockHourlyDistribution } from '@/server/mock/data/investigation-stats'

export function HourlyDistributionChart() {
  const chartData = mockHourlyDistribution.map((d) => ({
    hour: `${d.hour}시`,
    자동: d.auto,
    수동: d.manual,
  }))

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>시간대별 분포</CardTitle>
        <CardDescription>자동/수동 채증 시간대별 현황</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={1}
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
            <Bar
              dataKey="자동"
              stackId="a"
              fill="#3b82f6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="수동"
              stackId="a"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
