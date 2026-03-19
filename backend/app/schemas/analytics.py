"""대시보드 / 분석 응답 스키마"""

from typing import Optional

from pydantic import BaseModel


class NewSitesCount(BaseModel):
    """신규 사이트 수 (오늘/이번 주/이번 달)"""

    today: int
    this_week: int
    this_month: int


class InvestigationCounts(BaseModel):
    """채증 상태별 카운트"""

    in_progress: int
    completed: int
    failed: int
    queued: int


class SuccessRates(BaseModel):
    """단계별 성공률"""

    stage1: float
    stage3: float


class ManualQueueInfo(BaseModel):
    """수동 개입 큐 정보"""

    pending: int
    avg_wait_time: float


class SystemInfo(BaseModel):
    """시스템 상태 정보"""

    uptime: float
    last_incident: Optional[str] = None


class ExternalServiceItem(BaseModel):
    """외부 서비스 상태"""

    status: str
    balance: Optional[float] = None
    active_ips: Optional[int] = None


class ExternalServicesInfo(BaseModel):
    """외부 서비스들 상태"""

    sms_provider: ExternalServiceItem
    captcha_solver: ExternalServiceItem
    proxy: ExternalServiceItem


class DashboardSummaryResponse(BaseModel):
    """GET /api/v1/analytics/overview 응답 — DashboardSummaryData 호환"""

    total_sites: int
    new_sites: NewSitesCount
    investigations: InvestigationCounts
    success_rates: SuccessRates
    manual_queue: ManualQueueInfo
    system: SystemInfo
    external_services: ExternalServicesInfo

    class Config:
        # 프론트엔드 camelCase 키와 호환
        populate_by_name = True
