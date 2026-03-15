'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormContext } from 'react-hook-form'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import type { SetupWizardFormData } from '../setup-wizard'

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  )
}

function maskValue(value: string | undefined): string {
  if (!value) return '-'
  if (value.length <= 6) return '******'
  return value.slice(0, 3) + '***' + value.slice(-3)
}

export function StepComplete() {
  const form = useFormContext<SetupWizardFormData>()
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const values = form.getValues()

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="size-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          설정이 완료되었습니다
        </h2>
        <p className="text-muted-foreground mb-6">
          GambleGuard 시스템을 사용할 준비가 되었습니다.
        </p>
        <Button
          type="button"
          onClick={() => router.push('/')}
        >
          대시보드로 이동
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">설정 확인</h2>
        <p className="text-sm text-muted-foreground">
          입력한 설정을 확인하고 완료하세요.
        </p>
      </div>

      {/* Account summary */}
      <div>
        <h3 className="text-sm font-medium mb-1">관리자 계정</h3>
        <div className="rounded-md border p-3">
          <SummaryRow label="이름" value={values.account?.name || '-'} />
          <SummaryRow label="이메일" value={values.account?.email || '-'} />
        </div>
      </div>

      <Separator />

      {/* Database summary */}
      <div>
        <h3 className="text-sm font-medium mb-1">데이터베이스</h3>
        <div className="rounded-md border p-3">
          <SummaryRow
            label="PostgreSQL"
            value={maskValue(values.database?.databaseUrl)}
          />
          <SummaryRow
            label="Redis"
            value={maskValue(values.database?.redisUrl)}
          />
        </div>
      </div>

      <Separator />

      {/* Services summary */}
      <div>
        <h3 className="text-sm font-medium mb-1">외부 서비스</h3>
        <div className="rounded-md border p-3">
          <SummaryRow
            label="Claude API"
            value={maskValue(values.services?.claudeApiKey)}
          />
          <SummaryRow
            label="SMS API"
            value={maskValue(values.services?.smsApiKey)}
          />
          <SummaryRow
            label="CAPTCHA API"
            value={maskValue(values.services?.captchaSolverApiKey)}
          />
          <SummaryRow
            label="Google API"
            value={maskValue(values.services?.googleSearchApiKey)}
          />
        </div>
      </div>

      <Separator />

      {/* Config summary */}
      <div>
        <h3 className="text-sm font-medium mb-1">시스템 설정</h3>
        <div className="rounded-md border p-3">
          <SummaryRow
            label="동시 브라우저"
            value={String(values.config?.maxConcurrentBrowsers ?? 5)}
          />
          <SummaryRow
            label="프록시"
            value={
              values.config?.proxyHost
                ? `${values.config.proxyHost}:${values.config.proxyPort || '-'}`
                : '미설정'
            }
          />
          <SummaryRow
            label="일일 비용 한도"
            value={
              values.config?.dailyCostLimit
                ? `$${values.config.dailyCostLimit}`
                : '미설정'
            }
          />
          <SummaryRow
            label="월간 비용 한도"
            value={
              values.config?.monthlyCostLimit
                ? `$${values.config.monthlyCostLimit}`
                : '미설정'
            }
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          className="w-full"
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true)
            try {
              // Phase 3에서 실제 API 연동
              console.log('설정 완료:', values)
              await new Promise((r) => setTimeout(r, 1000))
              toast.success('설정이 저장되었습니다.')
              setIsCompleted(true)
            } catch {
              toast.error('설정 저장에 실패했습니다.')
            } finally {
              setIsSaving(false)
            }
          }}
        >
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          설정 완료
        </Button>
      </div>
    </div>
  )
}
