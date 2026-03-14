import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">
          페이지를 찾을 수 없습니다
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
