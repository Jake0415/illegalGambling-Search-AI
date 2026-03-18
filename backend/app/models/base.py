"""공통 모델 베이스 및 Mixin"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7


def generate_uuid() -> str:
    """UUID v7 기반 고유 식별자 생성"""
    return str(uuid7())


class TimestampMixin:
    """생성/수정 타임스탬프 자동 관리 Mixin"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """논리 삭제 Mixin"""

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
