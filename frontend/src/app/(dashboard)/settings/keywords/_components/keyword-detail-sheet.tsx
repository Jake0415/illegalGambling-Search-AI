'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ExternalLink,
  Sparkles,
  RefreshCw,
  Power,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Keyword } from '@/types/domain'
import { mockKeywordVariants } from '@/server/mock/data/keyword-variants'

import { layerConfig, categoryConfig } from './keyword-columns'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KeywordDetailSheetProps {
  keyword: Keyword | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ---------------------------------------------------------------------------
// 주간 트렌드 mock 데이터 생성
// ---------------------------------------------------------------------------

function generateWeeklyTrend(keywordId: string) {
  const seed = parseInt(keywordId.replace('kw-', ''), 10)
  return Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1
    const base = seed * 3 + 10
    const detection = Math.max(1, base + Math.floor(Math.sin(seed + i) * 15))
    return {
      week: `W${weekNum}`,
      탐지수: detection,
    }
  })
}

// ---------------------------------------------------------------------------
// 파생 키워드 mock 생성
// ---------------------------------------------------------------------------

function generateChildKeywords(keyword: string) {
  const suffixes = ['사이트', '추천', '순위']
  return suffixes.map((suffix, i) => ({
    id: `child-${i}`,
    keyword: `${keyword}${suffix}`,
    detectionCount: Math.floor(Math.random() * 100 + 20),
    precision: Math.random() * 0.4 + 0.5,
  }))
}

// ---------------------------------------------------------------------------
// 최근 탐지 사이트 mock 생성
// ---------------------------------------------------------------------------

function generateRecentSites() {
  const domains = [
    'bet-safe99.com',
    'toto-king.net',
    'casino-vip.org',
    'play-slot.kr',
    'mega-bet.io',
  ]
  return domains.map((domain, i) => ({
    id: `site-${200 + i}`,
    domain,
    detectedAt: new Date(2026, 2, 15 - i),
    confidenceScore: Math.random() * 0.3 + 0.65,
  }))
}

// ---------------------------------------------------------------------------
// Source 라벨
// ---------------------------------------------------------------------------

const sourceLabels: Record<string, string> = {
  MANUAL: '수동 등록',
  AI_GENERATED: 'AI 생성',
  META_EXTRACTED: '메타 추출',
  AUTOCOMPLETE: '자동완성',
  COMMUNITY_MENTION: '커뮤니티',
}

// ---------------------------------------------------------------------------
// Variant type 라벨
// ---------------------------------------------------------------------------

const variantTypeLabels: Record<string, string> = {
  CHOSUNG: '초성',
  TYPO: '오타',
  MIXED_LANG: '혼합어',
  CHAR_REPLACE: '문자치환',
  MORPHEME: '형태소',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KeywordDetailSheet({
  keyword,
  open,
  onOpenChange,
}: KeywordDetailSheetProps) {
  const weeklyData = useMemo(
    () => (keyword ? generateWeeklyTrend(keyword.id) : []),
    [keyword]
  )

  const childKeywords = useMemo(
    () => (keyword ? generateChildKeywords(keyword.keyword) : []),
    [keyword]
  )

  const recentSites = useMemo(() => generateRecentSites(), [])

  const variants = useMemo(
    () =>
      keyword
        ? mockKeywordVariants.filter((v) => v.keywordId === keyword.id)
        : [],
    [keyword]
  )

  if (!keyword) return null

  const layer = layerConfig[keyword.layer] ?? { label: keyword.layer, className: '' }
  const cat = keyword.category
    ? categoryConfig[keyword.category] ?? { label: keyword.category, className: '' }
    : null
  const precisionPct = keyword.precision != null ? Math.round(keyword.precision * 100) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg">{keyword.keyword}</SheetTitle>
          <SheetDescription>키워드 상세 정보 및 성과 분석</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">기본 정보</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={layer.className}>
                  {layer.label}
                </Badge>
                {cat && (
                  <Badge variant="outline" className={cat.className}>
                    {cat.label}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">출처</span>
                  <p className="font-medium">
                    {sourceLabels[keyword.source] ?? keyword.source}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">등록자</span>
                  <p className="font-medium">{keyword.createdById ?? '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">생성일</span>
                  <p className="font-medium">
                    {keyword.createdAt.toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">수정일</span>
                  <p className="font-medium">
                    {keyword.updatedAt.toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 탐지 성과 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">탐지 성과</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-muted-foreground text-xs">총 탐지</p>
                    <p className="text-xl font-bold">
                      {keyword.detectionCount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-muted-foreground text-xs">7일 탐지</p>
                    <p className="text-xl font-bold">
                      {Math.floor(
                        (parseInt(keyword.id.replace('kw-', ''), 10) * 7 + 3) %
                          21
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-muted-foreground text-xs">정밀도</p>
                    <p className="text-xl font-bold">
                      {precisionPct != null ? `${precisionPct}%` : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-muted-foreground text-xs">탐지당 비용</p>
                    <p className="text-xl font-bold">
                      ${keyword.costPerDetection?.toFixed(3) ?? '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            {/* 주간 트렌드 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">주간 트렌드 (12주)</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="탐지수"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <Separator />

            {/* 파생 키워드 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">파생 키워드</h3>
              <div className="space-y-2">
                {childKeywords.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <span className="font-medium">{child.keyword}</span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{child.detectionCount}건</span>
                      <span>{Math.round(child.precision * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* 한국어 변형 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">
                한국어 변형 ({variants.length}개)
              </h3>
              {variants.length > 0 ? (
                <div className="space-y-2">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{v.variantText}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {variantTypeLabels[v.variantType] ?? v.variantType}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {v.detectionCount}건
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  등록된 변형이 없습니다
                </p>
              )}
            </section>

            <Separator />

            {/* 최근 탐지 사이트 */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">최근 탐지 사이트</h3>
              <div className="space-y-2">
                {recentSites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="size-3 text-muted-foreground" />
                      <span>{site.domain}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{Math.round(site.confidenceScore * 100)}%</span>
                      <span>{site.detectedAt.toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* 액션 버튼 */}
            <section className="flex flex-wrap gap-2 pb-4">
              <Button size="sm" variant="outline">
                <Sparkles className="mr-1.5 size-3.5" />
                유사 키워드 추가 생성
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="mr-1.5 size-3.5" />
                변형 재생성
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                <Power className="mr-1.5 size-3.5" />
                비활성화
              </Button>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
