'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Camera,
  XCircle,
  Bot,
  Globe,
  AlertTriangle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// 활동 유형 정의
interface ActivityTypeConfig {
  label: string
  icon: LucideIcon
  color: string
}

const activityTypes: Record<string, ActivityTypeConfig> = {
  detection: {
    label: '탐지',
    icon: Search,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  investigation: {
    label: '채증',
    icon: Camera,
    color:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  failure: {
    label: '실패',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  classification: {
    label: '분류',
    icon: Bot,
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  domain: {
    label: '도메인',
    icon: Globe,
    color:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  intervention: {
    label: '개입',
    icon: AlertTriangle,
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
}

// Mock 활동 데이터
const mockActivities = [
  {
    id: '1',
    type: 'detection',
    message: '신규 사이트 탐지: lucky-spin-kr.com',
    detail: '카테고리: 카지노 | AI 신뢰도: 94%',
    timestamp: '3분 전',
    href: '/sites',
  },
  {
    id: '2',
    type: 'investigation',
    message: '채증 완료: bet-winner365.com',
    detail: '3단계 전체 완료 | 소요: 14분',
    timestamp: '8분 전',
    href: '/investigations',
  },
  {
    id: '3',
    type: 'failure',
    message: '채증 실패: mega-bet.co.kr',
    detail: '1단계 실패: DNS 확인 실패 | 재시도 3/3',
    timestamp: '15분 전',
    href: '/investigations',
  },
  {
    id: '4',
    type: 'classification',
    message: 'AI 분류 완료: all-in-poker.net',
    detail: '기타 도박 (74%) | 수동 검토 필요',
    timestamp: '22분 전',
    href: '/review',
  },
  {
    id: '5',
    type: 'detection',
    message: '신규 사이트 탐지: royal-slot777.com',
    detail: '카테고리: 카지노 | AI 신뢰도: 91%',
    timestamp: '35분 전',
    href: '/sites',
  },
  {
    id: '6',
    type: 'investigation',
    message: '채증 완료: power-betting.kr',
    detail: '3단계 전체 완료 | 소요: 18분',
    timestamp: '42분 전',
    href: '/investigations',
  },
  {
    id: '7',
    type: 'domain',
    message: '도메인 상태 변경: gold-casino.net',
    detail: 'ALIVE → DEAD | DNS 응답 없음',
    timestamp: '1시간 전',
    href: '/sites',
  },
  {
    id: '8',
    type: 'intervention',
    message: '수동 개입 요청: vip-poker-room.asia',
    detail: 'CAPTCHA 인증 필요 | 제한 시간: 5분',
    timestamp: '1시간 전',
    href: '/investigations/captcha-queue',
  },
]

const filterOptions = [
  { value: 'all', label: '전체' },
  { value: 'detection', label: '탐지' },
  { value: 'investigation', label: '채증' },
  { value: 'classification', label: '분류' },
  { value: 'domain', label: '도메인' },
  { value: 'intervention', label: '개입' },
  { value: 'failure', label: '실패' },
]

export function ActivityFeed() {
  const [filter, setFilter] = useState('all')

  const filteredActivities =
    filter === 'all'
      ? mockActivities
      : mockActivities.filter((a) => a.type === filter)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">최근 활동 피드</CardTitle>
          <div className="flex flex-wrap gap-1">
            {filterOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={filter === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const config = activityTypes[activity.type]
              if (!config) return null
              const Icon = config.icon
              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.color}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.detail}
                    </p>
                  </div>
                </Link>
              )
            })}
            {filteredActivities.length === 0 && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                해당 유형의 활동이 없습니다
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
