// ============================================================================
// Zod 스키마 기반 폼 유효성 검증
// PRD 07절 API 명세 + 08절 데이터 모델 기반
// ============================================================================

import { z } from 'zod';

import {
  InvestigationStatus,
  SiteCategory,
  SiteStatus,
  SmsProvider,
  UserRole,
} from './enums';

// ============================================================================
// 1. 인증 폼
// ============================================================================

/** 로그인 폼 스키마 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// 2. 사이트 관리 폼
// ============================================================================

/** 사이트 등록 폼 스키마 */
export const createSiteSchema = z.object({
  url: z
    .string()
    .min(1, 'URL을 입력해주세요.')
    .url('올바른 URL 형식이 아닙니다.'),
  memo: z.string().max(1000, '메모는 1000자 이내로 입력해주세요.').optional(),
  source: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20, '태그는 최대 20개까지 가능합니다.').optional(),
});

export type CreateSiteFormData = z.infer<typeof createSiteSchema>;

/** 사이트 수정 폼 스키마 */
export const updateSiteSchema = z.object({
  status: z.enum(
    Object.values(SiteStatus) as [string, ...string[]],
  ).optional(),
  category: z.enum(
    Object.values(SiteCategory) as [string, ...string[]],
  ).optional(),
  memo: z.string().max(1000, '메모는 1000자 이내로 입력해주세요.').optional(),
  confidenceScore: z
    .number()
    .min(0, '신뢰도 점수는 0 이상이어야 합니다.')
    .max(1, '신뢰도 점수는 1 이하여야 합니다.')
    .optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export type UpdateSiteFormData = z.infer<typeof updateSiteSchema>;

/** 벌크 URL 임포트 폼 스키마 */
export const bulkImportSchema = z.object({
  urls: z
    .array(z.string().url('올바른 URL 형식이 아닙니다.'))
    .min(1, '최소 1개의 URL을 입력해주세요.')
    .max(500, 'URL은 최대 500개까지 가능합니다.'),
  source: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export type BulkImportFormData = z.infer<typeof bulkImportSchema>;

// ============================================================================
// 3. 채증 관리 폼
// ============================================================================

/** 채증 작업 생성 폼 스키마 */
export const createInvestigationSchema = z.object({
  siteId: z.string().min(1, '사이트를 선택해주세요.'),
  mode: z.enum(['immediate', 'scheduled']),
  scope: z.enum(['stage1', 'stage1_2', 'full']),
  scheduledAt: z.string().datetime().optional(),
  options: z
    .object({
      proxyCountry: z.string().length(2).optional(),
      captureScreenshots: z.boolean().optional(),
      captureHtml: z.boolean().optional(),
      captureWarc: z.boolean().optional(),
      captureNetworkLog: z.boolean().optional(),
    })
    .optional(),
});

export type CreateInvestigationFormData = z.infer<typeof createInvestigationSchema>;

// ============================================================================
// 4. 사용자 관리 폼
// ============================================================================

/** 사용자 생성 폼 스키마 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자 이내로 입력해주세요.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '비밀번호는 영문 대소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
    ),
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(100, '이름은 100자 이내로 입력해주세요.'),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

/** 사용자 수정 폼 스키마 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(100, '이름은 100자 이내로 입력해주세요.')
    .optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// ============================================================================
// 5. 시스템 설정 폼
// ============================================================================

/** 시스템 설정 변경 폼 스키마 */
export const systemSettingSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1, '설정 키를 입력해주세요.'),
        value: z.unknown(),
      }),
    )
    .min(1, '최소 1개의 설정을 입력해주세요.'),
});

export type SystemSettingFormData = z.infer<typeof systemSettingSchema>;

// ============================================================================
// 6. 초기 설정 마법사 (Setup Wizard)
// ============================================================================

/** Step 1: 관리자 계정 설정 */
export const setupWizardStep1Schema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        '비밀번호는 영문 대소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
      ),
    passwordConfirm: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
    name: z.string().min(1, '이름을 입력해주세요.').max(100),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SetupWizardStep1Data = z.infer<typeof setupWizardStep1Schema>;

/** Step 2: 데이터베이스 연결 설정 */
export const setupWizardStep2Schema = z.object({
  databaseUrl: z
    .string()
    .min(1, '데이터베이스 URL을 입력해주세요.')
    .startsWith('postgresql://', 'PostgreSQL URL 형식이어야 합니다.'),
  redisUrl: z
    .string()
    .min(1, 'Redis URL을 입력해주세요.')
    .startsWith('redis://', 'Redis URL 형식이어야 합니다.'),
});

export type SetupWizardStep2Data = z.infer<typeof setupWizardStep2Schema>;

/** Step 3: 외부 서비스 API 키 설정 */
export const setupWizardStep3Schema = z.object({
  claudeApiKey: z.string().min(1, 'Claude API 키를 입력해주세요.'),
  smsProvider: z.enum(
    Object.values(SmsProvider) as [string, ...string[]],
  ),
  smsApiKey: z.string().min(1, 'SMS API 키를 입력해주세요.'),
  captchaSolverApiKey: z.string().optional(),
  googleSearchApiKey: z.string().optional(),
  googleSearchEngineId: z.string().optional(),
});

export type SetupWizardStep3Data = z.infer<typeof setupWizardStep3Schema>;

/** Step 4: 스토리지 설정 */
export const setupWizardStep4Schema = z.object({
  storageType: z.enum(['s3', 'minio', 'local']),
  s3Endpoint: z.string().url('올바른 URL 형식이 아닙니다.').optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3BucketName: z.string().optional(),
  s3Region: z.string().optional(),
});

export type SetupWizardStep4Data = z.infer<typeof setupWizardStep4Schema>;

/** Step 5: 채증 파이프라인 설정 */
export const setupWizardStep5Schema = z.object({
  maxConcurrentBrowsers: z
    .number()
    .int('정수를 입력해주세요.')
    .min(1, '최소 1개 이상이어야 합니다.')
    .max(20, '최대 20개까지 설정할 수 있습니다.'),
  investigationTimeout: z
    .number()
    .int('정수를 입력해주세요.')
    .min(60, '최소 60초 이상이어야 합니다.')
    .max(1800, '최대 1800초까지 설정할 수 있습니다.'),
  maxRetryCount: z
    .number()
    .int('정수를 입력해주세요.')
    .min(0, '0 이상이어야 합니다.')
    .max(5, '최대 5회까지 설정할 수 있습니다.'),
  defaultScope: z.enum(['stage1', 'stage1_2', 'full']),
  proxyEnabled: z.boolean(),
  proxyCountry: z.string().length(2).optional(),
});

export type SetupWizardStep5Data = z.infer<typeof setupWizardStep5Schema>;

// ============================================================================
// 7. 기타 폼
// ============================================================================

/** 키워드 추가 폼 */
export const createKeywordSchema = z.object({
  keywords: z
    .array(
      z.object({
        keyword: z
          .string()
          .min(1, '키워드를 입력해주세요.')
          .max(200, '키워드는 200자 이내로 입력해주세요.'),
        category: z.string().min(1, '카테고리를 선택해주세요.'),
      }),
    )
    .min(1, '최소 1개의 키워드를 입력해주세요.')
    .max(50, '키워드는 최대 50개까지 가능합니다.'),
  autoSuggest: z.boolean().optional(),
});

export type CreateKeywordFormData = z.infer<typeof createKeywordSchema>;

/** 사이트 삭제 폼 */
export const deleteSiteSchema = z.object({
  reason: z
    .string()
    .min(1, '삭제 사유를 입력해주세요.')
    .max(500, '삭제 사유는 500자 이내로 입력해주세요.'),
});

export type DeleteSiteFormData = z.infer<typeof deleteSiteSchema>;

/** AI 분류 반려 폼 */
export const rejectClassificationSchema = z.object({
  correctedCategory: z.enum(
    Object.values(SiteCategory) as [string, ...string[]],
  ),
  rejectionReason: z
    .string()
    .min(1, '반려 사유를 입력해주세요.')
    .max(500, '반려 사유는 500자 이내로 입력해주세요.'),
});

export type RejectClassificationFormData = z.infer<typeof rejectClassificationSchema>;

/** 수동 개입 완료 폼 */
export const resolveInterventionSchema = z.object({
  result: z.enum(['success', 'failed']),
  notes: z.string().max(500).optional(),
});

export type ResolveInterventionFormData = z.infer<typeof resolveInterventionSchema>;
