import type { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/server/api/response';

// PRD: 초기 설정 위저드 (Setup Wizard)
// Phase 3에서 실제 DB/서비스 연결 및 관리자 계정 생성 구현
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Phase 3 - 초기 설정 위저드 구현
    // 1. Step 1: 관리자 계정 생성 (setupWizardStep1Schema)
    // 2. Step 2: 데이터베이스 연결 확인 (setupWizardStep2Schema)
    // 3. Step 3: 외부 서비스 API 키 저장 (setupWizardStep3Schema)
    // 4. Step 4: 스토리지 설정 (setupWizardStep4Schema)
    // 5. Step 5: 채증 파이프라인 설정 (setupWizardStep5Schema)

    if (!body.step) {
      return apiError('설정 단계를 지정해주세요.', 'VALIDATION_ERROR', 400);
    }

    return apiSuccess({
      step: body.step,
      status: 'completed',
      message: '설정이 완료되었습니다.',
    }, 201);
  } catch {
    return apiError('잘못된 요청입니다.', 'BAD_REQUEST', 400);
  }
}
