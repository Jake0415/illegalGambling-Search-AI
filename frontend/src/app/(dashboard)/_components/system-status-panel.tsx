'use client'

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  ShieldAlert,
  Globe2,
  Server,
  Users,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummaryData, ServiceHealth } from '@/types/api'

function getStatusIcon(status: ServiceHealth) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="size-4 text-emerald-500" />
    case 'degraded':
      return <AlertTriangle className="size-4 text-yellow-500" />
    case 'down':
      return <XCircle className="size-4 text-red-500" />
  }
}

function getStatusBadge(status: ServiceHealth) {
  const config = {
    healthy: {
      label: '정상',
      className:
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    degraded: {
      label: '경고',
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    down: {
      label: '오류',
      className:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  )
}

interface SystemStatusPanelProps {
  data: DashboardSummaryData | null
  loading: boolean
}

export function SystemStatusPanel({ data, loading }: SystemStatusPanelProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const { externalServices, system, manualQueue } = data

  const uptimeColor =
    system.uptime >= 99
      ? 'text-emerald-600 dark:text-emerald-400'
      : system.uptime >= 95
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400'

  const lastIncidentDate = system.lastIncident
    ? new Date(system.lastIncident).toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
      })
    : '-'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">시스템 상태</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* SMS Provider */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(externalServices.smsProvider.status)}
            <MessageSquare className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">SMS (PVAPins)</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(externalServices.smsProvider.status)}
            <span className="text-sm text-muted-foreground">
              잔액: ${externalServices.smsProvider.balance.toFixed(1)}
            </span>
          </div>
        </div>

        {/* CAPTCHA Solver */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(externalServices.captchaSolver.status)}
            <ShieldAlert className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">CAPTCHA (CapSolver)</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(externalServices.captchaSolver.status)}
            <span className="text-sm text-muted-foreground">
              잔액: ${externalServices.captchaSolver.balance.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Proxy */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(externalServices.proxy.status)}
            <Globe2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">프록시</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(externalServices.proxy.status)}
            <span className="text-sm text-muted-foreground">
              IP: {externalServices.proxy.activeIPs}개
            </span>
          </div>
        </div>

        {/* System Uptime */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">시스템</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${uptimeColor}`}>
              가동률: {system.uptime}%
            </span>
            <span className="text-xs text-muted-foreground">
              최근 장애: {lastIncidentDate}
            </span>
          </div>
        </div>

        {/* Manual Queue */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">수동 개입 큐</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                manualQueue.pending > 0
                  ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                  : ''
              }
            >
              대기: {manualQueue.pending}건
            </Badge>
            <span className="text-xs text-muted-foreground">
              평균 대기: {manualQueue.avgWaitTime}분
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
