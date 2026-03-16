'use client'

import { Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MockSchedule } from '@/server/mock/data/schedules'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScheduleType = MockSchedule['scheduleType']

interface ScheduleFormData {
  name: string
  scheduleType: ScheduleType
  startTime: string
  endTime: string
  cronExpression: string
  intervalHours: number
  weekdays: boolean[]
  targetType: 'all' | 'category' | 'risk_score' | 'manual'
  targetCategory: string
  targetRiskScore: number
  scope: number
  maxConcurrent: number
}

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: MockSchedule | null
  onSave: (data: ScheduleFormData) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function getDefaultFormData(): ScheduleFormData {
  return {
    name: '',
    scheduleType: 'DAILY',
    startTime: '02:00',
    endTime: '',
    cronExpression: '',
    intervalHours: 6,
    weekdays: [false, false, false, false, false, false, false],
    targetType: 'all',
    targetCategory: '',
    targetRiskScore: 80,
    scope: 1,
    maxConcurrent: 5,
  }
}

function fromSchedule(s: MockSchedule): ScheduleFormData {
  return {
    name: s.name,
    scheduleType: s.scheduleType,
    startTime: s.startTime ?? '',
    endTime: s.endTime ?? '',
    cronExpression: s.cronExpression ?? '',
    intervalHours: 6,
    weekdays: [false, false, false, false, false, false, false],
    targetType: s.targetFilter.type as ScheduleFormData['targetType'],
    targetCategory: (s.targetFilter.category as string) ?? '',
    targetRiskScore: (s.targetFilter.minRiskScore as number) ?? 80,
    scope: s.scope,
    maxConcurrent: s.maxConcurrent,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave,
}: ScheduleFormDialogProps) {
  const [form, setForm] = useState<ScheduleFormData>(getDefaultFormData())

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm(fromSchedule(initialData))
      } else {
        setForm(getDefaultFormData())
      }
    }
  }, [open, mode, initialData])

  function update<K extends keyof ScheduleFormData>(
    key: K,
    value: ScheduleFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleWeekday(index: number) {
    setForm((prev) => {
      const next = [...prev.weekdays]
      next[index] = !next[index]
      return { ...prev, weekdays: next }
    })
  }

  function handleSave() {
    if (!form.name.trim()) return
    onSave(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5" />
            {mode === 'create' ? '스케줄 추가' : '스케줄 편집'}
          </DialogTitle>
          <DialogDescription>
            자동 채증 스케줄을 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="sched-name">스케줄 이름 *</Label>
            <Input
              id="sched-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="예: 매일 새벽 전체 사이트 채증"
            />
          </div>

          {/* Schedule type */}
          <div className="space-y-1.5">
            <Label>스케줄 유형</Label>
            <Select
              value={form.scheduleType}
              onValueChange={(v) => update('scheduleType', v as ScheduleType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONCE">1회 예약</SelectItem>
                <SelectItem value="DAILY">매일</SelectItem>
                <SelectItem value="WEEKLY">매주</SelectItem>
                <SelectItem value="HOURLY">매 N시간</SelectItem>
                <SelectItem value="CRON">크론 표현식</SelectItem>
                <SelectItem value="CONTINUOUS">항시 검증</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields */}
          {(form.scheduleType === 'DAILY' || form.scheduleType === 'ONCE') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-time">시작 시간</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time">종료 시간 (선택)</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => update('endTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.scheduleType === 'WEEKLY' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>요일 선택</Label>
                <div className="flex gap-1.5">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(i)}
                      className={`flex size-9 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                        form.weekdays[i]
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weekly-time">실행 시간</Label>
                <Input
                  id="weekly-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.scheduleType === 'HOURLY' && (
            <div className="space-y-1.5">
              <Label htmlFor="interval">반복 주기 (시간)</Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={24}
                value={form.intervalHours}
                onChange={(e) =>
                  update('intervalHours', Number(e.target.value))
                }
              />
            </div>
          )}

          {form.scheduleType === 'CRON' && (
            <div className="space-y-1.5">
              <Label htmlFor="cron-expr">크론 표현식</Label>
              <Input
                id="cron-expr"
                value={form.cronExpression}
                onChange={(e) => update('cronExpression', e.target.value)}
                placeholder="0 2 * * *"
                className="font-mono"
              />
            </div>
          )}

          {/* Target filter */}
          <div className="space-y-2">
            <Label>대상 필터</Label>
            <RadioGroup
              value={form.targetType}
              onValueChange={(v) =>
                update('targetType', v as ScheduleFormData['targetType'])
              }
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="target-all" />
                <Label htmlFor="target-all" className="font-normal">
                  전체 활성 사이트
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="category" id="target-cat" />
                <Label htmlFor="target-cat" className="font-normal">
                  특정 카테고리
                </Label>
              </div>
              {form.targetType === 'category' && (
                <div className="ml-6">
                  <Select
                    value={form.targetCategory}
                    onValueChange={(v) => update('targetCategory', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casino">카지노</SelectItem>
                      <SelectItem value="sports">스포츠 도박</SelectItem>
                      <SelectItem value="lottery">복권/로또</SelectItem>
                      <SelectItem value="poker">포커</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <RadioGroupItem value="risk_score" id="target-risk" />
                <Label htmlFor="target-risk" className="font-normal">
                  위험도 N 이상
                </Label>
              </div>
              {form.targetType === 'risk_score' && (
                <div className="ml-6">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.targetRiskScore}
                    onChange={(e) =>
                      update('targetRiskScore', Number(e.target.value))
                    }
                    className="w-32"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="target-manual" />
                <Label htmlFor="target-manual" className="font-normal">
                  수동 선택
                </Label>
              </div>
              {form.targetType === 'manual' && (
                <div className="ml-6">
                  <p className="text-sm text-muted-foreground">
                    0개 사이트 선택됨
                  </p>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <Label>채증 범위</Label>
            <Select
              value={String(form.scope)}
              onValueChange={(v) => update('scope', Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1단계</SelectItem>
                <SelectItem value="2">1~2단계</SelectItem>
                <SelectItem value="3">전체(1~3단계)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max concurrent */}
          <div className="space-y-1.5">
            <Label htmlFor="max-conc">최대 동시 실행 수</Label>
            <Input
              id="max-conc"
              type="number"
              min={1}
              max={20}
              value={form.maxConcurrent}
              onChange={(e) =>
                update('maxConcurrent', Number(e.target.value))
              }
              className="w-32"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {mode === 'create' ? '저장' : '수정'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
