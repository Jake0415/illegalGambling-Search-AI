import { Metadata } from 'next'

import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = {
  title: '회원가입 | GambleGuard',
  description: '새 계정을 생성하여 서비스를 시작하세요',
}

export default function SignupPage() {
  return <SignupForm />
}
