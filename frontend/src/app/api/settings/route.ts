import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: FR-API-045 GET /api/system/settings -- 시스템 설정 조회
// Task에서 /api/settings로 매핑 (FR-API-041)
// Phase 3에서 Prisma Setting 모델 + 환경 변수 병합 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 시스템 설정 조회 구현
  // 1. admin 역할 검증 (HTTP 403)
  // 2. PostgreSQL 설정 테이블 전체 조회
  // 3. 카테고리별 그룹화
  // 4. 민감 설정(API 키) 마스킹
  // 5. 환경 변수 + DB 설정 병합

  return apiSuccess({
    settings: [],
  });
}

// PRD: FR-API-046 PATCH /api/system/settings -- 시스템 설정 변경
// Task에서 /api/settings로 매핑 (FR-API-042)
// Phase 3에서 Prisma update + Redis 캐시 무효화 + Slack 알림 구현
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 실제 시스템 설정 변경 구현
    // 1. admin 역할 검증 (HTTP 403)
    // 2. Zod 스키마 검증 (systemSettingSchema)
    // 3. 읽기 전용 설정 변경 시도 차단 (HTTP 422 SETTING_READ_ONLY)
    // 4. Prisma update
    // 5. Redis 캐시 무효화
    // 6. 변경 전후 값 감사 로그 기록
    // 7. 주요 설정 변경 시 Slack 알림

    const settings = body.settings ?? [];

    if (settings.length === 0) {
      return apiError(
        '최소 1개의 설정을 입력해주세요.',
        'VALIDATION_ERROR',
        400,
      );
    }

    return apiSuccess({
      updated: [],
    });
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
