"""사이트 목록 조회 API"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import SiteCategory, SiteStatus
from app.models.investigation import Investigation
from app.models.site import Site
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.schemas.site import SiteListItemResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[SiteListItemResponse])
async def list_sites(
    status: Optional[SiteStatus] = Query(None, description="사이트 상태 필터"),
    category: Optional[SiteCategory] = Query(None, description="카테고리 필터"),
    search: Optional[str] = Query(None, description="URL/도메인 검색어"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: AsyncSession = Depends(get_db),
):
    """사이트 목록을 페이지네이션하여 조회합니다."""

    # 조사 건수 서브쿼리
    inv_count_subq = (
        select(func.count(Investigation.id))
        .where(Investigation.site_id == Site.id)
        .correlate(Site)
        .scalar_subquery()
    )

    # 기본 쿼리
    query = select(
        Site,
        inv_count_subq.label("investigation_count"),
    ).where(Site.deleted_at.is_(None))

    # 카운트 쿼리
    count_query = select(func.count(Site.id)).where(Site.deleted_at.is_(None))

    # 필터 적용
    if status is not None:
        query = query.where(Site.status == status)
        count_query = count_query.where(Site.status == status)

    if category is not None:
        query = query.where(Site.category == category)
        count_query = count_query.where(Site.category == category)

    if search:
        like_pattern = f"%{search}%"
        search_filter = Site.url.ilike(like_pattern) | Site.domain.ilike(like_pattern)
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    # 전체 건수 조회
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 정렬 + 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(Site.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    # 응답 매핑
    items = [
        SiteListItemResponse(
            id=site.id,
            url=site.url,
            domain=site.domain,
            status=site.status.value,
            category=site.category.value if site.category else None,
            confidence_score=site.confidence_score,
            last_checked_at=site.last_checked_at,
            investigation_count=inv_count,
            tags=site.tags,
            created_at=site.created_at,
        )
        for site, inv_count in rows
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
