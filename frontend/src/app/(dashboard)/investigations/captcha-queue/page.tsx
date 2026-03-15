import type { Metadata } from 'next'

import { CaptchaQueueView } from './_components/captcha-queue-view'

export const metadata: Metadata = {
  title: 'CAPTCHA/OTP 큐 | GambleGuard',
  description: 'CAPTCHA/OTP 수동 개입 대기열 관리',
}

export default function CaptchaQueuePage() {
  return <CaptchaQueueView />
}
