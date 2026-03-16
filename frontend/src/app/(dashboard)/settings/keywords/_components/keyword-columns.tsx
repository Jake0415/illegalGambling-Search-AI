'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Keyword } from '@/types/domain'

// ---------------------------------------------------------------------------
// Layer 배지 색상 매핑
// ---------------------------------------------------------------------------

const layerConfig: Record<string, { label: string; className: string }> = {
  DIRECT: { label: '직접', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
  BAIT: { label: '미끼', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
  VERIFICATION: { label: '검증', className: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400' },
  COMMUNITY: { label: '커뮤니티', className: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400' },
  SEASONAL: { label: '시즌', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

// ---------------------------------------------------------------------------
// Category 배지 색상 매핑
// ---------------------------------------------------------------------------

const categoryConfig: Record<string, { label: string; className: string }> = {
  '스포츠베팅': { label: '스포츠', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  '카지노': { label: '카지노', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  '경마': { label: '경마', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
  '기타도박': { label: '기타', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' },
}

// ---------------------------------------------------------------------------
// Precision 바 컴포넌트
// ---------------------------------------------------------------------------

function PrecisionBar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">-</span>
  const pct = Math.round(value * 100)
  const color =
    pct >= 60
      ? 'bg-emerald-500'
      : pct >= 30
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums">{pct}%</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Column 정의 생성 함수
// ---------------------------------------------------------------------------

interface KeywordColumnsOptions {
  onView: (keyword: Keyword) => void
  onEdit: (keyword: Keyword) => void
  onDelete: (keyword: Keyword) => void
  onToggleActive: (keyword: Keyword) => void
}

export function getKeywordColumns({
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: KeywordColumnsOptions): ColumnDef<Keyword, unknown>[] {
  return [
    {
      accessorKey: 'keyword',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="키워드"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const kw = row.original
        const childCount = Math.floor(Math.random() * 5)
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{kw.keyword}</span>
            {childCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{childCount}
              </Badge>
            )}
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: 'layer',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="레이어"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const layer = row.getValue<string>('layer')
        const config = layerConfig[layer] ?? { label: layer, className: '' }
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="카테고리"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const cat = row.getValue<string | null>('category')
        if (!cat) return <span className="text-muted-foreground">-</span>
        const config = categoryConfig[cat] ?? { label: cat, className: '' }
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'detectionCount',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="탐지 수"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.getValue<number>('detectionCount').toLocaleString()}
        </span>
      ),
      size: 90,
    },
    {
      id: 'recentDetections7d',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="7일 탐지"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      accessorFn: (row) => {
        // 시드 기반 의사 난수 (키워드 ID 기반 안정적)
        const num = parseInt(row.id.replace('kw-', ''), 10)
        return Math.floor((num * 7 + 3) % 21)
      },
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums">{getValue<number>()}</span>
      ),
      size: 80,
    },
    {
      accessorKey: 'precision',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="정밀도"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <PrecisionBar value={row.getValue<number | null>('precision')} />
      ),
      size: 140,
    },
    {
      accessorKey: 'isActive',
      header: '활성',
      cell: ({ row }) => {
        const kw = row.original
        return (
          <Switch
            size="sm"
            checked={kw.isActive}
            onCheckedChange={() => onToggleActive(kw)}
          />
        )
      },
      size: 60,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const kw = row.original
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onView(kw)}
            >
              <Eye className="mr-1 size-3" />
              상세
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEdit(kw)}
            >
              <Pencil className="mr-1 size-3" />
              편집
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(kw)}
            >
              <Trash2 className="mr-1 size-3" />
              삭제
            </Button>
          </div>
        )
      },
      size: 220,
    },
  ]
}

export { layerConfig, categoryConfig }
