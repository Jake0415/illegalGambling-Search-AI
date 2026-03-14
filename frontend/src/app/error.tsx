'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
        <p className="text-muted-foreground mt-2">
          {error.message || '예상치 못한 오류가 발생했습니다'}
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
