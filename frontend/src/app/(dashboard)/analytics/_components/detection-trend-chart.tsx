'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { DetectionStatsData } from '@/types/api'

interface DetectionTrendChartProps {
  data: DetectionStatsData | null
  loading: boolean
}

const COLORS = {
  total: '#6366f1',
  google: '#f59e0b',
  crawling: '#10b981',
  community: '#3b82f6',
  manual: '#ef4444',
}

export function DetectionTrendChart({
  data,
  loading,
}: DetectionTrendChartProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.data.map((d) => ({
    date: d.date.slice(5), // MM-DD 형식
    전체: d.detectedCount,
    Google: d.bySource['GOOGLE_SEARCH'] ?? 0,
    크롤링: d.bySource['CRAWLING'] ?? 0,
    커뮤니티: d.bySource['COMMUNITY'] ?? 0,
    수동: d.bySource['MANUAL'] ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 탐지 추이</CardTitle>
        <CardDescription>
          신규 탐지 사이트 수 및 출처별 분포
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
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
            <Line
              type="monotone"
              dataKey="전체"
              stroke={COLORS.total}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Google"
              stroke={COLORS.google}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="크롤링"
              stroke={COLORS.crawling}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="커뮤니티"
              stroke={COLORS.community}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
