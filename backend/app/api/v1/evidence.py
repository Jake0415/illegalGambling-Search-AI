"""증거 파일 목록 조회 API"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.models.enums import EvidenceFileType, VerificationStatus
from app.models.evidence import EvidenceFile, HashRecord
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.schemas.evidence import EvidenceListItemResponse

router = APIRouter()


def _determine_integrity_status(hash_records: list) -> str:
    """해시 레코드들의 검증 상태를 종합하여 무결성 상태를 결정합니다."""
    if not hash_records:
        return VerificationStatus.PENDING.value

    statuses = [hr.verification_status for hr in hash_records]

    # 하나라도 INVALID면 INVALID
    if VerificationStatus.INVALID in statuses:
        return VerificationStatus.INVALID.value

    # 모두 VALID면 VALID
    if all(s == VerificationStatus.VALID for s in statuses):
        return VerificationStatus.VALID.value

    # 나머지는 PENDING
    return VerificationStatus.PENDING.value


@router.get("", response_model=PaginatedResponse[EvidenceListItemResponse])
async def list_evidence(
    file_type: Optional[EvidenceFileType] = Query(None, description="파일 유형 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: AsyncSession = Depends(get_db),
):
    """증거 파일 목록을 페이지네이션하여 조회합니다. 해시 레코드를 조인하여 무결성 상태를 판정합니다."""

    # 기본 쿼리 — hash_records eager load
    query = select(EvidenceFile).options(joinedload(EvidenceFile.hash_records))

    # 카운트 쿼리
    count_query = select(func.count(EvidenceFile.id))

    # 필터 적용
    if file_type is not None:
        query = query.where(EvidenceFile.file_type == file_type)
        count_query = count_query.where(EvidenceFile.file_type == file_type)

    # 전체 건수 조회
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 정렬 + 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(EvidenceFile.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    evidence_files = result.scalars().unique().all()

    # 응답 매핑
    items = [
        EvidenceListItemResponse(
            id=ef.id,
            investigation_id=ef.investigation_id,
            file_type=ef.file_type.value,
            stage=ef.stage,
            file_path=ef.file_path,
            file_size=ef.file_size,
            mime_type=ef.mime_type,
            sha256_hash=ef.sha256_hash,
            original_filename=ef.original_filename,
            integrity_status=_determine_integrity_status(ef.hash_records),
            created_at=ef.created_at,
        )
        for ef in evidence_files
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
