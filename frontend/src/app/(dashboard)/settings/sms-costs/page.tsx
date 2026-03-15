import type { Metadata } from 'next'

import { SmsCostsView } from './_components/sms-costs-view'

export const metadata: Metadata = {
  title: 'SMS 비용 대시보드 | GambleGuard',
  description: 'SMS 서비스별 사용량, 비용, 성공률 모니터링',
}

export default function SmsCostsPage() {
  return <SmsCostsView />
}
