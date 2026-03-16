'use client'

import * as React from 'react'
import {
  Sidebar,
  SidebarProvider,
  MobileSidebar,
} from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <AuthGuard>
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile sidebar (Sheet overlay) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">내비게이션 메뉴</SheetTitle>
            <div className="flex h-14 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                  GG
                </div>
                <span className="text-base font-semibold">GambleGuard</span>
              </div>
            </div>
            <MobileSidebar
              onOpenChange={setMobileOpen}
            />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <DashboardHeader
            onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
          />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    </AuthGuard>
  )
}
