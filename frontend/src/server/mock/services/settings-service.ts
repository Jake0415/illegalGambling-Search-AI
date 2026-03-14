// ============================================================================
// Mock 시스템 설정 서비스
// ============================================================================

import type {
  ApiResponse,
  PaginatedResponse,
  SettingUpdateResult,
  SystemSettingItem,
  UpdateSystemSettingsRequest,
} from '@/types/api';
import { delay, wrapPaginated, wrapResponse } from './helpers';

interface SettingRecord extends SystemSettingItem {
  id: string;
}

let settings: SettingRecord[] = [
  {
    id: 'setting-001',
    key: 'max_concurrent_investigations',
    value: 5,
    description: '동시 실행 가능한 최대 채증 수',
    type: 'number',
    defaultValue: 5,
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-002',
    key: 'investigation_timeout_seconds',
    value: 1800,
    description: '채증 작업 최대 실행 시간 (초)',
    type: 'number',
    defaultValue: 1800,
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-003',
    key: 'max_retry_count',
    value: 3,
    description: '채증 실패 시 최대 재시도 횟수',
    type: 'number',
    defaultValue: 3,
    updatedAt: '2026-02-15T14:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-004',
    key: 'proxy_rotation_enabled',
    value: true,
    description: '프록시 자동 로테이션 활성화',
    type: 'boolean',
    defaultValue: true,
    updatedAt: '2026-03-05T09:00:00Z',
    updatedBy: 'user-002',
  },
  {
    id: 'setting-005',
    key: 'screenshot_quality',
    value: 90,
    description: '스크린샷 품질 (1-100)',
    type: 'number',
    defaultValue: 85,
    updatedAt: '2026-02-20T11:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-006',
    key: 'auto_classification_enabled',
    value: true,
    description: 'AI 자동 분류 활성화',
    type: 'boolean',
    defaultValue: true,
    updatedAt: '2026-03-10T08:00:00Z',
    updatedBy: 'user-002',
  },
  {
    id: 'setting-007',
    key: 'classification_confidence_threshold',
    value: 0.8,
    description: '자동 분류 확신도 임계값',
    type: 'number',
    defaultValue: 0.8,
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-008',
    key: 'domain_check_interval_hours',
    value: 24,
    description: '도메인 상태 확인 주기 (시간)',
    type: 'number',
    defaultValue: 24,
    updatedAt: '2026-02-28T16:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-009',
    key: 'sms_provider_priority',
    value: ['PVAPINS', 'GRIZZLYSMS', 'SMS_ACTIVATE'],
    description: 'SMS 제공자 우선순위',
    type: 'array',
    defaultValue: ['PVAPINS', 'GRIZZLYSMS', 'SMS_ACTIVATE'],
    updatedAt: '2026-03-05T09:00:00Z',
    updatedBy: 'user-002',
  },
  {
    id: 'setting-010',
    key: 'notification_slack_webhook',
    value: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    description: 'Slack 알림 웹훅 URL',
    type: 'string',
    defaultValue: '',
    updatedAt: '2026-03-08T13:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-011',
    key: 'evidence_retention_days',
    value: 365,
    description: '증거 파일 보존 기간 (일)',
    type: 'number',
    defaultValue: 365,
    updatedAt: '2026-02-01T10:00:00Z',
    updatedBy: 'user-001',
  },
  {
    id: 'setting-012',
    key: 'captcha_solver_provider',
    value: '2captcha',
    description: 'CAPTCHA 풀이 서비스 제공자',
    type: 'string',
    defaultValue: '2captcha',
    updatedAt: '2026-03-01T10:00:00Z',
    updatedBy: 'user-002',
  },
];

export const mockSettingsService = {
  async getAll(): Promise<PaginatedResponse<SystemSettingItem>> {
    await delay();
    const items: SystemSettingItem[] = settings.map(
      ({ id: _id, ...rest }) => rest
    );
    return wrapPaginated(
      items.map((item, i) => ({ ...item, id: settings[i].id })),
      100
    );
  },

  async update(
    req: UpdateSystemSettingsRequest
  ): Promise<ApiResponse<SettingUpdateResult[]>> {
    await delay();
    const results: SettingUpdateResult[] = [];

    for (const update of req.settings) {
      const idx = settings.findIndex((s) => s.key === update.key);
      if (idx >= 0) {
        const prev = settings[idx].value;
        settings[idx].value = update.value;
        settings[idx].updatedAt = new Date().toISOString();
        settings[idx].updatedBy = 'user-001';

        results.push({
          key: update.key,
          previousValue: prev,
          newValue: update.value,
          updatedAt: settings[idx].updatedAt,
          updatedBy: 'user-001',
        });
      }
    }

    return wrapResponse(results);
  },

  _reset() {
    settings = settings.map((s) => ({ ...s }));
  },
};
