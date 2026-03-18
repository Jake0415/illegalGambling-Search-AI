"""사이트 모델"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, Index, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid
from app.models.enums import SiteCategory, SiteStatus

if TYPE_CHECKING:
    from app.models.detection import ClassificationResult, DetectionResult
    from app.models.domain import DomainHistory
    from app.models.investigation import Investigation
    from app.models.system import PopupPattern


class Site(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    url: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[SiteStatus] = mapped_column(
        Enum(SiteStatus), nullable=False, default=SiteStatus.ACTIVE
    )
    category: Mapped[Optional[SiteCategory]] = mapped_column(
        Enum(SiteCategory), nullable=True
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    first_detected_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    tags: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    whois_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    dns_records: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    login_required: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )

    # Relationships
    investigations: Mapped[list["Investigation"]] = relationship(
        back_populates="site"
    )
    detection_results: Mapped[list["DetectionResult"]] = relationship(
        back_populates="site"
    )
    classification_results: Mapped[list["ClassificationResult"]] = relationship(
        back_populates="site"
    )
    domain_history: Mapped[list["DomainHistory"]] = relationship(
        back_populates="site"
    )
    popup_patterns: Mapped[list["PopupPattern"]] = relationship(
        back_populates="site"
    )

    __table_args__ = (
        Index("ix_sites_domain", "domain"),
        Index("ix_sites_status", "status"),
        Index("ix_sites_category", "category"),
    )
