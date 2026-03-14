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

export function StepDatabase() {
  const form = useFormContext<SetupWizardFormData>()

  function handleTestConnection(type: 'postgresql' | 'redis') {
    const label = type === 'postgresql' ? 'PostgreSQL' : 'Redis'
    toast.success(`${label} 연결 성공`, {
      description: '데이터베이스에 정상적으로 연결되었습니다.',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">데이터베이스 연결</h2>
        <p className="text-sm text-muted-foreground">
          PostgreSQL 및 Redis 연결 정보를 입력합니다.
        </p>
      </div>

      <FormField
        control={form.control}
        name="database.databaseUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PostgreSQL 연결 문자열</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="postgresql://user:password@localhost:5432/dbname"
                  {...field}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => handleTestConnection('postgresql')}
              >
                연결 테스트
              </Button>
            </div>
            <FormDescription>
              PostgreSQL 데이터베이스 URL을 입력하세요.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="database.redisUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Redis 연결 문자열{' '}
              <span className="text-muted-foreground font-normal">
                (선택)
              </span>
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="redis://localhost:6379"
                  {...field}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => handleTestConnection('redis')}
              >
                연결 테스트
              </Button>
            </div>
            <FormDescription>
              캐시 및 작업 큐에 사용됩니다. 미입력 시 기본값을 사용합니다.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
