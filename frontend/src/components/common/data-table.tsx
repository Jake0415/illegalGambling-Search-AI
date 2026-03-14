'use client'

import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** 행 선택 활성화 */
  enableRowSelection?: boolean
  /** 페이지네이션 활성화 (기본 true) */
  enablePagination?: boolean
  /** 서버사이드 페이지네이션 시 총 행 수 */
  totalRows?: number
  /** 서버사이드 페이지네이션 콜백 */
  onPaginationChange?: (pagination: PaginationState) => void
  /** 서버사이드 정렬 콜백 */
  onSortingChange?: (sorting: SortingState) => void
  /** 서버사이드 필터 콜백 */
  onFilterChange?: (filters: ColumnFiltersState) => void
  /** 초기 페이지 크기 (기본 20) */
  initialPageSize?: number
}

// ---------------------------------------------------------------------------
// Selection column helper
// ---------------------------------------------------------------------------

export function getSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

// ---------------------------------------------------------------------------
// Sort header helper
// ---------------------------------------------------------------------------

interface DataTableColumnHeaderProps {
  title: string
  isSorted: false | 'asc' | 'desc'
  onToggle: () => void
}

function DataTableColumnHeader({
  title,
  isSorted,
  onToggle,
}: DataTableColumnHeaderProps) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={onToggle}>
      {title}
      {isSorted === 'asc' ? (
        <ArrowUp className="ml-1 size-3.5" />
      ) : isSorted === 'desc' ? (
        <ArrowDown className="ml-1 size-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 size-3.5" />
      )}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// DataTable component
// ---------------------------------------------------------------------------

function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = false,
  enablePagination = true,
  totalRows,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  initialPageSize = 20,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const isServerSide = !!onPaginationChange

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    // Row count for server-side pagination
    ...(isServerSide && totalRows != null
      ? { rowCount: totalRows, manualPagination: true }
      : {}),
    enableRowSelection,
    onSortingChange: updater => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      onSortingChange?.(next)
    },
    onColumnFiltersChange: updater => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)
      onFilterChange?.(next)
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: updater => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(next)
      onPaginationChange?.(next)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
  })

  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          {/* Row selection info */}
          <div className="text-muted-foreground flex-1 text-sm">
            {enableRowSelection && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length}/
                {table.getFilteredRowModel().rows.length}개 선택됨
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">페이지당 행</p>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={value => {
                  const next = {
                    pageIndex: 0,
                    pageSize: Number(value),
                  }
                  setPagination(next)
                  onPaginationChange?.(next)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={String(pagination.pageSize)} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[20, 50, 100].map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info */}
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {pageCount > 0
                ? `${currentPage + 1} / ${pageCount} 페이지`
                : '0 페이지'}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable, DataTableColumnHeader }
export type { DataTableProps }
