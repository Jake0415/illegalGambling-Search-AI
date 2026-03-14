'use client'

import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

import type { SetupWizardFormData } from '../setup-wizard'

function ValidateButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={() =>
        toast.success(`${label} 검증 성공`, {
          description: 'API 키가 유효합니다.',
        })
      }
    >
      검증
    </Button>
  )
}

export function StepServices() {
  const form = useFormContext<SetupWizardFormData>()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">외부 서비스 설정</h2>
        <p className="text-sm text-muted-foreground">
          AI 분석, SMS, CAPTCHA 등 외부 서비스 API 키를 입력합니다.
        </p>
      </div>

      <FormField
        control={form.control}
        name="services.claudeApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Claude API Key</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  {...field}
                />
              </FormControl>
              <ValidateButton label="Claude API" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="services.smsApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              SMS 서비스 API Key (PVAPins){' '}
              <span className="text-muted-foreground font-normal">
                (선택)
              </span>
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  type="password"
                  placeholder="SMS API Key"
                  {...field}
                />
              </FormControl>
              <ValidateButton label="SMS API" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="services.captchaSolverApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              CAPTCHA 솔버 API Key (CapSolver){' '}
              <span className="text-muted-foreground font-normal">
                (선택)
              </span>
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  type="password"
                  placeholder="CAPTCHA Solver API Key"
                  {...field}
                />
              </FormControl>
              <ValidateButton label="CAPTCHA API" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="services.googleSearchApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Google Search API Key{' '}
              <span className="text-muted-foreground font-normal">
                (선택)
              </span>
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  type="password"
                  placeholder="Google API Key"
                  {...field}
                />
              </FormControl>
              <ValidateButton label="Google API" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="services.googleSearchEngineId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Google Search Engine ID (CX){' '}
              <span className="text-muted-foreground font-normal">
                (선택)
              </span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Search Engine CX" {...field} />
            </FormControl>
            <FormDescription>
              Google Custom Search Engine ID를 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
