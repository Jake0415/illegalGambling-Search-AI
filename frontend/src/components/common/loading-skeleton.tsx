import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// TableSkeleton -- 테이블 로딩 상태 (행 5개)
// ---------------------------------------------------------------------------

interface TableSkeletonProps {
  /** 표시할 행 수 (기본 5) */
  rows?: number
  /** 표시할 열 수 (기본 5) */
  columns?: number
}

function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 border-b p-4 last:border-b-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CardSkeleton -- 카드 로딩 상태
// ---------------------------------------------------------------------------

interface CardSkeletonProps {
  /** 카드 내 줄 수 (기본 3) */
  lines?: number
}

function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// PageSkeleton -- 전체 페이지 로딩 상태
// ---------------------------------------------------------------------------

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  )
}

export { TableSkeleton, CardSkeleton, PageSkeleton }
export type { TableSkeletonProps, CardSkeletonProps }
