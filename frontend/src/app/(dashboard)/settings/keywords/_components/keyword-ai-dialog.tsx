'use client'

import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { layerConfig } from './keyword-columns'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedKeyword {
  id: string
  keyword: string
  layer: string
  effectiveness: 'high' | 'medium' | 'low'
  selected: boolean
}

interface KeywordAiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (keywords: { keyword: string; layer: string; category: string }[]) => void
}

// ---------------------------------------------------------------------------
// Mock AI 생성 결과
// ---------------------------------------------------------------------------

const mockGeneratedResults: Record<string, GeneratedKeyword[]> = {
  default: [
    { id: 'ai-1', keyword: '무료베팅', layer: 'BAIT', effectiveness: 'high', selected: true },
    { id: 'ai-2', keyword: '보증놀이터', layer: 'VERIFICATION', effectiveness: 'high', selected: true },
    { id: 'ai-3', keyword: '신규가입쿠폰', layer: 'BAIT', effectiveness: 'medium', selected: false },
    { id: 'ai-4', keyword: '배팅노하우', layer: 'COMMUNITY', effectiveness: 'medium', selected: false },
    { id: 'ai-5', keyword: '실시간배당', layer: 'DIRECT', effectiveness: 'high', selected: true },
    { id: 'ai-6', keyword: '월드컵베팅', layer: 'SEASONAL', effectiveness: 'medium', selected: false },
    { id: 'ai-7', keyword: '안전사이트인증', layer: 'VERIFICATION', effectiveness: 'low', selected: false },
    { id: 'ai-8', keyword: '충전보너스', layer: 'BAIT', effectiveness: 'high', selected: true },
  ],
}

// ---------------------------------------------------------------------------
// Effectiveness 표시
// ---------------------------------------------------------------------------

const effectivenessConfig: Record<string, { label: string; color: string }> = {
  high: { label: '높음', color: 'text-emerald-600' },
  medium: { label: '중간', color: 'text-yellow-600' },
  low: { label: '낮음', color: 'text-red-500' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KeywordAiDialog({
  open,
  onOpenChange,
  onRegister,
}: KeywordAiDialogProps) {
  const [seedKeyword, setSeedKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [layer, setLayer] = useState('')
  const [strategies, setStrategies] = useState({
    synonym: true,
    koreanVariant: true,
    baitDiscovery: false,
    trend: false,
  })
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<GeneratedKeyword[]>([])
  const [phase, setPhase] = useState<'input' | 'results'>('input')

  const handleStrategyChange = (key: keyof typeof strategies) => {
    setStrategies((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleGenerate = useCallback(() => {
    if (!seedKeyword.trim()) {
      toast.error('시드 키워드를 입력해주세요')
      return
    }

    setGenerating(true)
    setProgress(0)

    // 2초 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setGenerating(false)
      setResults(mockGeneratedResults.default.map((r) => ({ ...r })))
      setPhase('results')
    }, 2000)
  }, [seedKeyword])

  const toggleResultSelection = (id: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    )
  }

  const selectedCount = results.filter((r) => r.selected).length

  const handleRegister = () => {
    const selected = results.filter((r) => r.selected)
    if (selected.length === 0) {
      toast.error('등록할 키워드를 선택해주세요')
      return
    }

    onRegister(
      selected.map((r) => ({
        keyword: r.keyword,
        layer: r.layer,
        category: category || '스포츠베팅',
      }))
    )

    toast.success(`${selected.length}개 키워드가 등록되었습니다`)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setSeedKeyword('')
    setCategory('')
    setLayer('')
    setStrategies({ synonym: true, koreanVariant: true, baitDiscovery: false, trend: false })
    setResults([])
    setPhase('input')
    setProgress(0)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            AI 키워드 생성
          </DialogTitle>
          <DialogDescription>
            시드 키워드를 기반으로 AI가 관련 키워드를 자동 생성합니다
          </DialogDescription>
        </DialogHeader>

        {phase === 'input' ? (
          <div className="space-y-4 py-4">
            {/* 시드 키워드 */}
            <div className="space-y-2">
              <Label htmlFor="seed-keyword">시드 키워드</Label>
              <Input
                id="seed-keyword"
                placeholder="예: 불법토토"
                value={seedKeyword}
                onChange={(e) => setSeedKeyword(e.target.value)}
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="스포츠베팅">스포츠베팅</SelectItem>
                  <SelectItem value="카지노">카지노</SelectItem>
                  <SelectItem value="경마">경마</SelectItem>
                  <SelectItem value="기타도박">기타도박</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 레이어 */}
            <div className="space-y-2">
              <Label>레이어</Label>
              <Select value={layer} onValueChange={setLayer}>
                <SelectTrigger>
                  <SelectValue placeholder="레이어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECT">직접</SelectItem>
                  <SelectItem value="BAIT">미끼</SelectItem>
                  <SelectItem value="VERIFICATION">검증</SelectItem>
                  <SelectItem value="COMMUNITY">커뮤니티</SelectItem>
                  <SelectItem value="SEASONAL">시즌</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 전략 체크박스 */}
            <div className="space-y-2">
              <Label>생성 전략</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={strategies.synonym}
                    onCheckedChange={() => handleStrategyChange('synonym')}
                  />
                  동의어
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={strategies.koreanVariant}
                    onCheckedChange={() => handleStrategyChange('koreanVariant')}
                  />
                  한국어 변형
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={strategies.baitDiscovery}
                    onCheckedChange={() => handleStrategyChange('baitDiscovery')}
                  />
                  미끼 발견
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={strategies.trend}
                    onCheckedChange={() => handleStrategyChange('trend')}
                  />
                  트렌드
                </label>
              </div>
            </div>

            {/* 생성 진행률 */}
            {generating && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  AI가 키워드를 생성하고 있습니다...
                </p>
                <Progress value={progress} />
              </div>
            )}
          </div>
        ) : (
          /* 결과 목록 */
          <div className="space-y-3 py-4">
            <p className="text-muted-foreground text-sm">
              {results.length}개 키워드가 생성되었습니다. 등록할 항목을
              선택하세요.
            </p>
            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {results.map((r) => {
                const lc = layerConfig[r.layer] ?? {
                  label: r.layer,
                  className: '',
                }
                const eff = effectivenessConfig[r.effectiveness]
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-md border p-2.5"
                  >
                    <Checkbox
                      checked={r.selected}
                      onCheckedChange={() => toggleResultSelection(r.id)}
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.keyword}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${lc.className}`}
                        >
                          {lc.label}
                        </Badge>
                      </div>
                      <span className={`text-xs font-medium ${eff.color}`}>
                        {eff.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          {phase === 'input' ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                <Sparkles className="mr-1.5 size-3.5" />
                AI 키워드 생성
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPhase('input')}>
                다시 생성
              </Button>
              <Button onClick={handleRegister} disabled={selectedCount === 0}>
                {selectedCount}개 선택 항목 등록
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
