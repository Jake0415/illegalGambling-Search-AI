export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      {/* Logo + product name */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          GG
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold leading-tight">GambleGuard</span>
          <span className="text-xs text-muted-foreground">
            초기 설정
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl">{children}</div>
    </div>
  )
}
