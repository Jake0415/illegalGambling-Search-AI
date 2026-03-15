'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface LimitValues {
  dailySmsLimit: number
  dailyCostLimit: number
  monthlySmsLimit: number
  monthlyCostLimit: number
  warningThreshold: number
}

const defaultLimits: LimitValues = {
  dailySmsLimit: 50,
  dailyCostLimit: 30,
  monthlySmsLimit: 1000,
  monthlyCostLimit: 500,
  warningThreshold: 80,
}

export function SmsCostLimitsForm() {
  const [limits, setLimits] = useState<LimitValues>(defaultLimits)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof LimitValues, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setLimits((prev) => ({ ...prev, [field]: num }))
      setSaved(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // Mock save - 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">한도 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 일일 SMS 사용 한도 */}
          <div className="space-y-2">
            <Label htmlFor="dailySmsLimit">일일 SMS 사용 한도 (건)</Label>
            <Input
              id="dailySmsLimit"
              type="number"
              min={0}
              value={limits.dailySmsLimit}
              onChange={(e) => handleChange('dailySmsLimit', e.target.value)}
            />
          </div>

          {/* 일일 비용 한도 */}
          <div className="space-y-2">
            <Label htmlFor="dailyCostLimit">일일 비용 한도 ($)</Label>
            <Input
              id="dailyCostLimit"
              type="number"
              min={0}
              step={0.01}
              value={limits.dailyCostLimit}
              onChange={(e) => handleChange('dailyCostLimit', e.target.value)}
            />
          </div>

          {/* 월간 SMS 사용 한도 */}
          <div className="space-y-2">
            <Label htmlFor="monthlySmsLimit">월간 SMS 사용 한도 (건)</Label>
            <Input
              id="monthlySmsLimit"
              type="number"
              min={0}
              value={limits.monthlySmsLimit}
              onChange={(e) => handleChange('monthlySmsLimit', e.target.value)}
            />
          </div>

          {/* 월간 비용 한도 */}
          <div className="space-y-2">
            <Label htmlFor="monthlyCostLimit">월간 비용 한도 ($)</Label>
            <Input
              id="monthlyCostLimit"
              type="number"
              min={0}
              step={0.01}
              value={limits.monthlyCostLimit}
              onChange={(e) => handleChange('monthlyCostLimit', e.target.value)}
            />
          </div>

          {/* 경고 임계치 */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="warningThreshold">
              경고 임계치 (%) - 한도 도달 전 알림
            </Label>
            <Input
              id="warningThreshold"
              type="number"
              min={0}
              max={100}
              value={limits.warningThreshold}
              onChange={(e) => handleChange('warningThreshold', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              설정이 저장되었습니다
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
