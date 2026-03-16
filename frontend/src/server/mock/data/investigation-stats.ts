// ============================================================================
// 채증 통계 대시보드 Mock 데이터
// ============================================================================

// ---------------------------------------------------------------------------
// KPI 데이터
// ---------------------------------------------------------------------------
export const mockInvestigationKpi = {
  todayCount: 23,
  yesterdayCount: 18,
  weekCount: 156,
  lastWeekCount: 139,
  successRate: 78.5,
  targetRate: 70,
  avgDuration: '4분 32초',
  lastWeekAvgDuration: '5분 02초',
}

// ---------------------------------------------------------------------------
// 일별 채증 건수 (2026년 3월, 히트맵용)
// ---------------------------------------------------------------------------
export const mockDailyCounts = Array.from({ length: 31 }, (_, i) => ({
  date: `2026-03-${String(i + 1).padStart(2, '0')}`,
  count: i < 17 ? Math.floor(Math.random() * 25) + 5 : 0,
}))

// 17일까지만 데이터 존재하도록 고정값 오버라이드 (랜덤 시드 대체)
mockDailyCounts[0].count = 12
mockDailyCounts[1].count = 8
mockDailyCounts[2].count = 22
mockDailyCounts[3].count = 15
mockDailyCounts[4].count = 18
mockDailyCounts[5].count = 7
mockDailyCounts[6].count = 3
mockDailyCounts[7].count = 25
mockDailyCounts[8].count = 19
mockDailyCounts[9].count = 11
mockDailyCounts[10].count = 28
mockDailyCounts[11].count = 14
mockDailyCounts[12].count = 9
mockDailyCounts[13].count = 21
mockDailyCounts[14].count = 16
mockDailyCounts[15].count = 20
mockDailyCounts[16].count = 23

// ---------------------------------------------------------------------------
// 시간대별 분포 (24시간)
// ---------------------------------------------------------------------------
export const mockHourlyDistribution = [
  { hour: 0, auto: 2, manual: 0 },
  { hour: 1, auto: 3, manual: 0 },
  { hour: 2, auto: 12, manual: 0 },
  { hour: 3, auto: 8, manual: 0 },
  { hour: 4, auto: 5, manual: 0 },
  { hour: 5, auto: 2, manual: 0 },
  { hour: 6, auto: 1, manual: 0 },
  { hour: 7, auto: 0, manual: 1 },
  { hour: 8, auto: 1, manual: 2 },
  { hour: 9, auto: 2, manual: 3 },
  { hour: 10, auto: 3, manual: 7 },
  { hour: 11, auto: 2, manual: 4 },
  { hour: 12, auto: 1, manual: 2 },
  { hour: 13, auto: 2, manual: 3 },
  { hour: 14, auto: 3, manual: 8 },
  { hour: 15, auto: 2, manual: 5 },
  { hour: 16, auto: 1, manual: 3 },
  { hour: 17, auto: 2, manual: 2 },
  { hour: 18, auto: 3, manual: 1 },
  { hour: 19, auto: 4, manual: 1 },
  { hour: 20, auto: 5, manual: 0 },
  { hour: 21, auto: 6, manual: 0 },
  { hour: 22, auto: 4, manual: 0 },
  { hour: 23, auto: 3, manual: 0 },
]

// ---------------------------------------------------------------------------
// 일별 채증 결과 타임라인 (3월 17일)
// ---------------------------------------------------------------------------
export interface DailyResultItem {
  time: string
  siteUrl: string
  stage: number
  result: 'success' | 'failed'
  reason?: string
  screenshotCount: number
  mode: 'auto' | 'manual'
}

export const mockDailyResults: DailyResultItem[] = [
  { time: '02:01', siteUrl: 'toto-abc.com', stage: 3, result: 'success', screenshotCount: 3, mode: 'auto' },
  { time: '02:03', siteUrl: 'bet-korea.xyz', stage: 1, result: 'failed', reason: 'Cloudflare 차단', screenshotCount: 1, mode: 'auto' },
  { time: '02:05', siteUrl: 'casino-win88.net', stage: 3, result: 'success', screenshotCount: 4, mode: 'auto' },
  { time: '02:08', siteUrl: 'powerball-vip.com', stage: 2, result: 'success', screenshotCount: 2, mode: 'auto' },
  { time: '02:12', siteUrl: 'slot-paradise.kr', stage: 3, result: 'success', screenshotCount: 5, mode: 'auto' },
  { time: '02:15', siteUrl: 'toto-premium.com', stage: 1, result: 'failed', reason: 'DNS 조회 실패', screenshotCount: 0, mode: 'auto' },
  { time: '02:18', siteUrl: 'mega-sports.net', stage: 3, result: 'success', screenshotCount: 3, mode: 'auto' },
  { time: '02:22', siteUrl: 'lucky-casino.org', stage: 2, result: 'success', screenshotCount: 2, mode: 'auto' },
  { time: '02:25', siteUrl: 'bet365-kr.com', stage: 1, result: 'failed', reason: 'IP 차단', screenshotCount: 1, mode: 'auto' },
  { time: '02:30', siteUrl: 'horse-racing.bet', stage: 3, result: 'success', screenshotCount: 4, mode: 'auto' },
  { time: '10:05', siteUrl: 'gamble-zone.kr', stage: 3, result: 'success', screenshotCount: 3, mode: 'manual' },
  { time: '10:12', siteUrl: 'poker-master.net', stage: 2, result: 'success', screenshotCount: 2, mode: 'manual' },
  { time: '10:20', siteUrl: 'baccarat-vip.com', stage: 3, result: 'success', screenshotCount: 5, mode: 'manual' },
  { time: '10:35', siteUrl: 'sports-bet88.xyz', stage: 1, result: 'failed', reason: 'CAPTCHA 실패', screenshotCount: 1, mode: 'manual' },
  { time: '14:01', siteUrl: 'toto-gold.com', stage: 3, result: 'success', screenshotCount: 3, mode: 'manual' },
  { time: '14:10', siteUrl: 'casino-royal.kr', stage: 3, result: 'success', screenshotCount: 4, mode: 'manual' },
  { time: '14:15', siteUrl: 'slot-mania.net', stage: 2, result: 'success', screenshotCount: 2, mode: 'manual' },
  { time: '14:22', siteUrl: 'power-toto.com', stage: 1, result: 'failed', reason: '연결 시간초과', screenshotCount: 0, mode: 'manual' },
  { time: '14:30', siteUrl: 'jackpot-city.kr', stage: 3, result: 'success', screenshotCount: 3, mode: 'manual' },
  { time: '14:40', siteUrl: 'roulette-pro.com', stage: 3, result: 'success', screenshotCount: 4, mode: 'auto' },
  { time: '14:45', siteUrl: 'live-casino.net', stage: 2, result: 'success', screenshotCount: 2, mode: 'auto' },
  { time: '14:50', siteUrl: 'betting-king.xyz', stage: 3, result: 'success', screenshotCount: 3, mode: 'auto' },
  { time: '14:55', siteUrl: 'dragon-slot.com', stage: 3, result: 'success', screenshotCount: 5, mode: 'auto' },
]

// ---------------------------------------------------------------------------
// 채증 추이 데이터 (30일)
// ---------------------------------------------------------------------------
export const mockInvestigationTrend = [
  { date: '2026-02-16', success: 18, failed: 3 },
  { date: '2026-02-17', success: 22, failed: 2 },
  { date: '2026-02-18', success: 15, failed: 4 },
  { date: '2026-02-19', success: 20, failed: 3 },
  { date: '2026-02-20', success: 17, failed: 5 },
  { date: '2026-02-21', success: 24, failed: 2 },
  { date: '2026-02-22', success: 19, failed: 3 },
  { date: '2026-02-23', success: 21, failed: 4 },
  { date: '2026-02-24', success: 16, failed: 2 },
  { date: '2026-02-25', success: 23, failed: 3 },
  { date: '2026-02-26', success: 25, failed: 1 },
  { date: '2026-02-27', success: 18, failed: 4 },
  { date: '2026-02-28', success: 20, failed: 3 },
  { date: '2026-03-01', success: 22, failed: 2 },
  { date: '2026-03-02', success: 19, failed: 5 },
  { date: '2026-03-03', success: 17, failed: 3 },
  { date: '2026-03-04', success: 24, failed: 2 },
  { date: '2026-03-05', success: 21, failed: 4 },
  { date: '2026-03-06', success: 15, failed: 3 },
  { date: '2026-03-07', success: 23, failed: 1 },
  { date: '2026-03-08', success: 20, failed: 3 },
  { date: '2026-03-09', success: 18, failed: 4 },
  { date: '2026-03-10', success: 25, failed: 2 },
  { date: '2026-03-11', success: 22, failed: 3 },
  { date: '2026-03-12', success: 16, failed: 5 },
  { date: '2026-03-13', success: 19, failed: 2 },
  { date: '2026-03-14', success: 21, failed: 3 },
  { date: '2026-03-15', success: 23, failed: 4 },
  { date: '2026-03-16', success: 20, failed: 2 },
  { date: '2026-03-17', success: 18, failed: 5 },
]
