import type { Metadata } from 'next'

import { LandingView } from './_components/landing-view'

export const metadata: Metadata = {
  title: 'GambleGuard - 불법 도박 사이트 자동 채증 시스템',
  description:
    'AI 기반 불법 도박 사이트 자동 검색, 3단계 채증, 블록체인 타임스탬프 증거 무결성 보장',
}

export default function LandingPage() {
  return <LandingView />
}
