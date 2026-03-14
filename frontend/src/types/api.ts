// ============================================================================
// API 공통 타입 및 엔드포인트별 요청/응답 DTO
// PRD 07절 API 명세 기반
// ============================================================================

import type {
  AuditAction,
  ClassificationModel,
  DetectionSource,
  DomainStatus,
  EvidenceFileType,
  InterventionStatus,
  InterventionType,
  InvestigationStatus,
  ReviewStatus,
  SiteCategory,
  SiteStatus,
  SmsNumberStatus,
  SmsProvider,
  UserRole,
  VerificationStatus,
} from './enums';

// ============================================================================
// 1. 공통 응답 래퍼
// ============================================================================

/** API 메타데이터 */
export interface ApiMeta {
  requestId: string;
  timestamp: string;
  cached?: boolean;
  cacheExpiresAt?: string;
}

/** 단건 성공 응답 */
export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

/** 에러 상세 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  received?: unknown;
}

/** 에러 응답 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
    timestamp: string;
  };
}

/** 커서 기반 페이지네이션 정보 */
export interface CursorPagination {
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

/** 목록 응답 (커서 기반 페이지네이션) */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: CursorPagination;
  meta: ApiMeta;
}

/** 페이지네이션 요청 파라미터 */
export interface PaginatedRequest {
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ============================================================================
// 2. 인증 API (Section A)
// ============================================================================

/** POST /api/auth/login 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/auth/login 응답 데이터 */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

/** GET /api/auth/me 응답 데이터 */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  permissions: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

// ============================================================================
// 3. 사이트 관리 API (Section B)
// ============================================================================

/** POST /api/sites 요청 */
export interface CreateSiteRequest {
  url: string;
  memo?: string;
  source?: string;
  tags?: string[];
}

/** PATCH /api/sites/:id 요청 */
export interface UpdateSiteRequest {
  status?: SiteStatus;
  category?: SiteCategory;
  memo?: string;
  confidenceScore?: number;
  tags?: string[];
}

/** DELETE /api/sites/:id 요청 */
export interface DeleteSiteRequest {
  reason: string;
}

/** POST /api/sites/bulk 요청 */
export interface BulkImportSitesRequest {
  urls: string[];
  source?: string;
  tags?: string[];
}

/** 벌크 처리 결과 항목 */
export interface BulkImportResultItem {
  url: string;
  status: 'created' | 'duplicate' | 'invalid';
  siteId?: string;
  error?: string;
}

/** POST /api/sites/bulk 응답 데이터 */
export interface BulkImportSitesResponseData {
  totalProcessed: number;
  created: number;
  duplicates: number;
  errors: number;
  results: BulkImportResultItem[];
}

/** 사이트 목록 조회 필터 */
export interface SiteListFilter extends PaginatedRequest {
  status?: SiteStatus;
  category?: SiteCategory;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/** 사이트 목록 항목 */
export interface SiteListItem {
  id: string;
  url: string;
  domain: string;
  status: SiteStatus;
  category: SiteCategory | null;
  confidenceScore: number | null;
  source: string | null;
  lastCheckedAt: string | null;
  investigationCount: number;
  createdAt: string;
}

/** 사이트 상세 조회 응답 데이터 */
export interface SiteDetailData {
  id: string;
  url: string;
  domain: string;
  status: SiteStatus;
  category: SiteCategory | null;
  confidenceScore: number | null;
  firstDetectedAt: string;
  lastCheckedAt: string | null;
  tags: string[] | null;
  whoisData: Record<string, unknown> | null;
  dnsRecords: Record<string, unknown> | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ============================================================================
// 4. 채증 API (Section C)
// ============================================================================

/** 채증 실행 모드 */
export type InvestigationMode = 'immediate' | 'scheduled';

/** 채증 범위 */
export type InvestigationScope = 'stage1' | 'stage1_2' | 'full';

/** POST /api/investigations 요청 */
export interface CreateInvestigationRequest {
  siteId: string;
  mode: InvestigationMode;
  scope: InvestigationScope;
  scheduledAt?: string;
  options?: {
    proxyCountry?: string;
    captureScreenshots?: boolean;
    captureHtml?: boolean;
    captureWarc?: boolean;
    captureNetworkLog?: boolean;
  };
}

/** 채증 목록 필터 */
export interface InvestigationListFilter extends PaginatedRequest {
  status?: InvestigationStatus;
  siteId?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/** 채증 단계별 상태 */
export interface InvestigationStageDetail {
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  filesCollected: number;
  errors: string[];
}

/** 채증 목록 항목 */
export interface InvestigationListItem {
  id: string;
  siteId: string;
  status: InvestigationStatus;
  mode: InvestigationMode;
  scope: InvestigationScope;
  currentStage: number | null;
  progress: number;
  retryCount: number;
  createdBy: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

/** 채증 상세 조회 응답 데이터 */
export interface InvestigationDetailData extends InvestigationListItem {
  stages: {
    stage1: InvestigationStageDetail;
    stage2: InvestigationStageDetail;
    stage3: InvestigationStageDetail;
  };
  proxyInfo: {
    ip: string;
    country: string;
    provider: string;
  } | null;
  queuePosition: number | null;
  estimatedStartAt: string | null;
}

/** POST /api/investigations/:id/retry 요청 */
export interface RetryInvestigationRequest {
  retryMode: 'full' | 'from_failed_stage';
}

/** 큐 상태 조회 응답 */
export interface InvestigationQueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  throughput: number;
  avgProcessingTime: number;
  recentFailures: Array<{
    id: string;
    siteId: string;
    error: string;
    failedAt: string;
  }>;
}

// ============================================================================
// 5. 증거 관리 API (Section D)
// ============================================================================

/** 증거 파일 항목 */
export interface EvidenceFileItem {
  id: string;
  fileName: string;
  fileType: EvidenceFileType;
  fileSize: number;
  sha256Hash: string;
  integrityStatus: VerificationStatus;
  downloadUrl: string;
  createdAt: string;
}

/** 증거 패키지 상세 */
export interface EvidenceDetailData {
  id: string;
  investigationId: string;
  files: EvidenceFileItem[];
  integrityStatus: 'VERIFIED' | 'PARTIAL' | 'TAMPERED';
  lastVerifiedAt: string | null;
  chainOfCustody: AuditLogItem[];
}

/** 해시 검증 상세 */
export interface HashVerificationDetail {
  fileName: string;
  expectedHash: string;
  actualHash: string;
  status: 'MATCH' | 'MISMATCH';
}

/** 무결성 검증 결과 */
export interface VerifyEvidenceResponseData {
  evidenceId: string;
  overallStatus: 'VERIFIED' | 'PARTIAL' | 'TAMPERED';
  verifiedAt: string;
  verifiedBy: string;
  hashVerification: {
    status: 'PASSED' | 'FAILED';
    totalFiles: number;
    verifiedFiles: number;
    failedFiles: number;
    details: HashVerificationDetail[];
  };
  openTimestamps: {
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    blockHeight?: number;
    blockTimestamp?: string;
    confirmations?: number;
  } | null;
  rfc3161: {
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    tsaServer?: string;
    genTime?: string;
    serialNumber?: string;
  } | null;
}

/** 보고서 생성 요청 */
export interface CreateReportRequest {
  templateId?: string;
  format?: 'pdf';
  language?: string;
}

/** 보고서 생성 응답 */
export interface CreateReportResponseData {
  reportId: string;
  statusUrl: string;
  estimatedCompletionAt: string;
}

// ============================================================================
// 6. 탐지 엔진 API (Section E)
// ============================================================================

/** POST /api/detection/scan 요청 */
export interface DetectionScanRequest {
  keywordSetId?: string;
  keywords?: string[];
  maxResults?: number;
}

/** 탐지 스캔 응답 */
export interface DetectionScanResponseData {
  scanId: string;
  statusUrl: string;
}

/** 탐지 결과 목록 필터 */
export interface DetectionResultFilter extends PaginatedRequest {
  scanId?: string;
  source?: DetectionSource;
  category?: SiteCategory;
  minConfidence?: number;
  maxConfidence?: number;
  processingStatus?: 'pending' | 'confirmed' | 'rejected';
}

/** 탐지 결과 항목 */
export interface DetectionResultItem {
  id: string;
  url: string;
  category: SiteCategory | null;
  confidence: number | null;
  riskScore: number | null;
  source: DetectionSource;
  processingStatus: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

/** 키워드 목록 필터 */
export interface KeywordListFilter extends PaginatedRequest {
  category?: string;
  search?: string;
  isActive?: boolean;
}

/** 키워드 항목 */
export interface KeywordItem {
  id: string;
  keyword: string;
  category: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  detectionCount: number;
  precision: number | null;
}

/** POST /api/detection/keywords 요청 */
export interface CreateKeywordRequest {
  keywords: Array<{
    keyword: string;
    category: string;
  }>;
  autoSuggest?: boolean;
}

/** 키워드 추가 응답 */
export interface CreateKeywordResponseData {
  created: KeywordItem[];
  duplicates: string[];
  suggestions?: string[];
}

/** 도메인 생존 상태 */
export interface DomainStatusData {
  currentStatus: DomainStatus;
  lastCheckedAt: string;
  upSince: string | null;
  downSince: string | null;
  dnsRecords: Record<string, unknown> | null;
  history?: Array<{
    status: DomainStatus;
    checkedAt: string;
    ipAddress: string | null;
    responseTimeMs: number | null;
  }>;
}

// ============================================================================
// 7. 수동 개입 API (Section F)
// ============================================================================

/** 수동 개입 큐 항목 */
export interface ManualQueueItem {
  id: string;
  type: InterventionType;
  status: InterventionStatus;
  siteUrl: string;
  waitingSince: string;
  timeRemaining: number;
  screenshotUrl: string | null;
  investigationId: string;
}

/** POST /api/manual-queue/:id/resolve 요청 */
export interface ResolveInterventionRequest {
  result: 'success' | 'failed';
  notes?: string;
}

/** CDP 스트리밍 URL 응답 */
export interface CdpStreamData {
  wsUrl: string;
  sessionId: string;
  expiresAt: string;
  browserInfo: {
    viewport: { width: number; height: number };
    userAgent: string;
  };
}

// ============================================================================
// 8. AI 분류 API (Section G)
// ============================================================================

/** 분류 검토 큐 항목 */
export interface ClassificationReviewItem {
  id: string;
  siteId: string;
  siteUrl: string;
  screenshotUrl: string | null;
  aiResult: {
    model: ClassificationModel;
    category: SiteCategory | null;
    confidence: number;
    evidence: Record<string, unknown>[];
  };
  reviewStatus: ReviewStatus;
  createdAt: string;
}

/** POST /api/classification/:id/reject 요청 */
export interface RejectClassificationRequest {
  correctedCategory: SiteCategory;
  rejectionReason: string;
}

// ============================================================================
// 9. 통계/대시보드 API (Section H)
// ============================================================================

/** 대시보드 요약 KPI */
export interface DashboardSummaryData {
  totalSites: number;
  newSites: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  investigations: {
    in_progress: number;
    completed: number;
    failed: number;
    queued: number;
  };
  successRates: {
    stage1: number;
    stage3: number;
  };
  manualQueue: {
    pending: number;
    avgWaitTime: number;
  };
  system: {
    uptime: number;
    lastIncident: string | null;
  };
  externalServices: {
    smsProvider: { status: ServiceHealth; balance: number };
    captchaSolver: { status: ServiceHealth; balance: number };
    proxy: { status: ServiceHealth; activeIPs: number };
  };
}

/** 서비스 상태 레벨 */
export type ServiceHealth = 'healthy' | 'degraded' | 'down';

/** 최근 활동 항목 */
export interface ActivityItem {
  type: string;
  message: string;
  actorId: string | null;
  resourceId: string;
  resourceType: string;
  timestamp: string;
}

/** 통계 기간 파라미터 */
export interface StatsFilter {
  period?: 'daily' | 'weekly' | 'monthly';
  from?: string;
  to?: string;
}

/** 탐지 통계 응답 */
export interface DetectionStatsData {
  period: string;
  data: Array<{
    date: string;
    detectedCount: number;
    bySource: Record<string, number>;
    byCategory: Record<string, number>;
    newVsExisting: { new: number; existing: number };
    precision: number | null;
  }>;
}

/** 채증 통계 응답 */
export interface InvestigationStatsData {
  period: string;
  data: Array<{
    date: string;
    totalInvestigations: number;
    successRateByStage: {
      stage1: number;
      stage2: number;
      stage3: number;
    };
    avgDuration: number;
    failureReasons: Record<string, number>;
    manualInterventionRate: number;
  }>;
}

/** 카테고리별 분포 */
export interface CategoryDistributionData {
  categories: Array<{
    category: SiteCategory | 'UNCLASSIFIED';
    count: number;
    percentage: number;
    trend: number;
  }>;
  unclassifiedCount: number;
}

// ============================================================================
// 10. 시스템 API (Section I)
// ============================================================================

/** 시스템 헬스 체크 응답 */
export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    database: {
      status: ServiceHealth;
      responseTime: number;
      version: string;
    };
    redis: {
      status: ServiceHealth;
      responseTime: number;
      version: string;
      memoryUsage: string;
    };
    queue: {
      status: ServiceHealth;
      activeJobs: number;
      waitingJobs: number;
    };
    storage: {
      status: ServiceHealth;
      responseTime: number;
      provider: string;
      usedSpace: string;
    };
  };
}

/** 외부 서비스 상태 항목 */
export interface ExternalServiceStatus {
  name: string;
  status: ServiceHealth;
  balance: number | null;
  responseTime: number;
  lastCheckedAt: string;
  warning: boolean;
}

/** 감사 로그 항목 */
export interface AuditLogItem {
  id: string;
  eventType: string;
  actorId: string | null;
  actorRole: UserRole | null;
  resourceType: string;
  resourceId: string;
  action: AuditAction;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  timestamp: string;
}

/** 감사 로그 필터 */
export interface AuditLogFilter extends PaginatedRequest {
  eventType?: string;
  actorId?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}

/** 시스템 설정 항목 */
export interface SystemSettingItem {
  key: string;
  value: unknown;
  description: string | null;
  type: string;
  defaultValue: unknown;
  updatedAt: string;
  updatedBy: string | null;
}

/** PATCH /api/system/settings 요청 */
export interface UpdateSystemSettingsRequest {
  settings: Array<{
    key: string;
    value: unknown;
  }>;
}

/** 설정 변경 결과 항목 */
export interface SettingUpdateResult {
  key: string;
  previousValue: unknown;
  newValue: unknown;
  updatedAt: string;
  updatedBy: string;
}

// ============================================================================
// 11. 사용자 관리 API
// ============================================================================

/** POST /api/users 요청 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

/** PATCH /api/users/:id 요청 */
export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

/** 사용자 목록 항목 */
export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ============================================================================
// 12. Webhook/알림 API (Section J)
// ============================================================================

/** 웹훅 이벤트 유형 */
export type WebhookEventType =
  | 'investigation.completed'
  | 'investigation.failed'
  | 'detection.new_site'
  | 'manual_queue.new'
  | 'domain.status_changed'
  | 'system.alert';

/** POST /api/webhooks 요청 */
export interface CreateWebhookRequest {
  url: string;
  events: WebhookEventType[];
}

/** 알림 항목 */
export interface NotificationItem {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  resourceUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

/** 알림 설정 요청 */
export interface UpdateNotificationSettingsRequest {
  channels: {
    slack: boolean;
    webPush: boolean;
    email: boolean;
  };
  eventSettings: Record<string, boolean>;
  frequency: 'immediate' | 'hourly_digest' | 'daily_digest';
}
