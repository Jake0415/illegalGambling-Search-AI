'use client'

import { useFormContext } from 'react-hook-form'
import { useMemo } from 'react'

import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import type { SetupWizardFormData } from '../setup-wizard'

/** Password strength calculator */
function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++

  if (score <= 1) return { score, label: '약함', color: 'bg-red-500' }
  if (score <= 2) return { score, label: '보통', color: 'bg-orange-500' }
  if (score <= 3) return { score, label: '양호', color: 'bg-yellow-500' }
  if (score <= 4) return { score, label: '강함', color: 'bg-green-500' }
  return { score, label: '매우 강함', color: 'bg-emerald-500' }
}

export function StepAccount() {
  const form = useFormContext<SetupWizardFormData>()
  const passwordValue = form.watch('account.password')

  const strength = useMemo(
    () => getPasswordStrength(passwordValue || ''),
    [passwordValue]
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          슈퍼어드민 계정 설정
        </h2>
        <p className="text-sm text-muted-foreground">
          시스템 관리자 계정을 생성합니다.
        </p>
      </div>

      <FormField
        control={form.control}
        name="account.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이름</FormLabel>
            <FormControl>
              <Input placeholder="홍길동" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="admin@example.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>부서</FormLabel>
            <FormControl>
              <Input placeholder="정보보안팀" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>연락처</FormLabel>
            <FormControl>
              <Input placeholder="010-1234-5678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="최소 8자, 대소문자+숫자+특수문자"
                {...field}
              />
            </FormControl>
            {passwordValue && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < strength.score
                          ? strength.color
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  비밀번호 강도: {strength.label}
                </p>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.passwordConfirm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호 확인</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
