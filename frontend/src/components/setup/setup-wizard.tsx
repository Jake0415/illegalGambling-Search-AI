'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { StepAccount } from './steps/step-account'
import { StepDatabase } from './steps/step-database'
import { StepServices } from './steps/step-services'
import { StepConfig } from './steps/step-config'
import { StepComplete } from './steps/step-complete'

// ============================================================================
// Form Schema — combines all wizard steps
// ============================================================================

const setupWizardSchema = z.object({
  account: z.object({
    name: z.string().min(1, '이름을 입력해주세요.').max(100),
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식이 아닙니다.'),
    department: z.string().optional(),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        '비밀번호는 영문 대소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
      ),
    passwordConfirm: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  }),
  database: z.object({
    databaseUrl: z
      .string()
      .min(1, '데이터베이스 URL을 입력해주세요.')
      .startsWith('postgresql://', 'PostgreSQL URL 형식이어야 합니다.'),
    redisUrl: z.string().optional(),
  }),
  services: z.object({
    claudeApiKey: z.string().min(1, 'Claude API 키를 입력해주세요.'),
    smsApiKey: z.string().optional(),
    captchaSolverApiKey: z.string().optional(),
    googleSearchApiKey: z.string().optional(),
    googleSearchEngineId: z.string().optional(),
  }),
  config: z.object({
    maxConcurrentBrowsers: z.number().int().min(1).max(20),
    proxyHost: z.string().optional(),
    proxyPort: z.number().int().optional(),
    proxyUsername: z.string().optional(),
    proxyPassword: z.string().optional(),
    dailyCostLimit: z.number().min(0).optional(),
    monthlyCostLimit: z.number().min(0).optional(),
  }),
})

export type SetupWizardFormData = z.infer<typeof setupWizardSchema>

// ============================================================================
// Steps config
// ============================================================================

const STEPS = [
  { id: 'account', label: '계정 설정', component: StepAccount },
  { id: 'database', label: '데이터베이스', component: StepDatabase },
  { id: 'services', label: '외부 서비스', component: StepServices },
  { id: 'config', label: '시스템 설정', component: StepConfig },
  { id: 'complete', label: '설정 확인', component: StepComplete },
] as const

// ============================================================================
// SetupWizard component
// ============================================================================

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<SetupWizardFormData>({
    resolver: zodResolver(setupWizardSchema),
    defaultValues: {
      account: { name: '', email: '', department: '', phone: '', password: '', passwordConfirm: '' },
      database: { databaseUrl: '', redisUrl: '' },
      services: {
        claudeApiKey: '',
        smsApiKey: '',
        captchaSolverApiKey: '',
        googleSearchApiKey: '',
        googleSearchEngineId: '',
      },
      config: {
        maxConcurrentBrowsers: 5,
        proxyHost: '',
        proxyPort: undefined,
        proxyUsername: '',
        proxyPassword: '',
        dailyCostLimit: undefined,
        monthlyCostLimit: undefined,
      },
    },
    mode: 'onTouched',
  })

  const StepComponent = STEPS[currentStep].component
  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  function handleNext() {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav aria-label="설정 단계">
        <ol className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`hidden text-xs sm:inline ${
                  index === currentStep
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-px w-6 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form card */}
      <Card>
        <CardContent className="pt-6">
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <StepComponent />

              {/* Navigation buttons */}
              {currentStep < STEPS.length - 1 && (
                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    이전
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    다음
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
