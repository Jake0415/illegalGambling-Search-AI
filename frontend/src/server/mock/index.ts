// ============================================================================
// Mock 모듈 Barrel Export
// ============================================================================

// Data
export {
  mockUsers,
  mockSites,
  mockInvestigations,
  mockEvidenceFiles,
  mockAuditLogs,
  mockKeywords,
  mockClassifications,
  mockDomainHistory,
  mockDashboardSummary,
  mockDetectionStats,
  mockInvestigationStats,
  mockCategoryDistribution,
  mockCostTrends,
} from './data';
export type { CostTrendItem } from './data';

// Services
export {
  mockSiteService,
  mockInvestigationService,
  mockEvidenceService,
  mockUserService,
  mockReviewService,
  mockAnalyticsService,
  mockSettingsService,
} from './services';

// Session
export {
  mockCurrentUser,
  mockCurrentUsers,
  getMockSession,
  MOCK_ROLE_SWITCHER_ENABLED,
} from './session';
