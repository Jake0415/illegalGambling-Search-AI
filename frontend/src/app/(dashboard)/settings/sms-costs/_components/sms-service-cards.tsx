'use client'

import {
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type ServiceStatus = 'healthy' | 'degraded' | 'unconfigured'

interface SmsServiceData {
  name: string
  status: ServiceStatus
  balance: number | null
  today: {
    issued: number
    success: number
    successRate: number
    cost: number
  }
  monthly: {
    issued: number
    cost: number
  }
}

const mockServices: SmsServiceData[] = [
  {
    name: 'PVAPins',
    status: 'healthy',
    balance: 245.5,
    today: {
      issued: 12,
      success: 10,
      successRate: 83,
      cost: 3.2,
    },
    monthly: {
      issued: 280,
      cost: 84.0,
    },
  },
  {
    name: 'GrizzlySMS',
    status: 'healthy',
    balance: 82.3,
    today: {
      issued: 5,
      success: 2,
      successRate: 40,
      cost: 1.62,
    },
    monthly: {
      issued: 95,
      cost: 43.5,
    },
  },
  {
    name: 'SMS-Activate',
    status: 'unconfigured',
    balance: null,
    today: {
      issued: 0,
      success: 0,
      successRate: 0,
      cost: 0,
    },
    monthly: {
      issued: 0,
      cost: 0,
    },
  },
]

function getStatusBadge(status: ServiceStatus) {
  switch (status) {
    case 'healthy':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
        >
          <CheckCircle2 className="mr-1 size-3" />
          정상
        </Badge>
      )
    case 'degraded':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
        >
          <AlertTriangle className="mr-1 size-3" />
          경고
        </Badge>
      )
    case 'unconfigured':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
        >
          <MinusCircle className="mr-1 size-3" />
          미설정
        </Badge>
      )
  }
}

interface SmsServiceCardsProps {
  loading: boolean
}

export function SmsServiceCards({ loading }: SmsServiceCardsProps) {
  if (loading) {
    return (
      <div>
        <h3 className="mb-4 text-base font-semibold">서비스별 상세</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold">서비스별 상세</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockServices.map((service) => (
          <Card key={service.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{service.name}</CardTitle>
                {getStatusBadge(service.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 잔액 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">잔액</span>
                <span className="font-medium">
                  {service.balance !== null
                    ? `$${service.balance.toFixed(2)}`
                    : '-'}
                </span>
              </div>

              {/* 금일 사용 */}
              {service.status !== 'unconfigured' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">금일 사용</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">발급</span>
                      <span>{service.today.issued}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">성공</span>
                      <span>
                        {service.today.success}건 ({service.today.successRate}%)
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-between">
                      <span className="text-muted-foreground">비용</span>
                      <span>${service.today.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 월간 누적 */}
              {service.status !== 'unconfigured' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">월간 누적</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">발급</span>
                      <span>{service.monthly.issued}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">비용</span>
                      <span>${service.monthly.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {service.status === 'unconfigured' && (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  서비스가 설정되지 않았습니다
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
