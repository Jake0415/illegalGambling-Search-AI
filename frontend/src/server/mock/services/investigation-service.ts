// ============================================================================
// Mock 채증 서비스
// ============================================================================

import type {
  ApiResponse,
  CreateInvestigationRequest,
  InvestigationDetailData,
  InvestigationListFilter,
  InvestigationListItem,
  InvestigationStageDetail,
  PaginatedResponse,
} from '@/types/api';
import type { Investigation } from '@/types/domain';
import { InvestigationStatus } from '@/types/enums';
import { mockInvestigations } from '../data/investigations';
import { delay, wrapPaginated, wrapResponse } from './helpers';

let investigations: Investigation[] = [...mockInvestigations];

function toListItem(inv: Investigation): InvestigationListItem {
  return {
    id: inv.id,
    siteId: inv.siteId,
    status: inv.status,
    mode: inv.scheduledAt ? 'scheduled' : 'immediate',
    scope: 'full',
    currentStage: inv.currentStage,
    progress: computeProgress(inv),
    retryCount: inv.retryCount,
    createdBy: inv.createdById,
    createdAt: inv.createdAt.toISOString(),
    startedAt: inv.startedAt?.toISOString() ?? null,
    completedAt: inv.completedAt?.toISOString() ?? null,
  };
}

function computeProgress(inv: Investigation): number {
  switch (inv.status) {
    case InvestigationStatus.QUEUED:
      return 0;
    case InvestigationStatus.IN_PROGRESS:
      return inv.currentStage * 25;
    case InvestigationStatus.STAGE_1_COMPLETE:
      return 33;
    case InvestigationStatus.STAGE_2_COMPLETE:
      return 66;
    case InvestigationStatus.STAGE_3_COMPLETE:
      return 95;
    case InvestigationStatus.COMPLETED:
      return 100;
    case InvestigationStatus.FAILED:
    case InvestigationStatus.CANCELLED:
      return inv.currentStage * 33;
    default:
      return 0;
  }
}

function makeStageDetail(
  stageNum: number,
  inv: Investigation
): InvestigationStageDetail {
  if (inv.currentStage < stageNum && inv.status !== InvestigationStatus.COMPLETED) {
    return {
      status: 'pending',
      startedAt: null,
      completedAt: null,
      duration: null,
      filesCollected: 0,
      errors: [],
    };
  }

  const isCurrentStage = inv.currentStage === stageNum;
  const isFailed = inv.status === InvestigationStatus.FAILED && isCurrentStage;
  const isInProgress =
    inv.status === InvestigationStatus.IN_PROGRESS && isCurrentStage;

  if (isFailed) {
    return {
      status: 'failed',
      startedAt: inv.startedAt?.toISOString() ?? null,
      completedAt: null,
      duration: null,
      filesCollected: 0,
      errors: [inv.errorMessage ?? 'Unknown error'],
    };
  }

  if (isInProgress) {
    return {
      status: 'in_progress',
      startedAt: inv.startedAt?.toISOString() ?? null,
      completedAt: null,
      duration: null,
      filesCollected: stageNum === 1 ? 2 : 0,
      errors: [],
    };
  }

  // Completed stage
  const duration = 180 + Math.floor(Math.random() * 360);
  return {
    status: 'completed',
    startedAt: inv.startedAt?.toISOString() ?? null,
    completedAt: inv.completedAt?.toISOString() ?? new Date().toISOString(),
    duration,
    filesCollected: stageNum === 1 ? 4 : stageNum === 2 ? 2 : 1,
    errors: [],
  };
}

function toDetailData(inv: Investigation): InvestigationDetailData {
  const listItem = toListItem(inv);
  return {
    ...listItem,
    stages: {
      stage1: makeStageDetail(1, inv),
      stage2: makeStageDetail(2, inv),
      stage3: makeStageDetail(3, inv),
    },
    proxyInfo: inv.proxyUsed
      ? { ip: inv.proxyUsed, country: 'KR', provider: 'rotating-proxy' }
      : null,
    queuePosition:
      inv.status === InvestigationStatus.QUEUED
        ? investigations
            .filter((i) => i.status === InvestigationStatus.QUEUED)
            .findIndex((i) => i.id === inv.id) + 1
        : null,
    estimatedStartAt:
      inv.status === InvestigationStatus.QUEUED
        ? new Date(Date.now() + 300000).toISOString()
        : null,
  };
}

export const mockInvestigationService = {
  async getAll(
    filter: InvestigationListFilter = {}
  ): Promise<PaginatedResponse<InvestigationListItem>> {
    await delay();
    let filtered = [...investigations];

    if (filter.status) {
      filtered = filtered.filter((i) => i.status === filter.status);
    }
    if (filter.siteId) {
      filtered = filtered.filter((i) => i.siteId === filter.siteId);
    }
    if (filter.createdAfter) {
      const after = new Date(filter.createdAfter);
      filtered = filtered.filter((i) => i.createdAt >= after);
    }
    if (filter.createdBefore) {
      const before = new Date(filter.createdBefore);
      filtered = filtered.filter((i) => i.createdAt <= before);
    }

    const sortOrder = filter.order ?? 'desc';
    filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    const listItems = filtered.map(toListItem);
    return wrapPaginated(listItems, filter.limit ?? 20, filter.cursor);
  },

  async getById(
    id: string
  ): Promise<ApiResponse<InvestigationDetailData> | null> {
    await delay();
    const inv = investigations.find((i) => i.id === id);
    if (!inv) return null;
    return wrapResponse(toDetailData(inv));
  },

  async create(
    req: CreateInvestigationRequest
  ): Promise<ApiResponse<InvestigationDetailData>> {
    await delay();
    const now = new Date();
    const newInv: Investigation = {
      id: `inv-${String(investigations.length + 1).padStart(3, '0')}`,
      siteId: req.siteId,
      status: req.mode === 'scheduled' ? InvestigationStatus.QUEUED : InvestigationStatus.QUEUED,
      currentStage: 0,
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      retryCount: 0,
      scheduledAt: req.scheduledAt ? new Date(req.scheduledAt) : null,
      proxyUsed: null,
      browserFingerprint: null,
      createdById: 'user-004',
      createdAt: now,
      updatedAt: now,
    };
    investigations.push(newInv);
    return wrapResponse(toDetailData(newInv));
  },

  async cancel(id: string): Promise<boolean> {
    await delay();
    const inv = investigations.find((i) => i.id === id);
    if (
      !inv ||
      (inv.status !== InvestigationStatus.QUEUED &&
        inv.status !== InvestigationStatus.IN_PROGRESS)
    ) {
      return false;
    }
    inv.status = InvestigationStatus.CANCELLED;
    inv.updatedAt = new Date();
    return true;
  },

  async getResults(
    id: string
  ): Promise<ApiResponse<InvestigationDetailData> | null> {
    await delay();
    const inv = investigations.find((i) => i.id === id);
    if (!inv) return null;
    return wrapResponse(toDetailData(inv));
  },

  _reset() {
    investigations = [...mockInvestigations];
  },
};
