import type { Metadata } from 'next'

import { InvestigationStatsView } from './_components/investigation-stats-view'

export const metadata: Metadata = {
  title: '채증 통계 | GambleGuard',
  description: '채증(증거 수집) 통계 대시보드',
}

export default function InvestigationStatsPage() {
  return <InvestigationStatsView />
}
