'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { isSetupComplete, isAuthenticated } from '@/lib/mock-auth'

const PUBLIC_PATHS = ['/login', '/signup', '/setup', '/landing']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Skip check for public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      setChecked(true)
      return
    }

    // If setup not complete, redirect to setup
    if (!isSetupComplete()) {
      router.replace('/setup')
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }

    setChecked(true)
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
