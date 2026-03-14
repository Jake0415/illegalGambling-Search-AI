// ============================================================================
// Mock 분석/통계 서비스
// ============================================================================

import type {
  ApiResponse,
  CategoryDistributionData,
  DashboardSummaryData,
  DetectionStatsData,
  InvestigationStatsData,
  StatsFilter,
} from '@/types/api';
import {
  type CostTrendItem,
  mockCategoryDistribution,
  mockCostTrends,
  mockDashboardSummary,
  mockDetectionStats,
  mockInvestigationStats,
} from '../data/stats';
import { delay, wrapResponse } from './helpers';

function filterByDateRange<T extends { date: string }>(
  data: T[],
  filter: StatsFilter = {}
): T[] {
  let result = [...data];
  if (filter.from) {
    result = result.filter((d) => d.date >= filter.from!);
  }
  if (filter.to) {
    result = result.filter((d) => d.date <= filter.to!);
  }
  return result;
}

export const mockAnalyticsService = {
  async getOverview(): Promise<ApiResponse<DashboardSummaryData>> {
    await delay();
    return wrapResponse(mockDashboardSummary);
  },

  async getSiteStats(
    filter: StatsFilter = {}
  ): Promise<ApiResponse<DetectionStatsData>> {
    await delay();
    const filteredData = filterByDateRange(mockDetectionStats.data, filter);
    return wrapResponse({
      period: filter.period ?? mockDetectionStats.period,
      data: filteredData,
    });
  },

  async getInvestigationStats(
    filter: StatsFilter = {}
  ): Promise<ApiResponse<InvestigationStatsData>> {
    await delay();
    const filteredData = filterByDateRange(
      mockInvestigationStats.data,
      filter
    );
    return wrapResponse({
      period: filter.period ?? mockInvestigationStats.period,
      data: filteredData,
    });
  },

  async getCostStats(
    filter: StatsFilter = {}
  ): Promise<ApiResponse<CostTrendItem[]>> {
    await delay();
    const filteredData = filterByDateRange(mockCostTrends, filter);
    return wrapResponse(filteredData);
  },

  async getCategoryDistribution(): Promise<
    ApiResponse<CategoryDistributionData>
  > {
    await delay();
    return wrapResponse(mockCategoryDistribution);
  },
};
