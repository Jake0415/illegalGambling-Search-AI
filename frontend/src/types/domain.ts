// ============================================================================
// 도메인 엔티티 인터페이스 정의
// PRD 08절 데이터 모델 기반 21개 테이블 대응
// ============================================================================

import type {
  AuditAction,
  ClassificationModel,
  DetectionSource,
  DomainStatus,
  EvidenceFileType,
  HashAlgorithm,
  InterventionStatus,
  InterventionType,
  InvestigationStatus,
  ReviewStatus,
  SiteCategory,
  SiteStatus,
  SmsNumberStatus,
  SmsProvider,
  TimestampType,
  UserRole,
  VerificationStatus,
} from './enums';

// ---------------------------------------------------------------------------
// 공통 필드
// ---------------------------------------------------------------------------

/** 모든 엔티티에 포함되는 기본 감사 필드 */
interface BaseEntity {
  id: string;
  createdAt: Date;
}

/** 생성/수정 감사 필드를 포함하는 엔티티 */
interface MutableEntity extends BaseEntity {
  updatedAt: Date;
}

/** 소프트 삭제를 지원하는 엔티티 */
interface SoftDeletableEntity extends MutableEntity {
  deletedAt: Date | null;
}

// ---------------------------------------------------------------------------
// A. 핵심 엔티티 (Phase 1)
// ---------------------------------------------------------------------------

/** 불법 도박 사이트 기본 정보 */
export interface Site extends SoftDeletableEntity {
  url: string;
  domain: string;
  status: SiteStatus;
  category: SiteCategory | null;
  confidenceScore: number | null;
  firstDetectedAt: Date;
  lastCheckedAt: Date | null;
  tags: string[] | null;
  whoisData: Record<string, unknown> | null;
  dnsRecords: Record<string, unknown> | null;
  notes: string | null;

  // Relations (optional)
  investigations?: Investigation[];
  detectionResults?: DetectionResult[];
  classificationResults?: ClassificationResult[];
  domainHistory?: DomainHistory[];
  popupPatterns?: PopupPattern[];
  siteDomainClusters?: SiteDomainCluster[];
}

/** 채증 세션 (조사 작업 단위) */
export interface Investigation extends MutableEntity {
  siteId: string;
  status: InvestigationStatus;
  currentStage: number;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  scheduledAt: Date | null;
  proxyUsed: string | null;
  browserFingerprint: Record<string, unknown> | null;
  createdById: string | null;

  // Relations (optional)
  site?: Site;
  createdBy?: User | null;
  evidenceFiles?: EvidenceFile[];
  smsNumbers?: SmsNumber[];
  manualInterventions?: ManualInterventionQueue[];
}

/** 증거 파일 메타데이터 */
export interface EvidenceFile extends BaseEntity {
  investigationId: string;
  fileType: EvidenceFileType;
  stage: number;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  sha256Hash: string;
  originalFilename: string | null;
  description: string | null;

  // Relations (optional)
  investigation?: Investigation;
  hashRecords?: HashRecord[];
  timestamps?: Timestamp[];
}

// ---------------------------------------------------------------------------
// B. 증거 무결성 (Phase 1-2)
// ---------------------------------------------------------------------------

/** 해시 검증 이력 */
export interface HashRecord extends BaseEntity {
  evidenceFileId: string;
  algorithm: HashAlgorithm;
  hashValue: string;
  verifiedAt: Date | null;
  verificationStatus: VerificationStatus;

  // Relations (optional)
  evidenceFile?: EvidenceFile;
}

/** 타임스탬프 (OTS / RFC 3161) */
export interface Timestamp extends BaseEntity {
  evidenceFileId: string;
  type: TimestampType;
  timestampValue: Date;
  proofFilePath: string | null;
  verifiedAt: Date | null;
  verificationStatus: VerificationStatus;

  // Relations (optional)
  evidenceFile?: EvidenceFile;
}

/** 감사 로그 (Chain of Custody) */
export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorId: string | null;
  actorIp: string | null;
  details: Record<string, unknown> | null;
  prevHash: string | null;

  // Relations (optional)
  actor?: User | null;
}

// ---------------------------------------------------------------------------
// C. SMS 인증 (Phase 2)
// ---------------------------------------------------------------------------

/** SMS 가상 전화번호 */
export interface SmsNumber extends BaseEntity {
  phoneNumber: string;
  countryCode: string;
  provider: SmsProvider;
  status: SmsNumberStatus;
  investigationId: string | null;
  assignedAt: Date | null;
  expiredAt: Date | null;
  costUsd: number | null;

  // Relations (optional)
  investigation?: Investigation | null;
  smsMessages?: SmsMessage[];
}

/** SMS 수신 메시지 */
export interface SmsMessage extends BaseEntity {
  smsNumberId: string;
  messageText: string;
  otpCode: string | null;
  receivedAt: Date;
  parsedAt: Date | null;

  // Relations (optional)
  smsNumber?: SmsNumber;
}

// ---------------------------------------------------------------------------
// D. CAPTCHA/수동 개입 (Phase 2)
// ---------------------------------------------------------------------------

/** 수동 개입 큐 */
export interface ManualInterventionQueue extends BaseEntity {
  investigationId: string;
  type: InterventionType;
  status: InterventionStatus;
  cdpSessionUrl: string | null;
  screenshotPath: string | null;
  assignedToId: string | null;
  resolvedAt: Date | null;
  resolutionNotes: string | null;

  // Relations (optional)
  investigation?: Investigation;
  assignedTo?: User | null;
}

// ---------------------------------------------------------------------------
// E. 탐지 엔진 (Phase 2-3)
// ---------------------------------------------------------------------------

/** 검색 키워드 */
export interface Keyword extends MutableEntity {
  keyword: string;
  category: string | null;
  isActive: boolean;
  detectionCount: number;
  createdById: string | null;

  // Relations (optional)
  createdBy?: User | null;
  detectionResults?: DetectionResult[];
}

/** 탐지 결과 */
export interface DetectionResult extends BaseEntity {
  siteId: string;
  source: DetectionSource;
  keywordId: string | null;
  rawData: Record<string, unknown> | null;

  // Relations (optional)
  site?: Site;
  keyword?: Keyword | null;
}

/** AI 분류 결과 */
export interface ClassificationResult extends BaseEntity {
  siteId: string;
  model: ClassificationModel;
  category: string | null;
  confidenceScore: number;
  evidence: Record<string, unknown>[] | null;
  reviewStatus: ReviewStatus;
  reviewedById: string | null;
  reviewedAt: Date | null;

  // Relations (optional)
  site?: Site;
  reviewedBy?: User | null;
}

// ---------------------------------------------------------------------------
// F. 도메인 모니터링 (Phase 2)
// ---------------------------------------------------------------------------

/** 도메인 생존 상태 이력 */
export interface DomainHistory extends BaseEntity {
  siteId: string;
  domain: string;
  ipAddress: string | null;
  dnsRecords: Record<string, unknown> | null;
  status: DomainStatus;
  checkedAt: Date;
  responseTimeMs: number | null;
  redirectUrl: string | null;

  // Relations (optional)
  site?: Site;
}

/** 도메인 클러스터 (동일 운영자 그룹) */
export interface DomainCluster extends BaseEntity {
  name: string;
  description: string | null;

  // Relations (optional)
  sites?: SiteDomainCluster[];
}

/** 사이트-클러스터 연결 (N:M 정션 테이블) */
export interface SiteDomainCluster {
  siteId: string;
  clusterId: string;
  createdAt: Date;

  // Relations (optional)
  site?: Site;
  cluster?: DomainCluster;
}

// ---------------------------------------------------------------------------
// G. 사용자 관리 (Phase 1) — NextAuth.js v5 호환
// ---------------------------------------------------------------------------

/** 시스템 사용자 */
export interface User extends MutableEntity {
  name: string | null;
  email: string;
  emailVerified: Date | null;
  passwordHash: string;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;

  // Relations (optional)
  accounts?: Account[];
  sessions?: Session[];
  investigations?: Investigation[];
  auditLogs?: AuditLog[];
  keywords?: Keyword[];
  classificationReviews?: ClassificationResult[];
  assignedInterventions?: ManualInterventionQueue[];
}

/** NextAuth.js Account (OAuth 계정 연동) */
export interface Account extends BaseEntity {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;

  // Relations (optional)
  user?: User;
}

/** NextAuth.js Session */
export interface Session extends BaseEntity {
  sessionToken: string;
  userId: string;
  expires: Date;

  // Relations (optional)
  user?: User;
}

/** NextAuth.js Verification Token */
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// ---------------------------------------------------------------------------
// H. 시스템 설정 (Phase 1)
// ---------------------------------------------------------------------------

/** 시스템 전역 설정 (키-값) */
export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updatedById: string | null;
  updatedAt: Date;

  // Relations (optional)
  updatedBy?: User | null;
}

// ---------------------------------------------------------------------------
// I. 팝업 패턴 (Phase 2)
// ---------------------------------------------------------------------------

/** 사이트별 팝업 패턴 */
export interface PopupPattern extends MutableEntity {
  siteId: string | null;
  patternType: string;
  cssSelector: string;
  closeButtonSelector: string | null;
  isActive: boolean;
  successCount: number;
  failCount: number;

  // Relations (optional)
  site?: Site | null;
}
