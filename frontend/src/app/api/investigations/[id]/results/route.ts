import type { NextRequest } from 'next/server';

import { apiPaginated } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-018 GET /api/investigations/:id/evidence -- 증거 파일 목록
// Task에서 /api/investigations/:id/results로 매핑
// Phase 3에서 Prisma EvidenceFile 모델 + S3 presigned URL 구현
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  await params;

  // TODO: Phase 3 - 실제 채증 결과(증거 파일) 목록 조회 구현
  // 1. 작업 ID로 관련 증거 파일 조회
  // 2. 파일 유형별 필터 (screenshot, html, warc, network_log, metadata)
  // 3. S3 presigned URL 생성
  // 4. 무결성 상태 포함

  return apiPaginated([], 0, 1, 20);
}
