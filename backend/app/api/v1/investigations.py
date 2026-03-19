"""채증(Investigation) 목록 조회 API"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.models.enums import InvestigationStatus
from app.models.investigation import Investigation
from app.models.site import Site
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.schemas.investigation import InvestigationListItemResponse

router = APIRouter()


def _calc_progress(status: InvestigationStatus) -> int:
    """채증 상태에 따른 진행률 계산"""
    progress_map = {
        InvestigationStatus.QUEUED: 0,
        InvestigationStatus.IN_PROGRESS: 10,
        InvestigationStatus.STAGE_1_COMPLETE: 30,
        InvestigationStatus.STAGE_2_COMPLETE: 60,
        InvestigationStatus.STAGE_3_COMPLETE: 90,
        InvestigationStatus.COMPLETED: 100,
        InvestigationStatus.FAILED: 0,
        InvestigationStatus.CANCELLED: 0,
    }
    return progress_map.get(status, 0)


@router.get("", response_model=PaginatedResponse[InvestigationListItemResponse])
async def list_investigations(
    status: Optional[InvestigationStatus] = Query(None, description="채증 상태 필터"),
    search: Optional[str] = Query(None, description="사이트 URL 검색어"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: AsyncSession = Depends(get_db),
):
    """채증 목록을 페이지네이션하여 조회합니다. Site URL과 생성자 이름을 조인합니다."""

    # 기본 쿼리 — Site, User 조인
    query = (
        select(Investigation)
        .join(Site, Investigation.site_id == Site.id)
        .outerjoin(User, Investigation.created_by_id == User.id)
        .options(joinedload(Investigation.site), joinedload(Investigation.created_by))
        .where(Investigation.deleted_at.is_(None))
    )

    # 카운트 쿼리
    count_query = (
        select(func.count(Investigation.id))
        .join(Site, Investigation.site_id == Site.id)
        .where(Investigation.deleted_at.is_(None))
    )

    # 필터 적용
    if status is not None:
        query = query.where(Investigation.status == status)
        count_query = count_query.where(Investigation.status == status)

    if search:
        like_pattern = f"%{search}%"
        query = query.where(Site.url.ilike(like_pattern))
        count_query = count_query.where(Site.url.ilike(like_pattern))

    # 전체 건수 조회
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 정렬 + 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(Investigation.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    investigations = result.scalars().unique().all()

    # 응답 매핑
    items = [
        InvestigationListItemResponse(
            id=inv.id,
            site_id=inv.site_id,
            site_url=inv.site.url if inv.site else "",
            status=inv.status.value,
            current_stage=inv.current_stage,
            progress=_calc_progress(inv.status),
            retry_count=inv.retry_count,
            created_by=inv.created_by.name if inv.created_by else None,
            created_at=inv.created_at,
            started_at=inv.started_at,
            completed_at=inv.completed_at,
        )
        for inv in investigations
    ]

    return PaginatedResponse(
        data=items,
        pagination=PaginationInfo(
            total=total,
            page=page,
            limit=limit,
            has_next=(offset + limit) < total,
        ),
    )
