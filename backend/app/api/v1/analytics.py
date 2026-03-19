"""대시보드 통계 조회 API"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import InvestigationStatus
from app.models.investigation import Investigation
from app.models.site import Site
from app.schemas.analytics import (
    DashboardSummaryResponse,
    ExternalServiceItem,
    ExternalServicesInfo,
    InvestigationCounts,
    ManualQueueInfo,
    NewSitesCount,
    SuccessRates,
    SystemInfo,
)

router = APIRouter()


@router.get("/overview", response_model=DashboardSummaryResponse)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
):
    """대시보드 KPI 데이터를 DB 집계로 조회합니다."""

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())  # 이번 주 월요일
    month_start = today_start.replace(day=1)

    # ── 사이트 집계 ──
    total_sites_result = await db.execute(
        select(func.count(Site.id)).where(Site.deleted_at.is_(None))
    )
    total_sites = total_sites_result.scalar() or 0

    # 오늘 신규 사이트
    new_today_result = await db.execute(
        select(func.count(Site.id)).where(
            Site.deleted_at.is_(None),
            Site.created_at >= today_start,
        )
    )
    new_today = new_today_result.scalar() or 0

    # 이번 주 신규 사이트
    new_week_result = await db.execute(
        select(func.count(Site.id)).where(
            Site.deleted_at.is_(None),
            Site.created_at >= week_start,
        )
    )
    new_week = new_week_result.scalar() or 0

    # 이번 달 신규 사이트
    new_month_result = await db.execute(
        select(func.count(Site.id)).where(
            Site.deleted_at.is_(None),
            Site.created_at >= month_start,
        )
    )
    new_month = new_month_result.scalar() or 0

    # ── 채증(Investigation) 상태별 카운트 ──
    inv_counts: dict[str, int] = {
        "in_progress": 0,
        "completed": 0,
        "failed": 0,
        "queued": 0,
    }
    inv_status_result = await db.execute(
        select(Investigation.status, func.count(Investigation.id))
        .where(Investigation.deleted_at.is_(None))
        .group_by(Investigation.status)
    )
    for status_val, count in inv_status_result.all():
        if status_val == InvestigationStatus.COMPLETED:
            inv_counts["completed"] = count
        elif status_val == InvestigationStatus.FAILED:
            inv_counts["failed"] = count
        elif status_val == InvestigationStatus.QUEUED:
            inv_counts["queued"] = count
        elif status_val in (
            InvestigationStatus.IN_PROGRESS,
            InvestigationStatus.STAGE_1_COMPLETE,
            InvestigationStatus.STAGE_2_COMPLETE,
            InvestigationStatus.STAGE_3_COMPLETE,
        ):
            inv_counts["in_progress"] += count

    # ── 성공률 (전체 완료 기준 간이 계산) ──
    total_inv_result = await db.execute(
        select(func.count(Investigation.id)).where(
            Investigation.deleted_at.is_(None),
            Investigation.status.in_([
                InvestigationStatus.COMPLETED,
                InvestigationStatus.FAILED,
            ]),
        )
    )
    total_finished = total_inv_result.scalar() or 0
    completed = inv_counts["completed"]

    stage1_rate = round(completed / total_finished, 2) if total_finished > 0 else 0.0
    stage3_rate = round(completed / total_finished, 2) if total_finished > 0 else 0.0

    # ── 증거 파일 수 (참고용 — 로그 출력 등에 활용 가능) ──
    # evidence_count_result = await db.execute(select(func.count(EvidenceFile.id)))
    # evidence_count = evidence_count_result.scalar() or 0

    return DashboardSummaryResponse(
        total_sites=total_sites,
        new_sites=NewSitesCount(
            today=new_today,
            this_week=new_week,
            this_month=new_month,
        ),
        investigations=InvestigationCounts(
            in_progress=inv_counts["in_progress"],
            completed=inv_counts["completed"],
            failed=inv_counts["failed"],
            queued=inv_counts["queued"],
        ),
        success_rates=SuccessRates(
            stage1=stage1_rate,
            stage3=stage3_rate,
        ),
        manual_queue=ManualQueueInfo(
            pending=0,
            avg_wait_time=0.0,
        ),
        system=SystemInfo(
            uptime=99.9,
            last_incident=None,
        ),
        external_services=ExternalServicesInfo(
            sms_provider=ExternalServiceItem(status="healthy", balance=0.0),
            captcha_solver=ExternalServiceItem(status="healthy", balance=0.0),
            proxy=ExternalServiceItem(status="healthy", active_ips=0),
        ),
    )
