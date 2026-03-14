// ============================================================================
// Mock 증거 관리 서비스
// ============================================================================

import type {
  ApiResponse,
  CreateReportResponseData,
  EvidenceDetailData,
  EvidenceFileItem,
  PaginatedRequest,
  PaginatedResponse,
  VerifyEvidenceResponseData,
} from '@/types/api';
import { VerificationStatus } from '@/types/enums';
import { mockEvidenceFiles } from '../data/evidence';
import { delay, wrapPaginated, wrapResponse } from './helpers';

function toFileItem(file: (typeof mockEvidenceFiles)[0]): EvidenceFileItem {
  return {
    id: file.id,
    fileName: file.originalFilename ?? `${file.id}.${file.fileType.toLowerCase()}`,
    fileType: file.fileType,
    fileSize: Number(file.fileSize),
    sha256Hash: file.sha256Hash,
    integrityStatus: VerificationStatus.VALID,
    downloadUrl: `/api/evidence/files/${file.id}/download`,
    createdAt: file.createdAt.toISOString(),
  };
}

export const mockEvidenceService = {
  async getAll(
    filter: PaginatedRequest & { investigationId?: string } = {}
  ): Promise<PaginatedResponse<EvidenceFileItem>> {
    await delay();
    let filtered = [...mockEvidenceFiles];

    if (filter.investigationId) {
      filtered = filtered.filter(
        (e) => e.investigationId === filter.investigationId
      );
    }

    const sortOrder = filter.order ?? 'desc';
    filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    const items = filtered.map(toFileItem);
    return wrapPaginated(items, filter.limit ?? 20, filter.cursor);
  },

  async getById(id: string): Promise<ApiResponse<EvidenceDetailData> | null> {
    await delay();
    const file = mockEvidenceFiles.find((e) => e.id === id);
    if (!file) return null;

    const relatedFiles = mockEvidenceFiles.filter(
      (e) => e.investigationId === file.investigationId
    );

    const detail: EvidenceDetailData = {
      id: file.id,
      investigationId: file.investigationId,
      files: relatedFiles.map(toFileItem),
      integrityStatus: 'VERIFIED',
      lastVerifiedAt: new Date().toISOString(),
      chainOfCustody: [
        {
          id: `audit-evi-${file.id}`,
          eventType: 'evidence_collected',
          actorId: null,
          actorRole: null,
          resourceType: 'EvidenceFile',
          resourceId: file.id,
          action: 'CREATE',
          details: { stage: file.stage },
          ipAddress: null,
          timestamp: file.createdAt.toISOString(),
        },
      ],
    };

    return wrapResponse(detail);
  },

  async verify(
    id: string
  ): Promise<ApiResponse<VerifyEvidenceResponseData> | null> {
    await delay(200);
    const file = mockEvidenceFiles.find((e) => e.id === id);
    if (!file) return null;

    const relatedFiles = mockEvidenceFiles.filter(
      (e) => e.investigationId === file.investigationId
    );

    const result: VerifyEvidenceResponseData = {
      evidenceId: id,
      overallStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'system',
      hashVerification: {
        status: 'PASSED',
        totalFiles: relatedFiles.length,
        verifiedFiles: relatedFiles.length,
        failedFiles: 0,
        details: relatedFiles.map((f) => ({
          fileName:
            f.originalFilename ?? `${f.id}.${f.fileType.toLowerCase()}`,
          expectedHash: f.sha256Hash,
          actualHash: f.sha256Hash,
          status: 'MATCH' as const,
        })),
      },
      openTimestamps: {
        status: 'VERIFIED',
        blockHeight: 890123,
        blockTimestamp: '2026-03-13T23:45:00Z',
        confirmations: 6,
      },
      rfc3161: {
        status: 'VERIFIED',
        tsaServer: 'http://timestamp.digicert.com',
        genTime: new Date().toISOString(),
        serialNumber: `TS-${Date.now()}`,
      },
    };

    return wrapResponse(result);
  },

  async getReport(
    investigationId: string
  ): Promise<ApiResponse<CreateReportResponseData>> {
    await delay(300);
    return wrapResponse({
      reportId: `report-${investigationId}-${Date.now()}`,
      statusUrl: `/api/evidence/${investigationId}/report/status`,
      estimatedCompletionAt: new Date(Date.now() + 30000).toISOString(),
    });
  },
};
