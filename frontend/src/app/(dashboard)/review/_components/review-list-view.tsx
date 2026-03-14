'use client'

import { RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClassificationReviewItem } from '@/types/api'
import { ReviewStatus } from '@/types/enums'

import { getReviewColumns } from './columns'

const statusOptions = [
  { value: '_all', label: '전체 상태' },
  { value: ReviewStatus.PENDING, label: '대기' },
  { value: ReviewStatus.APPROVED, label: '승인' },
  { value: ReviewStatus.REJECTED, label: '반려' },
  { value: ReviewStatus.MODIFIED, label: '수정됨' },
]

export function ReviewListView() {
  const [data, setData] = useState<ClassificationReviewItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('_all')

  const columns = useMemo(() => getReviewColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== '_all') params.set('reviewStatus', status)
      params.set('limit', '20')

      const res = await fetch(`/api/review?${params.toString()}`)
      const json = await res.json()

      if (json.data) {
        setData(json.data)
        setTotal(json.pagination?.total ?? json.data.length)
      }
    } catch {
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleReset = () => {
    setSearchInput('')
    setSearch('')
    setStatus('_all')
  }

  const hasFilters = search || status !== '_all'

  return (
    <PageContainer
      title="AI 분류 검토"
      description="AI 분류 결과를 수동으로 검토하고 승인/반려합니다."
    >
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="사이트 URL 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-[260px]"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 size-3.5" />
            초기화
          </Button>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          enableRowSelection
          enablePagination
          totalRows={total}
        />
      )}
    </PageContainer>
  )
}
