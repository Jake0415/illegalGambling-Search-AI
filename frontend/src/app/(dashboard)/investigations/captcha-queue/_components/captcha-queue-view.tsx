'use client'

import {
  Clock,
  Eye,
  Hand,
  KeyRound,
  Monitor,
  SkipForward,
  Timer,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { PageContainer } from '@/components/common/page-container'
import { StatusBadge } from '@/components/common/status-badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type { ManualQueueItem } from '@/types/api'
import { InterventionStatus, InterventionType } from '@/types/enums'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_QUEUE_ITEMS: ManualQueueItem[] = [
  {
    id: 'mq-001',
    type: InterventionType.CAPTCHA,
    status: InterventionStatus.PENDING,
    siteUrl: 'https://lucky-baccarat.asia/login',
    waitingSince: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    timeRemaining: 270,
    screenshotUrl: null,
    investigationId: 'inv-001',
  },
  {
    id: 'mq-002',
    type: InterventionType.OTP,
    status: InterventionStatus.PENDING,
    siteUrl: 'https://power-bet365.com/register',
    waitingSince: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    timeRemaining: 180,
    screenshotUrl: null,
    investigationId: 'inv-002',
  },
  {
    id: 'mq-003',
    type: InterventionType.CAPTCHA,
    status: InterventionStatus.IN_PROGRESS,
    siteUrl: 'https://mega-casino.net/signup',
    waitingSince: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timeRemaining: 120,
    screenshotUrl: null,
    investigationId: 'inv-003',
  },
  {
    id: 'mq-004',
    type: InterventionType.UNKNOWN_FORM,
    status: InterventionStatus.PENDING,
    siteUrl: 'https://golden-slot.io/auth',
    waitingSince: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    timeRemaining: 290,
    screenshotUrl: null,
    investigationId: 'inv-004',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeLabel(type: string) {
  switch (type) {
    case InterventionType.CAPTCHA:
      return 'CAPTCHA'
    case InterventionType.OTP:
      return 'OTP'
    case InterventionType.UNKNOWN_FORM:
      return '알 수 없는 폼'
    default:
      return type
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case InterventionType.CAPTCHA:
      return Eye
    case InterventionType.OTP:
      return KeyRound
    default:
      return Hand
  }
}

function formatWaitTime(since: string): string {
  const diff = Date.now() - new Date(since).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  return `${hours}시간 ${minutes % 60}분 전`
}

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Remote Browser Viewer Dialog
// ---------------------------------------------------------------------------

function RemoteBrowserDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ManualQueueItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    if (!open || !item) return
    setTimeLeft(item.timeRemaining)
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [open, item])

  if (!item) return null

  const progress = (timeLeft / 300) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="size-5" />
            원격 브라우저 - {new URL(item.siteUrl).hostname}
          </DialogTitle>
          <DialogDescription>
            CDP WebSocket 기반 원격 브라우저 뷰어
          </DialogDescription>
        </DialogHeader>

        {/* Status bar */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">연결:</span>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              연결됨
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">남은 시간:</span>
            <span className="font-mono font-medium">
              {formatRemaining(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">세션:</span>
            <span className="font-mono text-xs">cdp-{item.id}</span>
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        {/* Browser viewport placeholder */}
        <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
          <div className="text-center space-y-2">
            <Monitor className="mx-auto size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              원격 브라우저 화면 스트리밍 영역
            </p>
            <p className="text-xs text-muted-foreground">
              CDP WebSocket 연결 시 실시간 화면이 표시됩니다
            </p>
            <div className="mx-auto mt-4 w-48 rounded-md border bg-background p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="size-4 rounded border" />
                <span className="text-xs">로봇이 아닙니다</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          해상도: 1280x720 | FPS: 8 | 지연: 120ms
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setTimeLeft((prev) => prev + 300)
            }}
          >
            <Timer className="mr-1.5 size-4" />
            타임아웃 연장 +5분
          </Button>
          <Button
            variant="destructive"
            onClick={() => onOpenChange(false)}
          >
            세션 종료
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            풀이 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Queue Card
// ---------------------------------------------------------------------------

function QueueCard({
  item,
  onSolve,
  onSkip,
  onExtend,
}: {
  item: ManualQueueItem
  onSolve: () => void
  onSkip: () => void
  onExtend: () => void
}) {
  const TypeIcon = getTypeIcon(item.type)
  const remainingPercent = (item.timeRemaining / 300) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <TypeIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {getTypeLabel(item.type)}
              </CardTitle>
              <CardDescription className="text-xs">
                {item.siteUrl}
              </CardDescription>
            </div>
          </div>
          <StatusBadge type="intervention" value={item.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Screenshot placeholder */}
        <div className="flex aspect-video items-center justify-center rounded-md border bg-muted/30">
          <div className="text-center">
            <Eye className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-1 text-xs text-muted-foreground">
              스크린샷 미리보기
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            대기: {formatWaitTime(item.waitingSince)}
          </div>
          <div className="flex items-center gap-1">
            <Timer className="size-3" />
            남은 시간: {formatRemaining(item.timeRemaining)}
          </div>
        </div>

        <Progress value={remainingPercent} className="h-1" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={onSolve}>
            <Hand className="mr-1 size-3.5" />
            풀이 시작
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onExtend}
          >
            <Timer className="mr-1 size-3.5" />
            연장
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSkip}
          >
            <SkipForward className="mr-1 size-3.5" />
            스킵
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export function CaptchaQueueView() {
  const [items, setItems] = useState<ManualQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerItem, setViewerItem] = useState<ManualQueueItem | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Use mock data for Phase 2
      await new Promise((r) => setTimeout(r, 500))
      setItems(MOCK_QUEUE_ITEMS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const pendingCount = items.filter(
    (i) => i.status === InterventionStatus.PENDING
  ).length
  const inProgressCount = items.filter(
    (i) => i.status === InterventionStatus.IN_PROGRESS
  ).length

  function handleSolve(item: ManualQueueItem) {
    setViewerItem(item)
    setViewerOpen(true)
  }

  function handleSkip(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleExtend(id: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, timeRemaining: i.timeRemaining + 300 } : i
      )
    )
  }

  return (
    <PageContainer
      title="CAPTCHA/OTP 수동 개입"
      description="자동 풀이가 실패한 CAPTCHA/OTP 항목을 수동으로 처리합니다."
    >
      {/* Summary */}
      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <div className="size-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">대기 중</span>
          <span className="text-lg font-bold">{pendingCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">처리 중</span>
          <span className="text-lg font-bold">{inProgressCount}</span>
        </div>
      </div>

      {/* Queue cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">
            대기열을 불러오는 중...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Hand className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold">대기 중인 항목이 없습니다</h3>
          <p className="text-sm text-muted-foreground mt-1">
            모든 CAPTCHA/OTP가 자동으로 처리되었습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              onSolve={() => handleSolve(item)}
              onSkip={() => handleSkip(item.id)}
              onExtend={() => handleExtend(item.id)}
            />
          ))}
        </div>
      )}

      {/* Remote Browser Viewer */}
      <RemoteBrowserDialog
        item={viewerItem}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </PageContainer>
  )
}
