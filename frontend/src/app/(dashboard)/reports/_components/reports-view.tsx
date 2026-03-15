'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  Calendar,
  Download,
  Eye,
  FileText,
  Loader2,
  Plus,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { DataTable, DataTableColumnHeader } from '@/components/common/data-table'
import { PageContainer } from '@/components/common/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportItem {
  id: string
  title: string
  type: 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  periodStart: string
  periodEnd: string
  format: 'PDF' | 'EXCEL' | 'CSV'
  status: 'COMPLETED' | 'GENERATING' | 'FAILED'
  fileSize: string | null
  progress: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rpt-001',
    title: '월간 보고서 2026-02',
    type: 'MONTHLY',
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    format: 'PDF',
    status: 'COMPLETED',
    fileSize: '2.4MB',
    progress: 100,
    createdAt: '2026-03-01',
  },
  {
    id: 'rpt-002',
    title: '주간 보고서 W10',
    type: 'WEEKLY',
    periodStart: '2026-03-04',
    periodEnd: '2026-03-10',
    format: 'PDF',
    status: 'COMPLETED',
    fileSize: '1.1MB',
    progress: 100,
    createdAt: '2026-03-11',
  },
  {
    id: 'rpt-003',
    title: '주간 보고서 W11',
    type: 'WEEKLY',
    periodStart: '2026-03-11',
    periodEnd: '2026-03-14',
    format: 'PDF',
    status: 'GENERATING',
    fileSize: null,
    progress: 45,
    createdAt: '2026-03-15',
  },
  {
    id: 'rpt-004',
    title: '월간 보고서 2026-01',
    type: 'MONTHLY',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    format: 'PDF',
    status: 'COMPLETED',
    fileSize: '3.1MB',
    progress: 100,
    createdAt: '2026-02-01',
  },
]

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function getReportColumns(): ColumnDef<ReportItem, unknown>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="보고서명"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => {
        const map: Record<string, { label: string; variant: string }> = {
          WEEKLY: { label: '주간', variant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
          MONTHLY: { label: '월간', variant: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
          CUSTOM: { label: '커스텀', variant: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
        }
        const cfg = map[row.original.type] ?? { label: row.original.type, variant: '' }
        return (
          <Badge variant="outline" className={cfg.variant}>
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'periodStart',
      header: '기간',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.periodStart} ~ {row.original.periodEnd}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="생성일"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const item = row.original
        if (item.status === 'GENERATING') {
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin text-blue-500" />
              <span className="text-sm">생성 중 {item.progress}%</span>
            </div>
          )
        }
        if (item.status === 'FAILED') {
          return (
            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              실패
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            완료
          </Badge>
        )
      },
    },
    {
      accessorKey: 'format',
      header: '형식',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.format}</span>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: '크기',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.fileSize ?? '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '액션',
      cell: ({ row }) => {
        const item = row.original
        if (item.status === 'GENERATING') {
          return <Progress value={item.progress} className="h-2 w-20" />
        }
        if (item.status === 'FAILED') return null
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.info('보고서 미리보기', {
                  description: `${item.title} 미리보기를 엽니다.`,
                })
              }
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.success('다운로드 시작', {
                  description: `${item.title} (${item.fileSize})`,
                })
              }
            >
              <Download className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Create Report Dialog
// ---------------------------------------------------------------------------

function CreateReportDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleCreate() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast.success('보고서 생성 시작', {
        description: '보고서가 생성 중입니다. 완료되면 알림을 드립니다.',
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          보고서 생성
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>보고서 생성</DialogTitle>
          <DialogDescription>
            새 보고서를 생성합니다. 유형과 기간을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>보고서 유형</Label>
            <Select defaultValue="WEEKLY">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">주간 보고서</SelectItem>
                <SelectItem value="MONTHLY">월간 보고서</SelectItem>
                <SelectItem value="CUSTOM">커스텀 보고서</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input type="date" defaultValue="2026-03-01" />
            </div>
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input type="date" defaultValue="2026-03-15" />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>포함 항목</Label>
            <div className="space-y-2">
              {[
                { id: 'summary', label: '요약 (기간 내 핵심 KPI)', default: true },
                { id: 'sites', label: '사이트 목록 (탐지된 전체 사이트)', default: true },
                { id: 'evidence', label: '채증 현황 (성공/실패 통계)', default: true },
                { id: 'categories', label: '카테고리별 통계', default: true },
                { id: 'trends', label: '월별 추이 데이터', default: false },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox id={item.id} defaultChecked={item.default} />
                  <Label htmlFor={item.id} className="text-sm font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export function ReportsView() {
  const [data, setData] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('_all')
  const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF')

  const columns = useMemo(() => getReportColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      setData(MOCK_REPORTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData =
    typeFilter === '_all'
      ? data
      : data.filter((d) => d.type === typeFilter)

  return (
    <PageContainer
      title="보고서"
      description="정기 보고서 관리 및 내보내기"
      actions={<CreateReportDialog />}
    >
      {/* Schedule Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            자동 생성 스케줄
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span>주간 보고서: 매주 월요일 09:00</span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span>월간 보고서: 매월 1일 09:00</span>
            </div>
            <Switch defaultChecked />
          </div>
          <p className="text-xs text-muted-foreground">
            발송 채널: Slack #reports, admin@gambling-watch.kr
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">전체 유형</SelectItem>
            <SelectItem value="WEEKLY">주간</SelectItem>
            <SelectItem value="MONTHLY">월간</SelectItem>
            <SelectItem value="CUSTOM">커스텀</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">
            보고서 목록을 불러오는 중...
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          enablePagination
        />
      )}

      {/* Export Section */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            데이터 내보내기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">내보내기 형식</Label>
            <div className="flex gap-4">
              {(['PDF', 'EXCEL', 'CSV'] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={fmt}
                    checked={exportFormat === fmt}
                    onChange={() => setExportFormat(fmt)}
                    className="accent-primary"
                  />
                  {fmt === 'EXCEL' ? 'Excel (XLSX)' : fmt}
                </label>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm">기관별 양식</Label>
            <div className="space-y-1.5">
              {[
                '사행산업통합감독위원회 양식',
                '경찰청 사이버수사국 양식',
                '한국마사회 양식',
              ].map((org) => (
                <div key={org} className="flex items-center gap-2">
                  <Checkbox id={org} />
                  <Label htmlFor={org} className="text-sm font-normal">
                    {org}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm">포함 데이터</Label>
            <div className="space-y-1.5">
              {[
                { id: 'exp-summary', label: '요약 (기간 내 핵심 KPI)', default: true },
                { id: 'exp-sites', label: '사이트 목록 (탐지된 전체 사이트)', default: true },
                { id: 'exp-evidence', label: '채증 현황 (성공/실패 통계)', default: true },
                { id: 'exp-categories', label: '카테고리별 통계', default: true },
                { id: 'exp-trends', label: '월별 추이 데이터', default: false },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox id={item.id} defaultChecked={item.default} />
                  <Label htmlFor={item.id} className="text-sm font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() =>
              toast.success('내보내기 시작', {
                description: `${exportFormat} 형식으로 데이터를 내보냅니다.`,
              })
            }
          >
            <Download className="mr-2 size-4" />
            내보내기 실행
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
