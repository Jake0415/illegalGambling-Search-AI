import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Color / label mappings per enum type
// ---------------------------------------------------------------------------

type BadgeColor =
  | 'green'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'gray'
  | 'purple'
  | 'orange'

const colorClasses: Record<BadgeColor, string> = {
  green:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  yellow:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
  purple:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  orange:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
}

interface StatusConfig {
  label: string
  color: BadgeColor
}

// --- SiteStatus ---
const siteStatusMap: Record<string, StatusConfig> = {
  ACTIVE: { label: '활성', color: 'green' },
  INACTIVE: { label: '비활성', color: 'gray' },
  CLOSED: { label: '폐쇄', color: 'red' },
  MONITORING: { label: '모니터링', color: 'blue' },
}

// --- InvestigationStatus ---
const investigationStatusMap: Record<string, StatusConfig> = {
  QUEUED: { label: '대기', color: 'gray' },
  IN_PROGRESS: { label: '진행 중', color: 'blue' },
  STAGE_1_COMPLETE: { label: '1단계 완료', color: 'purple' },
  STAGE_2_COMPLETE: { label: '2단계 완료', color: 'purple' },
  STAGE_3_COMPLETE: { label: '3단계 완료', color: 'purple' },
  COMPLETED: { label: '완료', color: 'green' },
  FAILED: { label: '실패', color: 'red' },
  CANCELLED: { label: '취소', color: 'gray' },
}

// --- VerificationStatus ---
const verificationStatusMap: Record<string, StatusConfig> = {
  PENDING: { label: '대기', color: 'yellow' },
  VALID: { label: '유효', color: 'green' },
  INVALID: { label: '무효', color: 'red' },
}

// --- ReviewStatus ---
const reviewStatusMap: Record<string, StatusConfig> = {
  PENDING: { label: '대기', color: 'yellow' },
  APPROVED: { label: '승인', color: 'green' },
  REJECTED: { label: '반려', color: 'red' },
  MODIFIED: { label: '수정됨', color: 'blue' },
}

// --- DomainStatus ---
const domainStatusMap: Record<string, StatusConfig> = {
  ALIVE: { label: '활성', color: 'green' },
  DEAD: { label: '비활성', color: 'red' },
  REDIRECT: { label: '리다이렉트', color: 'yellow' },
}

// --- SmsNumberStatus ---
const smsNumberStatusMap: Record<string, StatusConfig> = {
  ACTIVE: { label: '활성', color: 'green' },
  USED: { label: '사용됨', color: 'gray' },
  EXPIRED: { label: '만료', color: 'yellow' },
  BLOCKED: { label: '차단', color: 'red' },
}

// --- InterventionStatus ---
const interventionStatusMap: Record<string, StatusConfig> = {
  PENDING: { label: '대기', color: 'yellow' },
  IN_PROGRESS: { label: '진행 중', color: 'blue' },
  RESOLVED: { label: '해결', color: 'green' },
  EXPIRED: { label: '만료', color: 'gray' },
}

// ---------------------------------------------------------------------------
// Unified map
// ---------------------------------------------------------------------------

const statusMaps: Record<StatusBadgeType, Record<string, StatusConfig>> = {
  site: siteStatusMap,
  investigation: investigationStatusMap,
  verification: verificationStatusMap,
  review: reviewStatusMap,
  domain: domainStatusMap,
  smsNumber: smsNumberStatusMap,
  intervention: interventionStatusMap,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type StatusBadgeType =
  | 'site'
  | 'investigation'
  | 'verification'
  | 'review'
  | 'domain'
  | 'smsNumber'
  | 'intervention'

interface StatusBadgeProps {
  type: StatusBadgeType
  value: string
  className?: string
}

function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const config = statusMaps[type]?.[value]

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {value}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(colorClasses[config.color], className)}
    >
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeType, StatusBadgeProps }
