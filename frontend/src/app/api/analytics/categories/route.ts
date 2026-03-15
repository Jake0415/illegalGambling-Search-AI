import { apiSuccess } from '@/server/api/response';
import { mockAnalyticsService } from '@/server/mock/services/analytics-service';

// PRD: FR-UI-025 카테고리별 사이트 분포
// Phase 3에서 PostgreSQL 집계 구현
export async function GET() {
  const result = await mockAnalyticsService.getCategoryDistribution();

  return apiSuccess(result.data);
}
