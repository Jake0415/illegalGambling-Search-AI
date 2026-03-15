'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type Period = '7d' | '30d' | '90d' | '1y'

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
}

const periodOptions: { value: Period; label: string }[] = [
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
  { value: '1y', label: '1년' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'h-8 px-3 text-sm',
            value === option.value && 'shadow-sm'
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
