import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

type RouteParams = { params: Promise<{ id: string }> };

// PRD: FR-API-023 GET -- 증거 감사 로그 조회 / FR-API-024 POST -- 보고서 생성
// Task에서 FR-API-023으로 매핑
// Phase 3에서 감사 로그 조회 + Claude Sonnet 보고서 생성 구현

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  // TODO: Phase 3 - 증거 감사 로그 조회 구현
  // 1. PostgreSQL 감사 테이블에서 증거 ID로 필터
  // 2. 시간순 정렬
  // 3. 커서 기반 페이지네이션
  // 4. eventType 필터

  return apiSuccess({
    evidenceId: id,
    auditLog: [],
    total: 0,
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // TODO: Phase 3 - 법원 제출용 보고서 생성 구현
    // 1. Claude Sonnet 4.6로 한국어 수사 보고서 본문 자동 생성
    // 2. 스크린샷, 해시값, 타임스탬프 검증 결과 삽입
    // 3. BullMQ 비동기 생성 작업 등록
    // 4. 보고서 템플릿 선택 (수사 착수용, 법원 제출용, 내부 보고용)
    // 5. S3에 PDF 저장

    return apiSuccess(
      {
        reportId: `rpt_${crypto.randomUUID().slice(0, 8)}`,
        evidenceId: id,
        templateId: body.templateId ?? 'default',
        format: body.format ?? 'pdf',
        statusUrl: `/api/reports/rpt_dummy/status`,
        estimatedCompletionAt: new Date(Date.now() + 60000).toISOString(),
      },
      202,
    );
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
