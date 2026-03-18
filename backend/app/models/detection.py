"""탐지 관련 모델: Keyword, DetectionResult, ClassificationResult"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
from app.models.enums import (
    ClassificationModel,
    DetectionSource,
    ReviewStatus,
    SiteCategory,
)

if TYPE_CHECKING:
    from app.models.site import Site
    from app.models.user import User


class Keyword(Base, TimestampMixin):
    __tablename__ = "keywords"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    keyword: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    detection_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    created_by_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    created_by: Mapped[Optional["User"]] = relationship(
        foreign_keys=[created_by_id]
    )
    detection_results: Mapped[list["DetectionResult"]] = relationship(
        back_populates="keyword"
    )

    __table_args__ = (
        Index("ix_keywords_keyword", "keyword"),
        Index("ix_keywords_is_active", "is_active"),
    )


class DetectionResult(Base, TimestampMixin):
    __tablename__ = "detection_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    source: Mapped[DetectionSource] = mapped_column(
        Enum(DetectionSource), nullable=False
    )
    keyword_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("keywords.id", ondelete="SET NULL"), nullable=True
    )
    raw_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    # Relationships
    site: Mapped["Site"] = relationship(back_populates="detection_results")
    keyword: Mapped[Optional["Keyword"]] = relationship(
        back_populates="detection_results"
    )

    __table_args__ = (
        Index("ix_detection_results_site_id", "site_id"),
        Index("ix_detection_results_source", "source"),
        Index("ix_detection_results_keyword_id", "keyword_id"),
    )


class ClassificationResult(Base, TimestampMixin):
    __tablename__ = "classification_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    model: Mapped[ClassificationModel] = mapped_column(
        Enum(ClassificationModel), nullable=False
    )
    category: Mapped[Optional[SiteCategory]] = mapped_column(
        Enum(SiteCategory), nullable=True
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    evidence: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    review_status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus), nullable=False, default=ReviewStatus.PENDING
    )
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    site: Mapped["Site"] = relationship(
        back_populates="classification_results"
    )
    reviewed_by: Mapped[Optional["User"]] = relationship(
        foreign_keys=[reviewed_by_id]
    )

    __table_args__ = (
        Index("ix_classification_results_site_id", "site_id"),
        Index("ix_classification_results_model", "model"),
        Index("ix_classification_results_review_status", "review_status"),
    )
