import type { Metadata } from 'next'

import { ScheduleManagementView } from './_components/schedule-management-view'

export const metadata: Metadata = {
  title: '자동 채증 스케줄 | GambleGuard',
  description: '주기적 자동 채증 스케줄 관리',
}

export default function SchedulesPage() {
  return <ScheduleManagementView />
}
