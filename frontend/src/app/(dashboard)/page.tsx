import type { Metadata } from 'next'

import { DashboardView } from './_components/dashboard-view'

export const metadata: Metadata = {
  title: '대시보드 | GambleGuard',
  description: '시스템 운영 현황 - KPI, 활동 피드, 시스템 상태 모니터링',
}

export default function DashboardPage() {
  return <DashboardView />
}
