// ============================================================================
// Mock AI 분류 검토 서비스
// ============================================================================

import type {
  ApiResponse,
  ClassificationReviewItem,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api';
import type { ClassificationResult } from '@/types/domain';
import { ReviewStatus, SiteCategory } from '@/types/enums';
import { mockClassifications } from '../data/classifications';
import { mockSites } from '../data/sites';
import { delay, wrapPaginated, wrapResponse } from './helpers';

let classifications: ClassificationResult[] = [...mockClassifications];

function toReviewItem(cls: ClassificationResult): ClassificationReviewItem {
  const site = mockSites.find((s) => s.id === cls.siteId);
  return {
    id: cls.id,
    siteId: cls.siteId,
    siteUrl: site?.url ?? '',
    screenshotUrl: `/api/evidence/screenshots/${cls.siteId}/latest`,
    aiResult: {
      model: cls.model,
      category: cls.category as SiteCategory | null,
      confidence: cls.confidenceScore,
      evidence: (cls.evidence as Record<string, unknown>[]) ?? [],
    },
    reviewStatus: cls.reviewStatus,
    createdAt: cls.createdAt.toISOString(),
  };
}

export const mockReviewService = {
  async getAll(
    filter: PaginatedRequest & { reviewStatus?: ReviewStatus } = {}
  ): Promise<PaginatedResponse<ClassificationReviewItem>> {
    await delay();
    let filtered = [...classifications];

    if (filter.reviewStatus) {
      filtered = filtered.filter(
        (c) => c.reviewStatus === filter.reviewStatus
      );
    }

    const sortOrder = filter.order ?? 'desc';
    filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    const items = filtered.map(toReviewItem);
    return wrapPaginated(items, filter.limit ?? 20, filter.cursor);
  },

  async getById(
    id: string
  ): Promise<ApiResponse<ClassificationReviewItem> | null> {
    await delay();
    const cls = classifications.find((c) => c.id === id);
    if (!cls) return null;
    return wrapResponse(toReviewItem(cls));
  },

  async approve(
    id: string,
    reviewerId: string = 'user-009'
  ): Promise<ApiResponse<ClassificationReviewItem> | null> {
    await delay();
    const idx = classifications.findIndex((c) => c.id === id);
    if (idx < 0) return null;

    classifications[idx].reviewStatus = ReviewStatus.APPROVED;
    classifications[idx].reviewedById = reviewerId;
    classifications[idx].reviewedAt = new Date();

    return wrapResponse(toReviewItem(classifications[idx]));
  },

  async reject(
    id: string,
    _correctedCategory: SiteCategory,
    _reason: string,
    reviewerId: string = 'user-009'
  ): Promise<ApiResponse<ClassificationReviewItem> | null> {
    await delay();
    const idx = classifications.findIndex((c) => c.id === id);
    if (idx < 0) return null;

    classifications[idx].reviewStatus = ReviewStatus.REJECTED;
    classifications[idx].reviewedById = reviewerId;
    classifications[idx].reviewedAt = new Date();

    return wrapResponse(toReviewItem(classifications[idx]));
  },

  _reset() {
    classifications = [...mockClassifications];
  },
};
