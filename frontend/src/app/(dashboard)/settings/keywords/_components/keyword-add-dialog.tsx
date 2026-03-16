'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KeywordAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { keyword: string; category: string; layer: string }) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KeywordAddDialog({
  open,
  onOpenChange,
  onAdd,
}: KeywordAddDialogProps) {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [layer, setLayer] = useState('')

  const handleSubmit = () => {
    if (!keyword.trim()) {
      toast.error('키워드를 입력해주세요')
      return
    }
    if (keyword.length > 200) {
      toast.error('키워드는 200자 이내로 입력해주세요')
      return
    }
    if (!category) {
      toast.error('카테고리를 선택해주세요')
      return
    }
    if (!layer) {
      toast.error('레이어를 선택해주세요')
      return
    }

    onAdd({ keyword: keyword.trim(), category, layer })
    toast.success(`키워드 "${keyword.trim()}" 이(가) 등록되었습니다`)

    // Reset
    setKeyword('')
    setCategory('')
    setLayer('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setKeyword('')
    setCategory('')
    setLayer('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>키워드 추가</DialogTitle>
          <DialogDescription>
            불법 도박 탐지에 사용할 새 키워드를 등록합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 키워드 입력 */}
          <div className="space-y-2">
            <Label htmlFor="keyword-input">키워드 *</Label>
            <Input
              id="keyword-input"
              placeholder="탐지할 키워드를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              maxLength={200}
            />
            <p className="text-muted-foreground text-xs">
              {keyword.length}/200자
            </p>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label>카테고리 *</Label>
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

          {/* 레이어 선택 */}
          <div className="space-y-2">
            <Label>레이어 *</Label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleSubmit}>등록</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
