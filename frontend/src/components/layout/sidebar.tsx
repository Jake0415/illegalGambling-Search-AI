'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { navigationItems, type NavGroup, type NavItem } from '@/config/navigation'

// ─── Sidebar context ─────────────────────────────────────────────
interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

// ─── Helpers ─────────────────────────────────────────────────────
function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function isGroupActive(pathname: string, group: NavGroup) {
  if (group.href) return isActive(pathname, group.href)
  return group.children?.some((child) => isActive(pathname, child.href)) ?? false
}

// ─── Single link item (no children) ─────────────────────────────
function SidebarLink({
  item,
  collapsed,
}: {
  item: NavGroup & { href: string }
  collapsed: boolean
}) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="size-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

// ─── Collapsible group (with children) ───────────────────────────
function SidebarGroup({
  group,
  collapsed,
}: {
  group: NavGroup & { children: NavItem[] }
  collapsed: boolean
}) {
  const pathname = usePathname()
  const groupActive = isGroupActive(pathname, group)
  const [open, setOpen] = React.useState(groupActive)
  const Icon = group.icon

  // auto-open when navigating to a child
  React.useEffect(() => {
    if (groupActive) setOpen(true)
  }, [groupActive])

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={group.children[0].href}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md transition-colors',
              groupActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="size-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {group.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
            groupActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="flex-1 truncate text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
        <div className="ml-4 flex flex-col gap-0.5 border-l pl-3 pt-1">
          {group.children.map((child) => {
            const active = isActive(pathname, child.href)
            const ChildIcon = child.icon
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <ChildIcon className="size-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Sidebar provider ────────────────────────────────────────────
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

// ─── Main sidebar component ─────────────────────────────────────
export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'hidden flex-col border-r bg-background transition-[width] duration-300 md:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center border-b px-3">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            GG
          </div>
          {!collapsed && (
            <span className="truncate text-base font-semibold">
              GambleGuard
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-1">
          {navigationItems.map((group) => {
            if (group.children) {
              return (
                <SidebarGroup
                  key={group.label}
                  group={group as NavGroup & { children: NavItem[] }}
                  collapsed={collapsed}
                />
              )
            }
            return (
              <SidebarLink
                key={group.label}
                item={group as NavGroup & { href: string }}
                collapsed={collapsed}
              />
            )
          })}
        </nav>
      </ScrollArea>

      {/* Toggle button */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-full"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
          <span className="sr-only">
            {collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          </span>
        </Button>
      </div>
    </aside>
  )
}

// ─── Mobile sidebar (uses Sheet) ─────────────────────────────────
export function MobileSidebar({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()

  // Close on navigation
  React.useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  return (
    <nav className="flex flex-col gap-1 px-2 py-2">
      {navigationItems.map((group) => {
        if (group.children) {
          return (
            <SidebarGroup
              key={group.label}
              group={group as NavGroup & { children: NavItem[] }}
              collapsed={false}
            />
          )
        }
        return (
          <SidebarLink
            key={group.label}
            item={group as NavGroup & { href: string }}
            collapsed={false}
          />
        )
      })}
    </nav>
  )
}
