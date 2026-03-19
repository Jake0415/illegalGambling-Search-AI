import { NextResponse } from 'next/server'
import { fetchBackend } from '@/server/api/backend-client'

// 슈퍼어드민 존재 여부 확인 (클라이언트 → Next.js → FastAPI 프록시)
export async function GET() {
  try {
    const result = await fetchBackend<{ data: { isSetupComplete: boolean } }>(
      '/auth/setup-status',
    )
    return NextResponse.json(result)
  } catch {
    // 백엔드 연결 실패 시 기본값 반환
    return NextResponse.json({ data: { isSetupComplete: false } })
  }
}
