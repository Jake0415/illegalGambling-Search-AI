'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  mockDailyResults,
  type DailyResultItem,
} from '@/server/mock/data/investigation-stats'

interface DailyTimelineProps {
  selectedDate: string
}

function getStageBadgeVariant(stage: number) {
  if (stage === 3) return 'default'
  if (stage === 2) return 'secondary'
  return 'outline'
}

function filterResults(
  items: DailyResultItem[],
  resultFilter: string,
  stageFilter: string,
  modeFilter: string
): DailyResultItem[] {
  return items.filter((item) => {
    if (resultFilter !== 'all' && item.result !== resultFilter) return false
    if (stageFilter !== 'all' && item.stage !== parseInt(stageFilter))
      return false
    if (modeFilter !== 'all' && item.mode !== modeFilter) return false
    return true
  })
}

export function DailyTimeline({ selectedDate }: DailyTimelineProps) {
  const [resultFilter, setResultFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')

  const dateLabel = selectedDate.slice(5).replace('-', '/')
  const filtered = filterResults(
    mockDailyResults,
    resultFilter,
    stageFilter,
    modeFilter
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{dateLabel} 채증 결과 ({mockDailyResults.length}건)</CardTitle>
            <CardDescription>
              {filtered.length !== mockDailyResults.length &&
                `필터 적용: ${filtered.length}건 표시`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="결과" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="success">성공</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="단계" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="1">1단계</SelectItem>
                <SelectItem value="2">2단계</SelectItem>
                <SelectItem value="3">3단계</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="모드" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="auto">자동</SelectItem>
                <SelectItem value="manual">수동</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              조건에 맞는 결과가 없습니다
            </p>
          )}
          {filtered.map((item, idx) => (
            <div
              key={`${item.time}-${idx}`}
              className="flex flex-col gap-1 rounded-lg border p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground w-12 shrink-0 font-mono text-sm">
                  {item.time}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.siteUrl}
                </span>
                <Badge variant={getStageBadgeVariant(item.stage)}>
                  {item.stage}단계
                </Badge>
                <Badge
                  variant={item.result === 'success' ? 'default' : 'destructive'}
                >
                  {item.result === 'success' ? '성공' : '실패'}
                </Badge>
                <Badge variant="outline">
                  {item.mode === 'auto' ? '자동' : '수동'}
                </Badge>
                {item.screenshotCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                    <Camera className="size-3" />
                    <span className="text-xs">{item.screenshotCount}장</span>
                  </Button>
                )}
              </div>
              {item.result === 'failed' && item.reason && (
                <p className="text-destructive ml-14 text-xs">
                  실패 사유: {item.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
