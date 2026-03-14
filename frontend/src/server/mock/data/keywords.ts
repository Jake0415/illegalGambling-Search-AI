// ============================================================================
// Mock 키워드 데이터 (50개)
// ============================================================================

import type { Keyword } from '@/types/domain';

interface KwInput {
  keyword: string;
  category: string;
  detectionCount: number;
}

const kwData: KwInput[] = [
  // 스포츠 베팅 (15)
  { keyword: '불법토토', category: '스포츠베팅', detectionCount: 342 },
  { keyword: '사설토토', category: '스포츠베팅', detectionCount: 289 },
  { keyword: '안전놀이터', category: '스포츠베팅', detectionCount: 256 },
  { keyword: '메이저사이트', category: '스포츠베팅', detectionCount: 231 },
  { keyword: '토토사이트', category: '스포츠베팅', detectionCount: 215 },
  { keyword: '스포츠베팅', category: '스포츠베팅', detectionCount: 198 },
  { keyword: '프로토', category: '스포츠베팅', detectionCount: 167 },
  { keyword: '배당률', category: '스포츠베팅', detectionCount: 145 },
  { keyword: '먹튀검증', category: '스포츠베팅', detectionCount: 312 },
  { keyword: '먹튀사이트', category: '스포츠베팅', detectionCount: 278 },
  { keyword: '토토추천', category: '스포츠베팅', detectionCount: 134 },
  { keyword: '실시간배팅', category: '스포츠베팅', detectionCount: 123 },
  { keyword: '승무패', category: '스포츠베팅', detectionCount: 98 },
  { keyword: '핸디캡베팅', category: '스포츠베팅', detectionCount: 76 },
  { keyword: '오버언더', category: '스포츠베팅', detectionCount: 89 },

  // 카지노 (15)
  { keyword: '온라인카지노', category: '카지노', detectionCount: 456 },
  { keyword: '바카라', category: '카지노', detectionCount: 389 },
  { keyword: '라이브카지노', category: '카지노', detectionCount: 267 },
  { keyword: '블랙잭', category: '카지노', detectionCount: 178 },
  { keyword: '룰렛', category: '카지노', detectionCount: 156 },
  { keyword: '슬롯머신', category: '카지노', detectionCount: 234 },
  { keyword: '잭팟', category: '카지노', detectionCount: 145 },
  { keyword: '카지노사이트', category: '카지노', detectionCount: 345 },
  { keyword: '카지노추천', category: '카지노', detectionCount: 189 },
  { keyword: '카지노가입쿠폰', category: '카지노', detectionCount: 167 },
  { keyword: '무료카지노', category: '카지노', detectionCount: 123 },
  { keyword: '카지노보너스', category: '카지노', detectionCount: 156 },
  { keyword: '딜러', category: '카지노', detectionCount: 89 },
  { keyword: '바카라전략', category: '카지노', detectionCount: 112 },
  { keyword: '포커', category: '카지노', detectionCount: 201 },

  // 경마 (10)
  { keyword: '온라인경마', category: '경마', detectionCount: 134 },
  { keyword: '경마사이트', category: '경마', detectionCount: 112 },
  { keyword: '마사회', category: '경마', detectionCount: 98 },
  { keyword: '경마예상', category: '경마', detectionCount: 87 },
  { keyword: '경마배팅', category: '경마', detectionCount: 76 },
  { keyword: '경마결과', category: '경마', detectionCount: 65 },
  { keyword: '경주마', category: '경마', detectionCount: 54 },
  { keyword: '마권구매', category: '경마', detectionCount: 43 },
  { keyword: '경마중계', category: '경마', detectionCount: 67 },
  { keyword: '불법경마', category: '경마', detectionCount: 156 },

  // 기타 도박 (10)
  { keyword: '사다리게임', category: '기타도박', detectionCount: 189 },
  { keyword: '파워볼', category: '기타도박', detectionCount: 234 },
  { keyword: '키노', category: '기타도박', detectionCount: 56 },
  { keyword: '달팽이게임', category: '기타도박', detectionCount: 78 },
  { keyword: '홀덤', category: '기타도박', detectionCount: 167 },
  { keyword: '텍사스홀덤', category: '기타도박', detectionCount: 145 },
  { keyword: '온라인도박', category: '기타도박', detectionCount: 378 },
  { keyword: '불법도박', category: '기타도박', detectionCount: 423 },
  { keyword: '도박사이트', category: '기타도박', detectionCount: 356 },
  { keyword: '사설도박', category: '기타도박', detectionCount: 289 },
];

export const mockKeywords: Keyword[] = kwData.map((kw, i) => ({
  id: `kw-${String(i + 1).padStart(3, '0')}`,
  keyword: kw.keyword,
  category: kw.category,
  isActive: i < 45, // last 5 are inactive
  detectionCount: kw.detectionCount,
  createdById: i % 3 === 0 ? 'user-001' : i % 3 === 1 ? 'user-002' : 'user-004',
  createdAt: new Date(2025, 8 + Math.floor(i / 20), 1 + (i % 28), 10, 0, 0),
  updatedAt: new Date(2026, 2, 1 + (i % 14), 10, 0, 0),
}));
