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
import type { EvidenceFileItem } from '@/types/api'
import { EvidenceFileType, VerificationStatus } from '@/types/enums'

import { getEvidenceColumns } from './columns'

const integrityOptions = [
  { value: '_all', label: '전체 무결성' },
  { value: VerificationStatus.PENDING, label: '대기' },
  { value: VerificationStatus.VALID, label: '유효' },
  { value: VerificationStatus.INVALID, label: '무효' },
]

const fileTypeOptions = [
  { value: '_all', label: '전체 유형' },
  { value: EvidenceFileType.SCREENSHOT, label: '스크린샷' },
  { value: EvidenceFileType.HTML, label: 'HTML' },
  { value: EvidenceFileType.WARC, label: 'WARC' },
  { value: EvidenceFileType.NETWORK_LOG, label: '네트워크 로그' },
  { value: EvidenceFileType.WHOIS, label: 'WHOIS' },
  { value: EvidenceFileType.METADATA, label: '메타데이터' },
  { value: EvidenceFileType.SINGLEFILE, label: 'SingleFile' },
]

export function EvidenceListView() {
  const [data, setData] = useState<EvidenceFileItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [integrity, setIntegrity] = useState('_all')
  const [fileType, setFileType] = useState('_all')

  const columns = useMemo(() => getEvidenceColumns(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (integrity !== '_all') params.set('integrityStatus', integrity)
      if (fileType !== '_all') params.set('fileType', fileType)
      params.set('limit', '20')

      const res = await fetch(`/api/evidence?${params.toString()}`)
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
  }, [search, integrity, fileType])

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
    setIntegrity('_all')
    setFileType('_all')
  }

  const hasFilters = search || integrity !== '_all' || fileType !== '_all'

  return (
    <PageContainer
      title="증거 관리"
      description="증거 패키지 목록을 조회하고 무결성을 검증합니다."
    >
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="파일명 또는 해시 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-[260px]"
        />
        <Select value={integrity} onValueChange={setIntegrity}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {integrityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fileTypeOptions.map((opt) => (
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
