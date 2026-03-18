"""시스템 설정 관련 모델: SystemSetting, PopupPattern"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.site import Site
    from app.models.user import User


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    value: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_by_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    updated_by: Mapped[Optional["User"]] = relationship(
        foreign_keys=[updated_by_id]
    )

    __table_args__ = (
        Index("ix_system_settings_key", "key"),
    )


class PopupPattern(Base, TimestampMixin):
    __tablename__ = "popup_patterns"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    site_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=True
    )
    pattern_type: Mapped[str] = mapped_column(String(100), nullable=False)
    css_selector: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    close_button_selector: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    success_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fail_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    site: Mapped[Optional["Site"]] = relationship(back_populates="popup_patterns")

    __table_args__ = (
        Index("ix_popup_patterns_site_id", "site_id"),
        Index("ix_popup_patterns_pattern_type", "pattern_type"),
    )
