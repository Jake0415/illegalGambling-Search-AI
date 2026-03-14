'use client'

import { Plus, RotateCcw } from 'lucide-react'
import Link from 'next/link'
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
import type { InvestigationListItem } from '@/types/api'
import { InvestigationStatus } from '@/types/enums'

import { getInvestigationColumns } from './columns'

const statusOptions = [
  { value: '_all', label: '전체 상태' },
  { value: InvestigationStatus.QUEUED, label: '대기' },
  { value: InvestigationStatus.IN_PROGRESS, label: '진행 중' },
  { value: InvestigationStatus.STAGE_1_COMPLETE, label: '1단계 완료' },
  { value: InvestigationStatus.STAGE_2_COMPLETE, label: '2단계 완료' },
  { value: InvestigationStatus.STAGE_3_COMPLETE, label: '3단계 완료' },
  { value: InvestigationStatus.COMPLETED, label: '완료' },
  { value: InvestigationStatus.FAILED, label: '실패' },
  { value: InvestigationStatus.CANCELLED, label: '취소' },
]

export function InvestigationListView() {
  const [data, setData] = useState<InvestigationListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('_all')

  const columns = useMemo(() => getInvestigationColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== '_all') params.set('status', status)
      params.set('limit', '20')

      const res = await fetch(`/api/investigations?${params.toString()}`)
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
      title="채증 모니터링"
      description="채증 작업 큐 현황을 모니터링하고 관리합니다."
      actions={
        <Button size="sm" asChild>
          <Link href="/investigations/new">
            <Plus className="mr-2 size-4" />
            채증 시작
          </Link>
        </Button>
      }
    >
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="사이트 ID 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-[260px]"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]">
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
