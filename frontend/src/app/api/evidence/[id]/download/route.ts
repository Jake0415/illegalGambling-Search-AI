import type { NextRequest } from 'next/server';

import { apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-021 GET /api/evidence/:id/download -- 증거 패키지 다운로드 (ZIP)
// Task에서 FR-API-022로 매핑
// Phase 3에서 archiver npm + S3 getObject + 스트리밍 다운로드 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 실제 증거 패키지 다운로드 구현
  // 1. 증거 패키지 존재 확인
  // 2. archiver npm으로 ZIP 스트리밍 생성
  // 3. S3 getObject로 각 파일 가져오기
  // 4. Content-Type: application/zip 헤더 설정
  // 5. Content-Disposition: attachment 헤더 설정
  // 6. 감사 로그 기록 (다운로더 ID, 파일 크기)

  return apiSuccess({
    id,
    downloadUrl: `https://storage.example.com/evidence/${id}/package.zip`,
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    fileSize: 0,
  });
}
