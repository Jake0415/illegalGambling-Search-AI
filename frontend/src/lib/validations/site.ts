// ============================================================================
// 사이트 관련 Zod 유효성 검증 스키마
// PRD: FR-API-005~010
// ============================================================================

// 기존 forms.ts의 스키마 재활용
export {
  createSiteSchema,
  updateSiteSchema,
  bulkImportSchema,
  deleteSiteSchema,
  type CreateSiteFormData,
  type UpdateSiteFormData,
  type BulkImportFormData,
  type DeleteSiteFormData,
} from '@/types/forms';
