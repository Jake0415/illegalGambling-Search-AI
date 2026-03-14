import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      {/* Logo + product name */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          GG
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold leading-tight">GambleGuard</span>
          <span className="text-xs text-muted-foreground">
            불법 도박 사이트 탐지 시스템
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈으로 돌아가기
        </Link>
      </p>
    </div>
  )
}
