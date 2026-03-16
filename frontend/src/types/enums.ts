// ============================================================================
// Enum 타입 정의
// PRD 08절 데이터 모델 기반 전체 enum 타입
// ============================================================================

// ---------------------------------------------------------------------------
// A. 사용자 역할 (User Role)
// ---------------------------------------------------------------------------
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ---------------------------------------------------------------------------
// B. 사이트 상태 (Site Status)
// ---------------------------------------------------------------------------
export const SiteStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CLOSED: 'CLOSED',
  MONITORING: 'MONITORING',
} as const;

export type SiteStatus = (typeof SiteStatus)[keyof typeof SiteStatus];

// ---------------------------------------------------------------------------
// C. 사이트 카테고리 (Site Category)
// ---------------------------------------------------------------------------
export const SiteCategory = {
  SPORTS_BETTING: 'SPORTS_BETTING',
  HORSE_RACING: 'HORSE_RACING',
  CASINO: 'CASINO',
  OTHER_GAMBLING: 'OTHER_GAMBLING',
  NON_GAMBLING: 'NON_GAMBLING',
} as const;

export type SiteCategory = (typeof SiteCategory)[keyof typeof SiteCategory];

// ---------------------------------------------------------------------------
// D. 채증 상태 (Investigation Status)
// ---------------------------------------------------------------------------
export const InvestigationStatus = {
  QUEUED: 'QUEUED',
  IN_PROGRESS: 'IN_PROGRESS',
  STAGE_1_COMPLETE: 'STAGE_1_COMPLETE',
  STAGE_2_COMPLETE: 'STAGE_2_COMPLETE',
  STAGE_3_COMPLETE: 'STAGE_3_COMPLETE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type InvestigationStatus =
  (typeof InvestigationStatus)[keyof typeof InvestigationStatus];

// ---------------------------------------------------------------------------
// E. 증거 파일 유형 (Evidence File Type)
// ---------------------------------------------------------------------------
export const EvidenceFileType = {
  SCREENSHOT: 'SCREENSHOT',
  HTML: 'HTML',
  WARC: 'WARC',
  NETWORK_LOG: 'NETWORK_LOG',
  WHOIS: 'WHOIS',
  METADATA: 'METADATA',
  SINGLEFILE: 'SINGLEFILE',
} as const;

export type EvidenceFileType =
  (typeof EvidenceFileType)[keyof typeof EvidenceFileType];

// ---------------------------------------------------------------------------
// F. 해시 알고리즘 (Hash Algorithm)
// ---------------------------------------------------------------------------
export const HashAlgorithm = {
  SHA256: 'SHA256',
} as const;

export type HashAlgorithm = (typeof HashAlgorithm)[keyof typeof HashAlgorithm];

// ---------------------------------------------------------------------------
// G. 검증 상태 (Verification Status)
// ---------------------------------------------------------------------------
export const VerificationStatus = {
  PENDING: 'PENDING',
  VALID: 'VALID',
  INVALID: 'INVALID',
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

// ---------------------------------------------------------------------------
// H. 타임스탬프 유형 (Timestamp Type)
// ---------------------------------------------------------------------------
export const TimestampType = {
  OPENTIMESTAMPS: 'OPENTIMESTAMPS',
  RFC3161: 'RFC3161',
} as const;

export type TimestampType =
  (typeof TimestampType)[keyof typeof TimestampType];

// ---------------------------------------------------------------------------
// I. 감사 로그 액션 (Audit Action)
// ---------------------------------------------------------------------------
export const AuditAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  DOWNLOAD: 'DOWNLOAD',
  VERIFY: 'VERIFY',
  EXPORT: 'EXPORT',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ---------------------------------------------------------------------------
// J. SMS 제공자 (SMS Provider)
// ---------------------------------------------------------------------------
export const SmsProvider = {
  PVAPINS: 'PVAPINS',
  GRIZZLYSMS: 'GRIZZLYSMS',
  SMS_ACTIVATE: 'SMS_ACTIVATE',
  MANUAL: 'MANUAL',
} as const;

export type SmsProvider = (typeof SmsProvider)[keyof typeof SmsProvider];

// ---------------------------------------------------------------------------
// K. SMS 번호 상태 (SMS Number Status)
// ---------------------------------------------------------------------------
export const SmsNumberStatus = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  EXPIRED: 'EXPIRED',
  BLOCKED: 'BLOCKED',
} as const;

export type SmsNumberStatus =
  (typeof SmsNumberStatus)[keyof typeof SmsNumberStatus];

// ---------------------------------------------------------------------------
// L. 수동 개입 유형 (Intervention Type)
// ---------------------------------------------------------------------------
export const InterventionType = {
  CAPTCHA: 'CAPTCHA',
  OTP: 'OTP',
  UNKNOWN_FORM: 'UNKNOWN_FORM',
} as const;

export type InterventionType =
  (typeof InterventionType)[keyof typeof InterventionType];

// ---------------------------------------------------------------------------
// M. 수동 개입 상태 (Intervention Status)
// ---------------------------------------------------------------------------
export const InterventionStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  EXPIRED: 'EXPIRED',
} as const;

export type InterventionStatus =
  (typeof InterventionStatus)[keyof typeof InterventionStatus];

// ---------------------------------------------------------------------------
// N. 탐지 출처 (Detection Source)
// ---------------------------------------------------------------------------
export const DetectionSource = {
  GOOGLE_SEARCH: 'GOOGLE_SEARCH',
  CRAWLING: 'CRAWLING',
  COMMUNITY: 'COMMUNITY',
  MANUAL: 'MANUAL',
} as const;

export type DetectionSource =
  (typeof DetectionSource)[keyof typeof DetectionSource];

// ---------------------------------------------------------------------------
// O. 분류 모델 (Classification Model)
// ---------------------------------------------------------------------------
export const ClassificationModel = {
  CLAUDE_HAIKU: 'CLAUDE_HAIKU',
  XGBOOST: 'XGBOOST',
  BERT: 'BERT',
  ENSEMBLE: 'ENSEMBLE',
} as const;

export type ClassificationModel =
  (typeof ClassificationModel)[keyof typeof ClassificationModel];

// ---------------------------------------------------------------------------
// P. 검토 상태 (Review Status)
// ---------------------------------------------------------------------------
export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MODIFIED: 'MODIFIED',
} as const;

export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

// ---------------------------------------------------------------------------
// Q. 도메인 상태 (Domain Status)
// ---------------------------------------------------------------------------
export const DomainStatus = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD',
  REDIRECT: 'REDIRECT',
} as const;

export type DomainStatus = (typeof DomainStatus)[keyof typeof DomainStatus];

// ---------------------------------------------------------------------------
// R. 보고서 유형 (Report Type)
// ---------------------------------------------------------------------------
export const ReportType = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  CUSTOM: 'CUSTOM',
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

// ---------------------------------------------------------------------------
// S. 보고서 형식 (Report Format)
// ---------------------------------------------------------------------------
export const ReportFormat = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
} as const;

export type ReportFormat = (typeof ReportFormat)[keyof typeof ReportFormat];
