// ============================================================================
// Prisma Seed Script
// 기본 시스템 설정 키만 시드 (슈퍼어드민은 초기 설정 위저드에서 생성)
// ============================================================================

import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

/** 초기 시스템 설정 시드 데이터 */
const defaultSystemSettings = [
  {
    key: 'browser.maxConcurrency',
    value: 5,
    description: '동시 실행 가능한 브라우저 인스턴스 최대 수',
  },
  {
    key: 'browser.navigationTimeout',
    value: 30000,
    description: '페이지 네비게이션 타임아웃 (밀리초)',
  },
  {
    key: 'browser.defaultViewport',
    value: { width: 1920, height: 1080 },
    description: '기본 브라우저 뷰포트 크기',
  },
  {
    key: 'investigation.maxRetryCount',
    value: 3,
    description: '채증 실패 시 최대 재시도 횟수',
  },
  {
    key: 'investigation.stageTimeoutSeconds',
    value: 300,
    description: '채증 단계별 타임아웃 (초)',
  },
  {
    key: 'sms.providerPriority',
    value: ['PVAPINS', 'GRIZZLYSMS', 'SMS_ACTIVATE'],
    description: 'SMS 제공자 우선순위 (1순위부터)',
  },
  {
    key: 'sms.otpWaitTimeoutSeconds',
    value: 120,
    description: 'OTP 수신 대기 타임아웃 (초)',
  },
  {
    key: 'captcha.timeoutSeconds',
    value: 300,
    description: 'CAPTCHA 수동 개입 대기 타임아웃 (초)',
  },
  {
    key: 'cost.monthlyLimitUsd',
    value: 2000,
    description: '월간 비용 한도 (USD)',
  },
  {
    key: 'cost.smsAlertThresholdUsd',
    value: 500,
    description: 'SMS 비용 알림 임계값 (USD)',
  },
  {
    key: 'detection.googleSearchDailyLimit',
    value: 100,
    description: 'Google Custom Search API 일일 쿼리 한도',
  },
  {
    key: 'detection.crawlDepth',
    value: 2,
    description: '크롤링 최대 깊이',
  },
  {
    key: 'domain.checkIntervalMinutes',
    value: 30,
    description: '도메인 생존 체크 주기 (분)',
  },
  {
    key: 'domain.deadThresholdCount',
    value: 3,
    description: '연속 DEAD 횟수 임계값 (초과 시 INACTIVE 전환)',
  },
  {
    key: 'notification.slackEnabled',
    value: true,
    description: 'Slack 알림 활성화 여부',
  },
  {
    key: 'notification.emailEnabled',
    value: true,
    description: '이메일 알림 활성화 여부',
  },
  {
    key: 'evidence.s3Bucket',
    value: 'illegal-gambling-evidence',
    description: '증거 파일 저장 S3 버킷명',
  },
  {
    key: 'evidence.maxFileSizeMb',
    value: 500,
    description: '증거 파일 최대 크기 (MB)',
  },
  {
    key: 'session.maxAgeSeconds',
    value: 1800,
    description: '세션 타임아웃 (초, 기본 30분)',
  },
  {
    key: 'audit.hashChainEnabled',
    value: true,
    description: '감사 로그 해시 체인 활성화 여부',
  },
]

async function main() {
  console.log('Seeding default system settings...')

  for (const setting of defaultSystemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    })
    console.log(`  [OK] ${setting.key}`)
  }

  console.log(`\nSeeded ${defaultSystemSettings.length} system settings.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
