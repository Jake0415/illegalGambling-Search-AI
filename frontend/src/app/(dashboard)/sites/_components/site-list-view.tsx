'use client'

import { Plus, Upload, RotateCcw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/common/page-container'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SiteListFilter, SiteListItem } from '@/types/api'
import { SiteCategory, SiteStatus } from '@/types/enums'

import { getSiteColumns } from './columns'

const statusOptions = [
  { value: '_all', label: '전체 상태' },
  { value: SiteStatus.ACTIVE, label: '활성' },
  { value: SiteStatus.INACTIVE, label: '비활성' },
  { value: SiteStatus.CLOSED, label: '폐쇄' },
  { value: SiteStatus.MONITORING, label: '모니터링' },
]

const categoryOptions = [
  { value: '_all', label: '전체 카테고리' },
  { value: SiteCategory.SPORTS_BETTING, label: '스포츠 도박' },
  { value: SiteCategory.HORSE_RACING, label: '경마' },
  { value: SiteCategory.CASINO, label: '카지노' },
  { value: SiteCategory.OTHER_GAMBLING, label: '기타 도박' },
  { value: SiteCategory.NON_GAMBLING, label: '비도박' },
]

export function SiteListView() {
  const [data, setData] = useState<SiteListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('_all')
  const [category, setCategory] = useState('_all')

  const columns = useMemo(() => getSiteColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== '_all') params.set('status', status)
      if (category !== '_all') params.set('category', category)
      params.set('limit', '20')

      const res = await fetch(`/api/sites?${params.toString()}`)
      const json = await res.json()

      if (json.data) {
        setData(json.data)
        setTotal(json.pagination?.total ?? json.data.length)
      }
    } catch {
      // API 호출 실패 시 빈 배열
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, status, category])

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
    setCategory('_all')
  }

  const hasFilters = search || status !== '_all' || category !== '_all'

  return (
    <PageContainer
      title="사이트 관리"
      description="탐지된 불법 도박 사이트 목록을 조회하고 관리합니다."
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href="/sites/import">
              <Upload className="mr-2 size-4" />
              벌크 임포트
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sites/new">
              <Plus className="mr-2 size-4" />
              사이트 등록
            </Link>
          </Button>
        </>
      }
    >
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="URL 또는 도메인 검색..."
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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
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
