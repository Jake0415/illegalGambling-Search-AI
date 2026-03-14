// ============================================================================
// Mock 감사 로그 데이터 (200건)
// ============================================================================

import type { AuditLog } from '@/types/domain';
import { AuditAction } from '@/types/enums';

interface LogTemplate {
  entityType: string;
  action: AuditAction;
  details: Record<string, unknown> | null;
}

const logTemplates: LogTemplate[] = [
  { entityType: 'User', action: AuditAction.READ, details: { event: 'login', method: 'credentials' } },
  { entityType: 'Site', action: AuditAction.CREATE, details: { source: 'manual' } },
  { entityType: 'Site', action: AuditAction.CREATE, details: { source: 'bulk_import', count: 5 } },
  { entityType: 'Investigation', action: AuditAction.CREATE, details: { mode: 'immediate', scope: 'full' } },
  { entityType: 'Investigation', action: AuditAction.UPDATE, details: { field: 'status', newValue: 'COMPLETED' } },
  { entityType: 'EvidenceFile', action: AuditAction.DOWNLOAD, details: { fileType: 'SCREENSHOT' } },
  { entityType: 'EvidenceFile', action: AuditAction.DOWNLOAD, details: { fileType: 'WARC' } },
  { entityType: 'EvidenceFile', action: AuditAction.VERIFY, details: { result: 'VALID' } },
  { entityType: 'ClassificationResult', action: AuditAction.UPDATE, details: { reviewStatus: 'APPROVED' } },
  { entityType: 'ClassificationResult', action: AuditAction.UPDATE, details: { reviewStatus: 'REJECTED', reason: '카테고리 오분류' } },
  { entityType: 'Site', action: AuditAction.UPDATE, details: { field: 'status', newValue: 'MONITORING' } },
  { entityType: 'Site', action: AuditAction.UPDATE, details: { field: 'category', newValue: 'CASINO' } },
  { entityType: 'User', action: AuditAction.CREATE, details: { role: 'INVESTIGATOR' } },
  { entityType: 'User', action: AuditAction.UPDATE, details: { field: 'isActive', newValue: false } },
  { entityType: 'Keyword', action: AuditAction.CREATE, details: { keyword: '불법토토' } },
  { entityType: 'SystemSetting', action: AuditAction.UPDATE, details: { key: 'max_concurrent_investigations', newValue: 10 } },
  { entityType: 'EvidenceFile', action: AuditAction.EXPORT, details: { format: 'pdf', reportType: 'investigation_summary' } },
  { entityType: 'Site', action: AuditAction.DELETE, details: { reason: '중복 등록' } },
  { entityType: 'Investigation', action: AuditAction.UPDATE, details: { field: 'status', newValue: 'CANCELLED' } },
  { entityType: 'Site', action: AuditAction.READ, details: { event: 'detail_view' } },
];

const actorIds = ['user-001', 'user-002', 'user-004', 'user-005', 'user-006', 'user-007', 'user-009'];
const actorIps = ['192.168.1.10', '192.168.1.20', '10.0.0.50', '10.0.0.51', '172.16.0.100', '172.16.0.101', '192.168.2.30'];
const entityIds = [
  'site-001', 'site-002', 'site-003', 'site-004', 'site-005',
  'site-007', 'site-009', 'site-010', 'site-013', 'site-016',
  'inv-001', 'inv-002', 'inv-003', 'inv-005', 'inv-006',
  'evi-001', 'evi-005', 'evi-010', 'evi-015', 'evi-020',
  'user-004', 'user-006', 'user-008',
  'kw-001', 'kw-005', 'kw-010',
  'cls-001', 'cls-005', 'cls-010',
  'setting-001',
];

function prevHashGen(idx: number): string {
  const hex = '0123456789abcdef';
  let result = '';
  let s = idx * 31337;
  for (let i = 0; i < 64; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    result += hex[s % 16];
  }
  return result;
}

const auditItems: AuditLog[] = [];

for (let i = 0; i < 200; i++) {
  const tpl = logTemplates[i % logTemplates.length];
  const dateOffset = Math.floor(i / 10); // ~20 dates
  const hourOffset = i % 10;
  const timestamp = new Date(2026, 2, 14 - dateOffset, 8 + hourOffset, (i * 3) % 60, 0);

  auditItems.push({
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    entityType: tpl.entityType,
    entityId: entityIds[i % entityIds.length],
    action: tpl.action,
    actorId: actorIds[i % actorIds.length],
    actorIp: actorIps[i % actorIps.length],
    details: tpl.details,
    prevHash: i === 0 ? null : prevHashGen(i),
    createdAt: timestamp,
  });
}

export const mockAuditLogs: AuditLog[] = auditItems;
