'use client'

import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import type { SetupWizardFormData } from '../setup-wizard'

export function StepConfig() {
  const form = useFormContext<SetupWizardFormData>()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">시스템 설정</h2>
        <p className="text-sm text-muted-foreground">
          브라우저 인스턴스, 프록시, 비용 한도를 설정합니다.
        </p>
      </div>

      <FormField
        control={form.control}
        name="config.maxConcurrentBrowsers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>동시 브라우저 인스턴스 수</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={20}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              동시에 실행할 수 있는 브라우저 수 (1~20)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-3">프록시 설정</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="config.proxyHost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>호스트</FormLabel>
                <FormControl>
                  <Input placeholder="proxy.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.proxyPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>포트</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8080"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.proxyUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>사용자명</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.proxyPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-3">비용 한도</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="config.dailyCostLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>일일 비용 한도 (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="50.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.monthlyCostLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>월간 비용 한도 (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="1000.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
