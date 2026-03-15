import type { Metadata } from 'next'

import { ReportsView } from './_components/reports-view'

export const metadata: Metadata = {
  title: '정기 보고서 | GambleGuard',
  description: '정기 보고서 관리 및 내보내기',
}

export default function ReportsPage() {
  return <ReportsView />
}
