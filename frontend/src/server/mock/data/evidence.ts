// ============================================================================
// Mock 증거 파일 데이터 (100건)
// ============================================================================

import type { EvidenceFile } from '@/types/domain';
import { EvidenceFileType } from '@/types/enums';

interface EvidenceOpts {
  investigationId: string;
  fileType: EvidenceFileType;
  stage: number;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  sha256Hash: string;
  originalFilename: string | null;
  description: string | null;
  createdAt: Date;
}

function evi(id: string, opts: EvidenceOpts): EvidenceFile {
  return {
    id,
    investigationId: opts.investigationId,
    fileType: opts.fileType,
    stage: opts.stage,
    filePath: opts.filePath,
    fileSize: opts.fileSize,
    mimeType: opts.mimeType,
    sha256Hash: opts.sha256Hash,
    originalFilename: opts.originalFilename,
    description: opts.description,
    createdAt: opts.createdAt,
  };
}

// Generate SHA-256-like hashes deterministically
function hash(seed: number): string {
  const hex = '0123456789abcdef';
  let result = '';
  let s = seed;
  for (let i = 0; i < 64; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    result += hex[s % 16];
  }
  return result;
}

const completedInvIds = [
  'inv-001',
  'inv-002',
  'inv-003',
  'inv-004',
  'inv-005',
  'inv-006',
  'inv-007',
  'inv-008',
  'inv-009',
  'inv-010',
  'inv-028',
  'inv-029',
  'inv-030',
  'inv-031',
  'inv-032',
  'inv-033',
  'inv-034',
  'inv-035',
  'inv-036',
  'inv-037',
];

const fileTemplates: Array<{
  type: EvidenceFileType;
  stage: number;
  ext: string;
  mime: string;
  sizeRange: [number, number];
  desc: string;
}> = [
  {
    type: EvidenceFileType.SCREENSHOT,
    stage: 1,
    ext: 'png',
    mime: 'image/png',
    sizeRange: [500000, 3000000],
    desc: '메인 페이지 스크린샷',
  },
  {
    type: EvidenceFileType.HTML,
    stage: 1,
    ext: 'html',
    mime: 'text/html',
    sizeRange: [50000, 500000],
    desc: '메인 페이지 HTML 소스',
  },
  {
    type: EvidenceFileType.NETWORK_LOG,
    stage: 1,
    ext: 'har',
    mime: 'application/json',
    sizeRange: [100000, 2000000],
    desc: '네트워크 트래픽 로그',
  },
  {
    type: EvidenceFileType.WHOIS,
    stage: 1,
    ext: 'json',
    mime: 'application/json',
    sizeRange: [2000, 10000],
    desc: 'WHOIS 조회 결과',
  },
  {
    type: EvidenceFileType.WARC,
    stage: 2,
    ext: 'warc',
    mime: 'application/warc',
    sizeRange: [5000000, 50000000],
    desc: 'WARC 아카이브',
  },
];

const evidenceItems: EvidenceFile[] = [];
let evidenceCounter = 0;

for (let i = 0; i < completedInvIds.length; i++) {
  const invId = completedInvIds[i];
  const baseDate = new Date(2026, 2, 1 + Math.floor(i / 2), 10, 0, 0);

  for (const tpl of fileTemplates) {
    evidenceCounter++;
    const id = `evi-${String(evidenceCounter).padStart(3, '0')}`;
    const size = tpl.sizeRange[0] + Math.floor((tpl.sizeRange[1] - tpl.sizeRange[0]) * ((evidenceCounter * 7) % 100) / 100);

    evidenceItems.push(
      evi(id, {
        investigationId: invId,
        fileType: tpl.type,
        stage: tpl.stage,
        filePath: `/evidence/${invId}/stage${tpl.stage}/${id}.${tpl.ext}`,
        fileSize: BigInt(size),
        mimeType: tpl.mime,
        sha256Hash: hash(evidenceCounter),
        originalFilename: `${id}_capture.${tpl.ext}`,
        description: tpl.desc,
        createdAt: new Date(baseDate.getTime() + evidenceCounter * 60000),
      })
    );
  }
}

export const mockEvidenceFiles: EvidenceFile[] = evidenceItems;
