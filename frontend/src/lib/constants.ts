// ──────────────────────────────────────
// Pagination
// ──────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// ──────────────────────────────────────
// Evidence Collection Pipeline
// ──────────────────────────────────────
export const MAX_CONCURRENT_BROWSERS = 5
export const INVESTIGATION_TIMEOUT_MS = 300_000 // 5 minutes
export const MAX_RETRY_COUNT = 3

// ──────────────────────────────────────
// AI Classification
// ──────────────────────────────────────
export const LOW_CONFIDENCE_THRESHOLD = 0.7
export const HIGH_CONFIDENCE_THRESHOLD = 0.95

// ──────────────────────────────────────
// SMS
// ──────────────────────────────────────
export const OTP_TIMEOUT_MS = 120_000 // 2 minutes
export const MAX_SMS_DAILY_LIMIT = 100

// ──────────────────────────────────────
// Cost Limits
// ──────────────────────────────────────
export const DEFAULT_DAILY_COST_LIMIT = 50 // USD
export const DEFAULT_MONTHLY_COST_LIMIT = 1000 // USD

// ──────────────────────────────────────
// Role Hierarchy
// ──────────────────────────────────────
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
} as const

export type RoleName = keyof typeof ROLE_HIERARCHY
