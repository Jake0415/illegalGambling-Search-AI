'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader, getSelectionColumn } from '@/components/common/data-table'
import { StatusBadge } from '@/components/common/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { EvidenceFileItem } from '@/types/api'

const fileTypeLabels: Record<string, string> = {
  SCREENSHOT: '스크린샷',
  HTML: 'HTML',
  WARC: 'WARC',
  NETWORK_LOG: '네트워크 로그',
  WHOIS: 'WHOIS',
  METADATA: '메타데이터',
  SINGLEFILE: 'SingleFile',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

export function getEvidenceColumns(): ColumnDef<EvidenceFileItem, unknown>[] {
  return [
    getSelectionColumn<EvidenceFileItem>(),
    {
      accessorKey: 'fileName',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="파일명"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium truncate max-w-[200px] block">
          {row.getValue<string>('fileName')}
        </span>
      ),
    },
    {
      accessorKey: 'fileType',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="타입"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const type = row.getValue<string>('fileType')
        return (
          <span className="text-sm">
            {fileTypeLabels[type] ?? type}
          </span>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'fileSize',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="크기"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatFileSize(row.getValue<number>('fileSize'))}
        </span>
      ),
      size: 90,
    },
    {
      accessorKey: 'sha256Hash',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="SHA-256 해시"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const hash = row.getValue<string>('sha256Hash')
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-mono text-muted-foreground cursor-default">
                {truncateHash(hash)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-none">
              <span className="font-mono text-xs">{hash}</span>
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 180,
    },
    {
      accessorKey: 'integrityStatus',
      header: ({ column }) => (
        <DataTableColumnHeader
          title="무결성"
          isSorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <StatusBadge type="verification" value={row.getValue<string>('integrityStatus')} />
      ),
      size: 100,
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
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.getValue<string>('createdAt')).toLocaleDateString('ko-KR')}
        </span>
      ),
      size: 110,
    },
  ]
}
