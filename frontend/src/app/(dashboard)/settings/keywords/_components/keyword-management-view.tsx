'use client'

import {
  Hash,
  Radar,
  AlertTriangle,
  Sparkles,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/common/page-container'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { mockKeywords } from '@/server/mock/data/keywords'
import { mockKeywordCandidates } from '@/server/mock/data/keyword-variants'
import type { Keyword, KeywordLayer } from '@/types/domain'

import { getKeywordColumns } from './keyword-columns'
import { KeywordAddDialog } from './keyword-add-dialog'
import { KeywordAiDialog } from './keyword-ai-dialog'
import { KeywordDetailSheet } from './keyword-detail-sheet'

// ---------------------------------------------------------------------------
// Layer 분배 (mock 데이터에 다양한 layer 부여)
// ---------------------------------------------------------------------------

const layerAssignments: KeywordLayer[] = [
  'DIRECT', 'DIRECT', 'BAIT', 'DIRECT', 'DIRECT',
  'DIRECT', 'VERIFICATION', 'COMMUNITY', 'BAIT', 'VERIFICATION',
  'COMMUNITY', 'SEASONAL', 'DIRECT', 'DIRECT', 'BAIT',
  'DIRECT', 'DIRECT', 'BAIT', 'DIRECT', 'VERIFICATION',
  'DIRECT', 'COMMUNITY', 'SEASONAL', 'DIRECT', 'BAIT',
  'VERIFICATION', 'DIRECT', 'DIRECT', 'COMMUNITY', 'DIRECT',
  'DIRECT', 'BAIT', 'DIRECT', 'VERIFICATION', 'DIRECT',
  'DIRECT', 'COMMUNITY', 'SEASONAL', 'DIRECT', 'BAIT',
  'DIRECT', 'DIRECT', 'VERIFICATION', 'BAIT', 'COMMUNITY',
  'DIRECT', 'DIRECT', 'SEASONAL', 'BAIT', 'DIRECT',
]

// ---------------------------------------------------------------------------
// 초기 데이터 (layer 다양화 적용)
// ---------------------------------------------------------------------------

function getInitialKeywords(): Keyword[] {
  return mockKeywords.map((kw, i) => ({
    ...kw,
    layer: layerAssignments[i] ?? 'DIRECT',
  }))
}

// ---------------------------------------------------------------------------
// Layer / Category 필터 옵션
// ---------------------------------------------------------------------------

const layerOptions = [
  { value: '_all', label: '전체' },
  { value: 'DIRECT', label: '직접' },
  { value: 'BAIT', label: '미끼' },
  { value: 'VERIFICATION', label: '검증' },
  { value: 'COMMUNITY', label: '커뮤니티' },
  { value: 'SEASONAL', label: '시즌' },
]

const categoryOptions = [
  { value: '_all', label: '전체' },
  { value: '스포츠베팅', label: '스포츠베팅' },
  { value: '카지노', label: '카지노' },
  { value: '경마', label: '경마' },
  { value: '기타도박', label: '기타도박' },
]

const statusOptions = [
  { value: '_all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KeywordManagementView() {
  const [keywords, setKeywords] = useState<Keyword[]>(getInitialKeywords)

  // 필터 상태
  const [layerFilter, setLayerFilter] = useState('_all')
  const [categoryFilter, setCategoryFilter] = useState('_all')
  const [statusFilter, setStatusFilter] = useState('_all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // 다이얼로그 / 시트 상태
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)

  // 검색 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ---------------------------------------------------------------------------
  // 필터링된 데이터
  // ---------------------------------------------------------------------------

  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      if (layerFilter !== '_all' && kw.layer !== layerFilter) return false
      if (categoryFilter !== '_all' && kw.category !== categoryFilter) return false
      if (statusFilter === 'active' && !kw.isActive) return false
      if (statusFilter === 'inactive' && kw.isActive) return false
      if (search && !kw.keyword.includes(search)) return false
      return true
    })
  }, [keywords, layerFilter, categoryFilter, statusFilter, search])

  // ---------------------------------------------------------------------------
  // KPI 수치
  // ---------------------------------------------------------------------------

  const kpis = useMemo(() => {
    const activeCount = keywords.filter((k) => k.isActive).length
    const monthlyDetections = keywords.reduce(
      (sum, k) => sum + Math.floor(k.detectionCount * 0.15),
      0
    )
    const pendingReview = mockKeywordCandidates.filter(
      (c) => c.status === 'PENDING'
    ).length
    const aiCandidates = mockKeywordCandidates.length

    return [
      {
        title: '활성 키워드 수',
        value: `${activeCount}개`,
        subtitle: `전체 ${keywords.length}개 중`,
        icon: Hash,
      },
      {
        title: '이번 달 탐지',
        value: `${monthlyDetections.toLocaleString()}건`,
        subtitle: '전월 대비 +12%',
        icon: Radar,
      },
      {
        title: '검토 필요',
        value: `${pendingReview}건`,
        subtitle: '승인 대기 키워드',
        icon: AlertTriangle,
      },
      {
        title: 'AI 후보',
        value: `${aiCandidates}건`,
        subtitle: '자동 추천 키워드',
        icon: Sparkles,
      },
    ]
  }, [keywords])

  // ---------------------------------------------------------------------------
  // 핸들러
  // ---------------------------------------------------------------------------

  const handleView = useCallback((kw: Keyword) => {
    setSelectedKeyword(kw)
    setSheetOpen(true)
  }, [])

  const handleEdit = useCallback((kw: Keyword) => {
    toast.info(`"${kw.keyword}" 편집 기능은 준비 중입니다`)
  }, [])

  const handleDelete = useCallback((kw: Keyword) => {
    setKeywords((prev) => prev.filter((k) => k.id !== kw.id))
    toast.success(`"${kw.keyword}" 키워드가 삭제되었습니다`)
  }, [])

  const handleToggleActive = useCallback((kw: Keyword) => {
    setKeywords((prev) =>
      prev.map((k) =>
        k.id === kw.id ? { ...k, isActive: !k.isActive } : k
      )
    )
    toast.success(
      `"${kw.keyword}" ${kw.isActive ? '비활성화' : '활성화'}되었습니다`
    )
  }, [])

  const handleAddKeyword = useCallback(
    (data: { keyword: string; category: string; layer: string }) => {
      const newKeyword: Keyword = {
        id: `kw-${String(keywords.length + 1).padStart(3, '0')}`,
        keyword: data.keyword,
        category: data.category,
        isActive: true,
        detectionCount: 0,
        createdById: 'user-001',
        layer: data.layer as KeywordLayer,
        baitSubtype: null,
        precision: null,
        truePositiveCount: 0,
        falsePositiveCount: 0,
        lastUsedAt: null,
        apiCallCount: 0,
        costPerDetection: null,
        parentKeywordId: null,
        source: 'MANUAL',
        effectivenessTag: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setKeywords((prev) => [newKeyword, ...prev])
    },
    [keywords.length]
  )

  const handleAiRegister = useCallback(
    (items: { keyword: string; layer: string; category: string }[]) => {
      const newKeywords = items.map((item, i) => ({
        id: `kw-${String(keywords.length + 1 + i).padStart(3, '0')}`,
        keyword: item.keyword,
        category: item.category,
        isActive: true,
        detectionCount: 0,
        createdById: 'user-001',
        layer: item.layer as KeywordLayer,
        baitSubtype: null,
        precision: null,
        truePositiveCount: 0,
        falsePositiveCount: 0,
        lastUsedAt: null,
        apiCallCount: 0,
        costPerDetection: null,
        parentKeywordId: null,
        source: 'AI_GENERATED' as const,
        effectivenessTag: 'NEW' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      setKeywords((prev) => [...newKeywords, ...prev])
    },
    [keywords.length]
  )

  const handleReset = () => {
    setLayerFilter('_all')
    setCategoryFilter('_all')
    setStatusFilter('_all')
    setSearchInput('')
    setSearch('')
  }

  const hasFilters =
    layerFilter !== '_all' ||
    categoryFilter !== '_all' ||
    statusFilter !== '_all' ||
    search

  // ---------------------------------------------------------------------------
  // 컬럼 정의
  // ---------------------------------------------------------------------------

  const columns = useMemo(
    () =>
      getKeywordColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleActive: handleToggleActive,
      }),
    [handleView, handleEdit, handleDelete, handleToggleActive]
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <PageContainer
        title="키워드 관리"
        description="불법 도박 사이트 탐지용 키워드를 관리하고 모니터링합니다"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiDialogOpen(true)}
            >
              <Sparkles className="mr-2 size-4" />
              AI 생성
            </Button>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              키워드 추가
            </Button>
          </>
        }
      >
        {/* KPI 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {kpi.title}
                  </CardTitle>
                  <kpi.icon className="text-muted-foreground size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {kpi.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layer 탭 필터 */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-sm font-medium">
              레이어
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={layerFilter}
              onValueChange={(v) => v && setLayerFilter(v)}
            >
              {layerOptions.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Category 탭 필터 */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-sm font-medium">
              카테고리
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={categoryFilter}
              onValueChange={(v) => v && setCategoryFilter(v)}
            >
              {categoryOptions.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* 필터 바 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              placeholder="키워드 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-[240px] pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px]">
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
          <span className="text-muted-foreground ml-auto text-sm">
            {filteredKeywords.length}개 키워드
          </span>
        </div>

        {/* 데이터 테이블 */}
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filteredKeywords}
            enablePagination
            initialPageSize={20}
          />
        </div>
      </PageContainer>

      {/* 상세 시트 */}
      <KeywordDetailSheet
        keyword={selectedKeyword}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* 키워드 추가 다이얼로그 */}
      <KeywordAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddKeyword}
      />

      {/* AI 키워드 생성 다이얼로그 */}
      <KeywordAiDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onRegister={handleAiRegister}
      />
    </>
  )
}
