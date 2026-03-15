'use client'

import { useRouter } from 'next/navigation'
import type { PieLabelRenderProps } from 'recharts'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
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
import type { CategoryDistributionData } from '@/types/api'

interface CategoryChartsProps {
  data: CategoryDistributionData | null
  loading: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  CASINO: '카지노',
  SPORTS_BETTING: '스포츠 도박',
  HORSE_RACING: '경마',
  OTHER_GAMBLING: '기타 도박',
  NON_GAMBLING: '비도박',
  UNCLASSIFIED: '미분류',
}

const PIE_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#94a3b8',
]

// 상태별 분포 더미 데이터
const STATUS_DATA = [
  { name: '활성', value: 60, color: '#10b981' },
  { name: '모니터링', value: 17, color: '#3b82f6' },
  { name: '비활성', value: 13, color: '#f59e0b' },
  { name: '폐쇄', value: 10, color: '#ef4444' },
]

export function CategoryCharts({ data, loading }: CategoryChartsProps) {
  const router = useRouter()

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mx-auto h-[280px] w-[280px] rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const pieData = data.categories.map((c) => ({
    name: CATEGORY_LABELS[c.category] ?? c.category,
    value: c.count,
    percentage: c.percentage,
    category: c.category,
  }))

  const barData = [...data.categories]
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      name: CATEGORY_LABELS[c.category] ?? c.category,
      count: c.count,
      percentage: c.percentage,
      category: c.category,
    }))

  const handlePieClick = (entry: { category: string }) => {
    if (entry.category !== 'UNCLASSIFIED') {
      router.push(`/sites?category=${entry.category}`)
    }
  }

  const handleBarClick = (entry: { category: string }) => {
    if (entry.category !== 'UNCLASSIFIED') {
      router.push(`/sites?category=${entry.category}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 파이 차트 2컬럼 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 카테고리 파이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리 분포</CardTitle>
            <CardDescription>사이트 유형별 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(props: PieLabelRenderProps) => {
                    const entry = pieData[props.index ?? 0]
                    return `${entry?.name ?? ''} ${entry?.percentage ?? 0}%`
                  }}
                  onClick={(_: unknown, index: number) =>
                    handlePieClick(pieData[index])
                  }
                  className="cursor-pointer"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                  }}
                  formatter={(value) => [`${value}개`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 상태별 도넛 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>상태별 분포</CardTitle>
            <CardDescription>사이트 활성 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={(props: PieLabelRenderProps) => {
                    const entry = STATUS_DATA[props.index ?? 0]
                    return `${entry?.name ?? ''} ${entry?.value ?? 0}%`
                  }}
                >
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                  }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 수평 바 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 사이트 수</CardTitle>
          <CardDescription>
            카테고리 클릭 시 해당 사이트 목록으로 이동
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value, _name, props) => [
                  `${value}개 (${(props as { payload?: { percentage?: number } }).payload?.percentage ?? 0}%)`,
                  '사이트 수',
                ]}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                className="cursor-pointer"
                onClick={(_: unknown, index: number) =>
                  handleBarClick(barData[index])
                }
              >
                {barData.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
