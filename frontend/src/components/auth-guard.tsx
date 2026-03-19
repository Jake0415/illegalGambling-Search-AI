'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { checkSetupStatus, isAuthenticated } from '@/lib/mock-auth'

const PUBLIC_PATHS = ['/login', '/signup', '/setup', '/landing']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 공개 경로는 체크 건너뛰기
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      setChecked(true)
      return
    }

    // 백엔드 DB 기반 Setup 상태 확인 (비동기)
    async function verify() {
      const setupDone = await checkSetupStatus()

      if (!setupDone) {
        router.replace('/setup')
        return
      }

      if (!isAuthenticated()) {
        router.replace('/login')
        return
      }

      setChecked(true)
    }

    verify()
  }, [pathname, router])

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
