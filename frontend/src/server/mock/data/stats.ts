// ============================================================================
// Mock 통계/대시보드 데이터
// ============================================================================

import type {
  CategoryDistributionData,
  DashboardSummaryData,
  DetectionStatsData,
  InvestigationStatsData,
} from '@/types/api';
import { SiteCategory } from '@/types/enums';

// ---------------------------------------------------------------------------
// 대시보드 요약 KPI
// ---------------------------------------------------------------------------
export const mockDashboardSummary: DashboardSummaryData = {
  totalSites: 30,
  newSites: {
    today: 2,
    thisWeek: 8,
    thisMonth: 15,
  },
  investigations: {
    in_progress: 3,
    completed: 35,
    failed: 5,
    queued: 5,
  },
  successRates: {
    stage1: 0.94,
    stage3: 0.87,
  },
  manualQueue: {
    pending: 4,
    avgWaitTime: 12.5,
  },
  system: {
    uptime: 99.7,
    lastIncident: '2026-03-02T15:30:00Z',
  },
  externalServices: {
    smsProvider: { status: 'healthy', balance: 245.5 },
    captchaSolver: { status: 'healthy', balance: 182.3 },
    proxy: { status: 'healthy', activeIPs: 48 },
  },
};

// ---------------------------------------------------------------------------
// 일일 탐지 통계 (30일)
// ---------------------------------------------------------------------------
function generateDetectionStats(): DetectionStatsData {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(2026, 2, 14 - i);
    const dateStr = date.toISOString().slice(0, 10);
    const baseCount = 8 + Math.floor(Math.random() * 12);
    const googleCount = Math.floor(baseCount * 0.4);
    const crawlingCount = Math.floor(baseCount * 0.3);
    const communityCount = Math.floor(baseCount * 0.2);
    const manualCount = baseCount - googleCount - crawlingCount - communityCount;

    data.push({
      date: dateStr,
      detectedCount: baseCount,
      bySource: {
        GOOGLE_SEARCH: googleCount,
        CRAWLING: crawlingCount,
        COMMUNITY: communityCount,
        MANUAL: manualCount,
      },
      byCategory: {
        SPORTS_BETTING: Math.floor(baseCount * 0.35),
        CASINO: Math.floor(baseCount * 0.4),
        HORSE_RACING: Math.floor(baseCount * 0.1),
        OTHER_GAMBLING: Math.floor(baseCount * 0.1),
        NON_GAMBLING: Math.floor(baseCount * 0.05),
      },
      newVsExisting: {
        new: Math.floor(baseCount * 0.6),
        existing: Math.ceil(baseCount * 0.4),
      },
      precision: 0.85 + Math.random() * 0.1,
    });
  }
  return { period: 'daily', data };
}

export const mockDetectionStats: DetectionStatsData = generateDetectionStats();

// ---------------------------------------------------------------------------
// 채증 통계 (30일)
// ---------------------------------------------------------------------------
function generateInvestigationStats(): InvestigationStatsData {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(2026, 2, 14 - i);
    const dateStr = date.toISOString().slice(0, 10);
    const total = 3 + Math.floor(Math.random() * 8);

    data.push({
      date: dateStr,
      totalInvestigations: total,
      successRateByStage: {
        stage1: 0.9 + Math.random() * 0.08,
        stage2: 0.82 + Math.random() * 0.1,
        stage3: 0.78 + Math.random() * 0.12,
      },
      avgDuration: 600 + Math.floor(Math.random() * 600),
      failureReasons: {
        connection_timeout: Math.floor(Math.random() * 3),
        captcha_failed: Math.floor(Math.random() * 2),
        ip_blocked: Math.floor(Math.random() * 2),
        dns_failure: Math.floor(Math.random() * 1),
      },
      manualInterventionRate: 0.1 + Math.random() * 0.2,
    });
  }
  return { period: 'daily', data };
}

export const mockInvestigationStats: InvestigationStatsData =
  generateInvestigationStats();

// ---------------------------------------------------------------------------
// 카테고리 분포
// ---------------------------------------------------------------------------
export const mockCategoryDistribution: CategoryDistributionData = {
  categories: [
    {
      category: SiteCategory.CASINO,
      count: 12,
      percentage: 40,
      trend: 5.2,
    },
    {
      category: SiteCategory.SPORTS_BETTING,
      count: 9,
      percentage: 30,
      trend: -2.1,
    },
    {
      category: SiteCategory.HORSE_RACING,
      count: 3,
      percentage: 10,
      trend: 1.5,
    },
    {
      category: SiteCategory.OTHER_GAMBLING,
      count: 4,
      percentage: 13.3,
      trend: 3.0,
    },
    {
      category: SiteCategory.NON_GAMBLING,
      count: 1,
      percentage: 3.3,
      trend: -1.0,
    },
    {
      category: 'UNCLASSIFIED',
      count: 1,
      percentage: 3.3,
      trend: 0,
    },
  ],
  unclassifiedCount: 1,
};

// ---------------------------------------------------------------------------
// 비용 추세 데이터 (30일)
// ---------------------------------------------------------------------------
export interface CostTrendItem {
  date: string;
  smsCost: number;
  captchaCost: number;
  proxyCost: number;
  totalCost: number;
}

function generateCostTrends(): CostTrendItem[] {
  const data: CostTrendItem[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(2026, 2, 14 - i);
    const dateStr = date.toISOString().slice(0, 10);
    const smsCost = +(1.5 + Math.random() * 3).toFixed(2);
    const captchaCost = +(0.5 + Math.random() * 2).toFixed(2);
    const proxyCost = +(2 + Math.random() * 1.5).toFixed(2);

    data.push({
      date: dateStr,
      smsCost,
      captchaCost,
      proxyCost,
      totalCost: +(smsCost + captchaCost + proxyCost).toFixed(2),
    });
  }
  return data;
}

export const mockCostTrends: CostTrendItem[] = generateCostTrends();
