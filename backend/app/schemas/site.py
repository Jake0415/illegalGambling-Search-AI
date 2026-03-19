"""사이트 목록 응답 스키마"""

from datetime import datetime
from typing import Any, Optional

from app.schemas.common import CamelModel


class SiteListItemResponse(CamelModel):
    """GET /api/v1/sites 목록 항목"""

    id: str
    url: str
    domain: str
    status: str
    category: Optional[str] = None
    confidence_score: Optional[float] = None
    last_checked_at: Optional[datetime] = None
    investigation_count: int = 0
    tags: Optional[Any] = None
    created_at: datetime
