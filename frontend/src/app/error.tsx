'use client'

import { AlertTriangle, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">문제가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || '예상치 못한 오류가 발생했습니다.'}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground/60">
              오류 코드: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCcw className="mr-2 size-4" />
            다시 시도
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
