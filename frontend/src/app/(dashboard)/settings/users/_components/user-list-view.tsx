'use client'

import { Plus, RotateCcw } from 'lucide-react'
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
import type { UserListItem } from '@/types/api'
import { UserRole } from '@/types/enums'

import { getUserColumns } from './columns'

const roleOptions = [
  { value: '_all', label: '전체 역할' },
  { value: UserRole.SUPER_ADMIN, label: '슈퍼 관리자' },
  { value: UserRole.ADMIN, label: '관리자' },
  { value: UserRole.OPERATOR, label: '운영자' },
  { value: UserRole.INVESTIGATOR, label: '수사관' },
  { value: UserRole.LEGAL, label: '법무' },
]

export function UserListView() {
  const [data, setData] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('_all')

  const columns = useMemo(() => getUserColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (role !== '_all') params.set('role', role)
      params.set('limit', '20')

      const res = await fetch(`/api/settings/users?${params.toString()}`)
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
  }, [search, role])

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
    setRole('_all')
  }

  const hasFilters = search || role !== '_all'

  return (
    <PageContainer
      title="사용자 관리"
      description="사용자 계정 및 역할을 관리합니다."
      actions={
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          사용자 추가
        </Button>
      }
    >
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="이름 또는 이메일 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-[260px]"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((opt) => (
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
