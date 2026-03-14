// ============================================================================
// Mock 채증(조사) 데이터 (50건)
// ============================================================================

import type { Investigation } from '@/types/domain';
import { InvestigationStatus } from '@/types/enums';

function inv(
  id: string,
  siteId: string,
  status: InvestigationStatus,
  currentStage: number,
  opts: Partial<Investigation> = {}
): Investigation {
  const base: Investigation = {
    id,
    siteId,
    status,
    currentStage,
    startedAt: opts.startedAt ?? null,
    completedAt: opts.completedAt ?? null,
    errorMessage: opts.errorMessage ?? null,
    retryCount: opts.retryCount ?? 0,
    scheduledAt: opts.scheduledAt ?? null,
    proxyUsed: opts.proxyUsed ?? null,
    browserFingerprint: opts.browserFingerprint ?? null,
    createdById: opts.createdById ?? 'user-004',
    createdAt: opts.createdAt ?? new Date('2026-03-10T10:00:00Z'),
    updatedAt: opts.updatedAt ?? new Date('2026-03-10T10:00:00Z'),
  };
  return base;
}

export const mockInvestigations: Investigation[] = [
  // Completed investigations
  inv('inv-001', 'site-001', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-10T10:01:00Z'),
    completedAt: new Date('2026-03-10T10:15:00Z'),
    proxyUsed: '103.152.112.5',
    createdById: 'user-004',
    createdAt: new Date('2026-03-10T10:00:00Z'),
    updatedAt: new Date('2026-03-10T10:15:00Z'),
  }),
  inv('inv-002', 'site-002', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-09T14:00:00Z'),
    completedAt: new Date('2026-03-09T14:12:00Z'),
    proxyUsed: '45.77.100.20',
    createdById: 'user-006',
    createdAt: new Date('2026-03-09T13:58:00Z'),
    updatedAt: new Date('2026-03-09T14:12:00Z'),
  }),
  inv('inv-003', 'site-004', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-08T09:00:00Z'),
    completedAt: new Date('2026-03-08T09:18:00Z'),
    proxyUsed: '185.199.228.10',
    createdById: 'user-004',
    createdAt: new Date('2026-03-08T08:55:00Z'),
    updatedAt: new Date('2026-03-08T09:18:00Z'),
  }),
  inv('inv-004', 'site-005', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-07T11:00:00Z'),
    completedAt: new Date('2026-03-07T11:20:00Z'),
    proxyUsed: '103.152.112.8',
    createdById: 'user-006',
    createdAt: new Date('2026-03-07T10:58:00Z'),
    updatedAt: new Date('2026-03-07T11:20:00Z'),
  }),
  inv('inv-005', 'site-007', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-06T15:00:00Z'),
    completedAt: new Date('2026-03-06T15:22:00Z'),
    proxyUsed: '45.77.100.25',
    createdById: 'user-007',
    createdAt: new Date('2026-03-06T14:55:00Z'),
    updatedAt: new Date('2026-03-06T15:22:00Z'),
  }),
  inv('inv-006', 'site-009', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-05T08:00:00Z'),
    completedAt: new Date('2026-03-05T08:14:00Z'),
    proxyUsed: '198.41.200.15',
    createdById: 'user-004',
    createdAt: new Date('2026-03-05T07:58:00Z'),
    updatedAt: new Date('2026-03-05T08:14:00Z'),
  }),
  inv('inv-007', 'site-010', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-04T16:00:00Z'),
    completedAt: new Date('2026-03-04T16:11:00Z'),
    proxyUsed: '103.152.112.12',
    createdById: 'user-006',
    createdAt: new Date('2026-03-04T15:58:00Z'),
    updatedAt: new Date('2026-03-04T16:11:00Z'),
  }),
  inv('inv-008', 'site-013', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-03T10:00:00Z'),
    completedAt: new Date('2026-03-03T10:19:00Z'),
    proxyUsed: '45.77.100.30',
    createdById: 'user-007',
    createdAt: new Date('2026-03-03T09:58:00Z'),
    updatedAt: new Date('2026-03-03T10:19:00Z'),
  }),
  inv('inv-009', 'site-016', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-02T13:00:00Z'),
    completedAt: new Date('2026-03-02T13:16:00Z'),
    proxyUsed: '185.199.228.20',
    createdById: 'user-004',
    createdAt: new Date('2026-03-02T12:58:00Z'),
    updatedAt: new Date('2026-03-02T13:16:00Z'),
  }),
  inv('inv-010', 'site-017', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-01T09:00:00Z'),
    completedAt: new Date('2026-03-01T09:13:00Z'),
    proxyUsed: '103.152.112.15',
    createdById: 'user-006',
    createdAt: new Date('2026-03-01T08:58:00Z'),
    updatedAt: new Date('2026-03-01T09:13:00Z'),
  }),

  // Stage 1 complete
  inv('inv-011', 'site-003', InvestigationStatus.STAGE_1_COMPLETE, 1, {
    startedAt: new Date('2026-03-13T14:00:00Z'),
    proxyUsed: '45.77.100.35',
    createdById: 'user-004',
    createdAt: new Date('2026-03-13T13:58:00Z'),
    updatedAt: new Date('2026-03-13T14:05:00Z'),
  }),
  inv('inv-012', 'site-011', InvestigationStatus.STAGE_1_COMPLETE, 1, {
    startedAt: new Date('2026-03-13T15:00:00Z'),
    proxyUsed: '103.152.112.18',
    createdById: 'user-006',
    createdAt: new Date('2026-03-13T14:58:00Z'),
    updatedAt: new Date('2026-03-13T15:04:00Z'),
  }),

  // Stage 2 complete
  inv('inv-013', 'site-018', InvestigationStatus.STAGE_2_COMPLETE, 2, {
    startedAt: new Date('2026-03-12T10:00:00Z'),
    proxyUsed: '185.199.228.25',
    createdById: 'user-007',
    createdAt: new Date('2026-03-12T09:58:00Z'),
    updatedAt: new Date('2026-03-12T10:12:00Z'),
  }),
  inv('inv-014', 'site-021', InvestigationStatus.STAGE_2_COMPLETE, 2, {
    startedAt: new Date('2026-03-12T11:00:00Z'),
    proxyUsed: '45.77.100.40',
    createdById: 'user-004',
    createdAt: new Date('2026-03-12T10:58:00Z'),
    updatedAt: new Date('2026-03-12T11:10:00Z'),
  }),

  // In progress
  inv('inv-015', 'site-022', InvestigationStatus.IN_PROGRESS, 2, {
    startedAt: new Date('2026-03-14T08:00:00Z'),
    proxyUsed: '103.152.112.22',
    createdById: 'user-006',
    createdAt: new Date('2026-03-14T07:58:00Z'),
    updatedAt: new Date('2026-03-14T08:05:00Z'),
  }),
  inv('inv-016', 'site-024', InvestigationStatus.IN_PROGRESS, 1, {
    startedAt: new Date('2026-03-14T08:30:00Z'),
    proxyUsed: '185.199.228.30',
    createdById: 'user-007',
    createdAt: new Date('2026-03-14T08:28:00Z'),
    updatedAt: new Date('2026-03-14T08:32:00Z'),
  }),
  inv('inv-017', 'site-026', InvestigationStatus.IN_PROGRESS, 1, {
    startedAt: new Date('2026-03-14T09:00:00Z'),
    proxyUsed: '45.77.100.45',
    createdById: 'user-004',
    createdAt: new Date('2026-03-14T08:58:00Z'),
    updatedAt: new Date('2026-03-14T09:02:00Z'),
  }),

  // Queued
  inv('inv-018', 'site-027', InvestigationStatus.QUEUED, 0, {
    createdById: 'user-004',
    createdAt: new Date('2026-03-14T09:10:00Z'),
    updatedAt: new Date('2026-03-14T09:10:00Z'),
  }),
  inv('inv-019', 'site-028', InvestigationStatus.QUEUED, 0, {
    createdById: 'user-006',
    createdAt: new Date('2026-03-14T09:12:00Z'),
    updatedAt: new Date('2026-03-14T09:12:00Z'),
  }),
  inv('inv-020', 'site-030', InvestigationStatus.QUEUED, 0, {
    createdById: 'user-007',
    createdAt: new Date('2026-03-14T09:15:00Z'),
    updatedAt: new Date('2026-03-14T09:15:00Z'),
  }),
  inv('inv-021', 'site-014', InvestigationStatus.QUEUED, 0, {
    scheduledAt: new Date('2026-03-15T00:00:00Z'),
    createdById: 'user-004',
    createdAt: new Date('2026-03-14T09:20:00Z'),
    updatedAt: new Date('2026-03-14T09:20:00Z'),
  }),
  inv('inv-022', 'site-023', InvestigationStatus.QUEUED, 0, {
    scheduledAt: new Date('2026-03-15T02:00:00Z'),
    createdById: 'user-006',
    createdAt: new Date('2026-03-14T09:22:00Z'),
    updatedAt: new Date('2026-03-14T09:22:00Z'),
  }),

  // Failed
  inv('inv-023', 'site-006', InvestigationStatus.FAILED, 1, {
    startedAt: new Date('2026-03-11T10:00:00Z'),
    errorMessage: 'DNS 확인 실패: NXDOMAIN',
    retryCount: 3,
    proxyUsed: '103.152.112.25',
    createdById: 'user-004',
    createdAt: new Date('2026-03-11T09:58:00Z'),
    updatedAt: new Date('2026-03-11T10:05:00Z'),
  }),
  inv('inv-024', 'site-008', InvestigationStatus.FAILED, 0, {
    startedAt: new Date('2026-03-10T15:00:00Z'),
    errorMessage: '연결 시간 초과 (30s)',
    retryCount: 3,
    createdById: 'user-006',
    createdAt: new Date('2026-03-10T14:58:00Z'),
    updatedAt: new Date('2026-03-10T15:02:00Z'),
  }),
  inv('inv-025', 'site-015', InvestigationStatus.FAILED, 2, {
    startedAt: new Date('2026-03-09T08:00:00Z'),
    errorMessage: 'CAPTCHA 풀이 실패',
    retryCount: 2,
    proxyUsed: '45.77.100.50',
    createdById: 'user-007',
    createdAt: new Date('2026-03-09T07:58:00Z'),
    updatedAt: new Date('2026-03-09T08:12:00Z'),
  }),

  // Cancelled
  inv('inv-026', 'site-020', InvestigationStatus.CANCELLED, 0, {
    createdById: 'user-004',
    createdAt: new Date('2026-03-08T14:00:00Z'),
    updatedAt: new Date('2026-03-08T14:05:00Z'),
  }),
  inv('inv-027', 'site-008', InvestigationStatus.CANCELLED, 1, {
    startedAt: new Date('2026-03-07T09:00:00Z'),
    proxyUsed: '185.199.228.35',
    createdById: 'user-006',
    createdAt: new Date('2026-03-07T08:58:00Z'),
    updatedAt: new Date('2026-03-07T09:10:00Z'),
  }),

  // Additional completed investigations (historical)
  inv('inv-028', 'site-001', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-20T10:00:00Z'),
    completedAt: new Date('2026-02-20T10:18:00Z'),
    proxyUsed: '103.152.112.30',
    createdById: 'user-006',
    createdAt: new Date('2026-02-20T09:58:00Z'),
    updatedAt: new Date('2026-02-20T10:18:00Z'),
  }),
  inv('inv-029', 'site-002', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-18T14:00:00Z'),
    completedAt: new Date('2026-02-18T14:15:00Z'),
    proxyUsed: '45.77.100.55',
    createdById: 'user-004',
    createdAt: new Date('2026-02-18T13:58:00Z'),
    updatedAt: new Date('2026-02-18T14:15:00Z'),
  }),
  inv('inv-030', 'site-004', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-15T09:00:00Z'),
    completedAt: new Date('2026-02-15T09:20:00Z'),
    proxyUsed: '185.199.228.40',
    createdById: 'user-007',
    createdAt: new Date('2026-02-15T08:58:00Z'),
    updatedAt: new Date('2026-02-15T09:20:00Z'),
  }),
  inv('inv-031', 'site-007', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-12T11:00:00Z'),
    completedAt: new Date('2026-02-12T11:16:00Z'),
    proxyUsed: '103.152.112.33',
    createdById: 'user-004',
    createdAt: new Date('2026-02-12T10:58:00Z'),
    updatedAt: new Date('2026-02-12T11:16:00Z'),
  }),
  inv('inv-032', 'site-009', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-10T16:00:00Z'),
    completedAt: new Date('2026-02-10T16:14:00Z'),
    proxyUsed: '45.77.100.60',
    createdById: 'user-006',
    createdAt: new Date('2026-02-10T15:58:00Z'),
    updatedAt: new Date('2026-02-10T16:14:00Z'),
  }),
  inv('inv-033', 'site-013', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-08T08:00:00Z'),
    completedAt: new Date('2026-02-08T08:22:00Z'),
    proxyUsed: '185.199.228.45',
    createdById: 'user-007',
    createdAt: new Date('2026-02-08T07:58:00Z'),
    updatedAt: new Date('2026-02-08T08:22:00Z'),
  }),
  inv('inv-034', 'site-016', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-05T13:00:00Z'),
    completedAt: new Date('2026-02-05T13:17:00Z'),
    proxyUsed: '103.152.112.36',
    createdById: 'user-004',
    createdAt: new Date('2026-02-05T12:58:00Z'),
    updatedAt: new Date('2026-02-05T13:17:00Z'),
  }),
  inv('inv-035', 'site-021', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-03T10:00:00Z'),
    completedAt: new Date('2026-02-03T10:15:00Z'),
    proxyUsed: '45.77.100.65',
    createdById: 'user-006',
    createdAt: new Date('2026-02-03T09:58:00Z'),
    updatedAt: new Date('2026-02-03T10:15:00Z'),
  }),
  inv('inv-036', 'site-024', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-01T14:00:00Z'),
    completedAt: new Date('2026-03-01T14:18:00Z'),
    proxyUsed: '185.199.228.50',
    createdById: 'user-007',
    createdAt: new Date('2026-03-01T13:58:00Z'),
    updatedAt: new Date('2026-03-01T14:18:00Z'),
  }),
  inv('inv-037', 'site-026', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-28T08:00:00Z'),
    completedAt: new Date('2026-02-28T08:13:00Z'),
    proxyUsed: '103.152.112.39',
    createdById: 'user-004',
    createdAt: new Date('2026-02-28T07:58:00Z'),
    updatedAt: new Date('2026-02-28T08:13:00Z'),
  }),
  inv('inv-038', 'site-017', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-25T15:00:00Z'),
    completedAt: new Date('2026-02-25T15:20:00Z'),
    proxyUsed: '45.77.100.70',
    createdById: 'user-006',
    createdAt: new Date('2026-02-25T14:58:00Z'),
    updatedAt: new Date('2026-02-25T15:20:00Z'),
  }),

  // More failed
  inv('inv-039', 'site-003', InvestigationStatus.FAILED, 2, {
    startedAt: new Date('2026-03-11T16:00:00Z'),
    errorMessage: 'SMS 인증 실패: 번호 만료',
    retryCount: 2,
    proxyUsed: '185.199.228.55',
    createdById: 'user-007',
    createdAt: new Date('2026-03-11T15:58:00Z'),
    updatedAt: new Date('2026-03-11T16:10:00Z'),
  }),
  inv('inv-040', 'site-012', InvestigationStatus.FAILED, 1, {
    startedAt: new Date('2026-03-10T09:00:00Z'),
    errorMessage: 'IP 차단됨',
    retryCount: 3,
    proxyUsed: '103.152.112.42',
    createdById: 'user-004',
    createdAt: new Date('2026-03-10T08:58:00Z'),
    updatedAt: new Date('2026-03-10T09:04:00Z'),
  }),

  // Stage 3 complete (additional)
  inv('inv-041', 'site-022', InvestigationStatus.STAGE_3_COMPLETE, 3, {
    startedAt: new Date('2026-03-11T08:00:00Z'),
    proxyUsed: '45.77.100.75',
    createdById: 'user-006',
    createdAt: new Date('2026-03-11T07:58:00Z'),
    updatedAt: new Date('2026-03-11T08:20:00Z'),
  }),

  // More completed
  inv('inv-042', 'site-005', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-22T10:00:00Z'),
    completedAt: new Date('2026-02-22T10:25:00Z'),
    proxyUsed: '185.199.228.60',
    createdById: 'user-004',
    createdAt: new Date('2026-02-22T09:58:00Z'),
    updatedAt: new Date('2026-02-22T10:25:00Z'),
  }),
  inv('inv-043', 'site-010', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-19T11:00:00Z'),
    completedAt: new Date('2026-02-19T11:14:00Z'),
    proxyUsed: '103.152.112.45',
    createdById: 'user-007',
    createdAt: new Date('2026-02-19T10:58:00Z'),
    updatedAt: new Date('2026-02-19T11:14:00Z'),
  }),
  inv('inv-044', 'site-018', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-02-16T14:00:00Z'),
    completedAt: new Date('2026-02-16T14:19:00Z'),
    proxyUsed: '45.77.100.80',
    createdById: 'user-006',
    createdAt: new Date('2026-02-16T13:58:00Z'),
    updatedAt: new Date('2026-02-16T14:19:00Z'),
  }),
  inv('inv-045', 'site-014', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-12T16:00:00Z'),
    completedAt: new Date('2026-03-12T16:12:00Z'),
    proxyUsed: '185.199.228.65',
    createdById: 'user-004',
    createdAt: new Date('2026-03-12T15:58:00Z'),
    updatedAt: new Date('2026-03-12T16:12:00Z'),
  }),
  inv('inv-046', 'site-023', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-11T12:00:00Z'),
    completedAt: new Date('2026-03-11T12:16:00Z'),
    proxyUsed: '103.152.112.48',
    createdById: 'user-007',
    createdAt: new Date('2026-03-11T11:58:00Z'),
    updatedAt: new Date('2026-03-11T12:16:00Z'),
  }),
  inv('inv-047', 'site-027', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-10T08:00:00Z'),
    completedAt: new Date('2026-03-10T08:14:00Z'),
    proxyUsed: '45.77.100.85',
    createdById: 'user-006',
    createdAt: new Date('2026-03-10T07:58:00Z'),
    updatedAt: new Date('2026-03-10T08:14:00Z'),
  }),
  inv('inv-048', 'site-028', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-09T10:00:00Z'),
    completedAt: new Date('2026-03-09T10:17:00Z'),
    proxyUsed: '185.199.228.70',
    createdById: 'user-004',
    createdAt: new Date('2026-03-09T09:58:00Z'),
    updatedAt: new Date('2026-03-09T10:17:00Z'),
  }),
  inv('inv-049', 'site-030', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-08T15:00:00Z'),
    completedAt: new Date('2026-03-08T15:13:00Z'),
    proxyUsed: '103.152.112.50',
    createdById: 'user-007',
    createdAt: new Date('2026-03-08T14:58:00Z'),
    updatedAt: new Date('2026-03-08T15:13:00Z'),
  }),
  inv('inv-050', 'site-011', InvestigationStatus.COMPLETED, 3, {
    startedAt: new Date('2026-03-07T16:00:00Z'),
    completedAt: new Date('2026-03-07T16:18:00Z'),
    proxyUsed: '45.77.100.90',
    createdById: 'user-004',
    createdAt: new Date('2026-03-07T15:58:00Z'),
    updatedAt: new Date('2026-03-07T16:18:00Z'),
  }),
];
