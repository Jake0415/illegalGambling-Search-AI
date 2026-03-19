'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeOffIcon, Info, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  checkSetupStatus,
  isAuthenticated,
  mockLogin,
  getRegisteredUsers,
} from '@/lib/mock-auth'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [setupDone, setSetupDone] = useState(false)
  const [hintEmail, setHintEmail] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched',
  })

  useEffect(() => {
    async function check() {
      // 백엔드 DB에서 슈퍼어드민 존재 여부 확인
      const setupComplete = await checkSetupStatus()
      if (!setupComplete) {
        router.replace('/setup')
        return
      }

      setSetupDone(true)

      // 이미 인증된 상태면 대시보드로 이동
      if (isAuthenticated()) {
        router.replace('/')
        return
      }

      // 등록된 사용자 이메일 힌트 표시
      const users = getRegisteredUsers()
      if (users.length > 0) {
        setHintEmail(users[0].email)
      }
    }
    check()
  }, [router])

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    setServerError(null)
    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500))

      const user = mockLogin(data.email, data.password)
      if (!user) {
        setServerError(
          '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
        )
        return
      }

      router.push('/')
    } catch {
      setServerError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!setupDone) return null

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          로그인
        </CardTitle>
        <CardDescription className="text-center">
          불법 도박 사이트 자동 채증 시스템
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@gambling-watch.kr"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 입력하세요"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={form.watch('rememberMe')}
                  onCheckedChange={(checked) =>
                    form.setValue('rememberMe', checked === true)
                  }
                />
                <Label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-sm font-normal"
                >
                  로그인 상태 유지
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() =>
                  console.log('비밀번호 재설정')
                }
              >
                비밀번호를 잊으셨나요?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              로그인
            </Button>
          </form>
        </Form>

        {hintEmail && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium">데모 계정 안내</p>
                <p className="mt-1">
                  초기 설정에서 등록한 관리자 이메일(
                  <span className="font-mono font-medium">{hintEmail}</span>
                  )과 비밀번호로 로그인하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          계정은 슈퍼관리자가 시스템 설정에서 추가할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  )
}
