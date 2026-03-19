"""채증(Investigation) 목록 응답 스키마"""

from datetime import datetime
from typing import Optional

from app.schemas.common import CamelModel


class InvestigationListItemResponse(CamelModel):
    """GET /api/v1/investigations 목록 항목"""

    id: str
    site_id: str
    site_url: str  # Site 조인
    status: str
    current_stage: Optional[int] = None
    progress: int  # 상태 기반 계산값 (0~100)
    retry_count: int = 0
    created_by: Optional[str] = None  # User.name 조인
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
