// ============================================================================
// Mock 사이트 관리 서비스
// ============================================================================

import type {
  ApiResponse,
  BulkImportSitesRequest,
  BulkImportSitesResponseData,
  CreateSiteRequest,
  PaginatedResponse,
  SiteDetailData,
  SiteListFilter,
  SiteListItem,
  UpdateSiteRequest,
} from '@/types/api';
import type { Site } from '@/types/domain';
import { SiteStatus } from '@/types/enums';
import { mockSites } from '../data/sites';
import { delay, wrapPaginated, wrapResponse } from './helpers';

// In-memory store
let sites: Site[] = [...mockSites];

function toListItem(site: Site): SiteListItem {
  return {
    id: site.id,
    url: site.url,
    domain: site.domain,
    status: site.status,
    category: site.category,
    confidenceScore: site.confidenceScore,
    source: null,
    lastCheckedAt: site.lastCheckedAt?.toISOString() ?? null,
    investigationCount: 0,
    createdAt: site.createdAt.toISOString(),
  };
}

function toDetailData(site: Site): SiteDetailData {
  return {
    id: site.id,
    url: site.url,
    domain: site.domain,
    status: site.status,
    category: site.category,
    confidenceScore: site.confidenceScore,
    firstDetectedAt: site.firstDetectedAt.toISOString(),
    lastCheckedAt: site.lastCheckedAt?.toISOString() ?? null,
    tags: site.tags,
    whoisData: site.whoisData,
    dnsRecords: site.dnsRecords,
    notes: site.notes,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    deletedAt: site.deletedAt?.toISOString() ?? null,
  };
}

export const mockSiteService = {
  async getAll(
    filter: SiteListFilter = {}
  ): Promise<PaginatedResponse<SiteListItem>> {
    await delay();
    let filtered = sites.filter((s) => !s.deletedAt);

    if (filter.status) {
      filtered = filtered.filter((s) => s.status === filter.status);
    }
    if (filter.category) {
      filtered = filtered.filter((s) => s.category === filter.category);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.url.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    if (filter.createdAfter) {
      const after = new Date(filter.createdAfter);
      filtered = filtered.filter((s) => s.createdAt >= after);
    }
    if (filter.createdBefore) {
      const before = new Date(filter.createdBefore);
      filtered = filtered.filter((s) => s.createdAt <= before);
    }

    // Sort
    const sortField = filter.sort ?? 'createdAt';
    const sortOrder = filter.order ?? 'desc';
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof Site];
      const bVal = b[sortField as keyof Site];
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      return 0;
    });

    const listItems = filtered.map(toListItem);
    return wrapPaginated(listItems, filter.limit ?? 20, filter.cursor);
  },

  async getById(id: string): Promise<ApiResponse<SiteDetailData> | null> {
    await delay();
    const site = sites.find((s) => s.id === id && !s.deletedAt);
    if (!site) return null;
    return wrapResponse(toDetailData(site));
  },

  async create(req: CreateSiteRequest): Promise<ApiResponse<SiteDetailData>> {
    await delay();
    const now = new Date();
    const domain = new URL(req.url).hostname;
    const newSite: Site = {
      id: `site-${String(sites.length + 1).padStart(3, '0')}`,
      url: req.url,
      domain,
      status: SiteStatus.ACTIVE,
      category: null,
      confidenceScore: null,
      firstDetectedAt: now,
      lastCheckedAt: null,
      tags: req.tags ?? null,
      whoisData: null,
      dnsRecords: null,
      notes: req.memo ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    sites.push(newSite);
    return wrapResponse(toDetailData(newSite));
  },

  async update(
    id: string,
    req: UpdateSiteRequest
  ): Promise<ApiResponse<SiteDetailData> | null> {
    await delay();
    const idx = sites.findIndex((s) => s.id === id && !s.deletedAt);
    if (idx < 0) return null;

    const site = sites[idx];
    if (req.status !== undefined) site.status = req.status;
    if (req.category !== undefined) site.category = req.category;
    if (req.confidenceScore !== undefined)
      site.confidenceScore = req.confidenceScore;
    if (req.tags !== undefined) site.tags = req.tags;
    if (req.memo !== undefined) site.notes = req.memo;
    site.updatedAt = new Date();

    sites[idx] = site;
    return wrapResponse(toDetailData(site));
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    const idx = sites.findIndex((s) => s.id === id && !s.deletedAt);
    if (idx < 0) return false;
    sites[idx].deletedAt = new Date();
    sites[idx].updatedAt = new Date();
    return true;
  },

  async importBulk(
    req: BulkImportSitesRequest
  ): Promise<ApiResponse<BulkImportSitesResponseData>> {
    await delay(200);
    const results = req.urls.map((url) => {
      const existing = sites.find((s) => s.url === url);
      if (existing) {
        return { url, status: 'duplicate' as const, siteId: existing.id };
      }
      try {
        const domain = new URL(url).hostname;
        const now = new Date();
        const newSite: Site = {
          id: `site-${String(sites.length + 1).padStart(3, '0')}`,
          url,
          domain,
          status: SiteStatus.ACTIVE,
          category: null,
          confidenceScore: null,
          firstDetectedAt: now,
          lastCheckedAt: null,
          tags: req.tags ?? null,
          whoisData: null,
          dnsRecords: null,
          notes: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        };
        sites.push(newSite);
        return { url, status: 'created' as const, siteId: newSite.id };
      } catch {
        return { url, status: 'invalid' as const, error: 'Invalid URL format' };
      }
    });

    const created = results.filter((r) => r.status === 'created').length;
    const duplicates = results.filter((r) => r.status === 'duplicate').length;
    const errors = results.filter((r) => r.status === 'invalid').length;

    return wrapResponse({
      totalProcessed: results.length,
      created,
      duplicates,
      errors,
      results,
    });
  },

  /** Reset to initial data (useful for tests) */
  _reset() {
    sites = [...mockSites];
  },
};
