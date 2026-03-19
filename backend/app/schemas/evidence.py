"""증거 파일 목록 응답 스키마"""

from datetime import datetime
from typing import Optional

from app.schemas.common import CamelModel


class EvidenceListItemResponse(CamelModel):
    """GET /api/v1/evidence 목록 항목"""

    id: str
    investigation_id: str
    file_type: str
    stage: int
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    sha256_hash: Optional[str] = None
    original_filename: Optional[str] = None
    integrity_status: str = "PENDING"  # hash_records 기반 판정
    created_at: datetime
