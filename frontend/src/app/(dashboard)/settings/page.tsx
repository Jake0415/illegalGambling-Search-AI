import { Settings, Users, KeyRound, ScrollText } from 'lucide-react'
import Link from 'next/link'

import { PageContainer } from '@/components/common/page-container'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata = {
  title: '시스템 설정 | GambleGuard',
}

const settingsTabs = [
  {
    title: '시스템 설정',
    description: '채증 파이프라인, 프록시, 외부 서비스, 알림, 스토리지 설정을 관리합니다.',
    icon: Settings,
    href: '/settings',
    available: false,
  },
  {
    title: '사용자 관리',
    description: '사용자 계정 및 역할 기반 권한을 관리합니다.',
    icon: Users,
    href: '/settings/users',
    available: true,
  },
  {
    title: '키워드 관리',
    description: '불법 도박 탐지용 키워드를 추가, 수정, 삭제합니다.',
    icon: KeyRound,
    href: '/settings/keywords',
    available: false,
  },
  {
    title: '감사 로그',
    description: '시스템 전체 감사 로그를 조회하여 운영 투명성을 확보합니다.',
    icon: ScrollText,
    href: '/settings/audit-log',
    available: false,
  },
]

export default function SettingsPage() {
  return (
    <PageContainer
      title="시스템 설정"
      description="시스템 전반의 설정을 관리합니다."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const content = (
            <Card
              className={
                tab.available
                  ? 'transition-colors hover:border-primary/50 cursor-pointer'
                  : 'opacity-60'
              }
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {tab.title}
                      {!tab.available && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (준비 중)
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {tab.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )

          if (tab.available) {
            return (
              <Link key={tab.title} href={tab.href}>
                {content}
              </Link>
            )
          }

          return <div key={tab.title}>{content}</div>
        })}
      </div>
    </PageContainer>
  )
}
