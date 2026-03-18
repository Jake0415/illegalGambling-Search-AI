"""수사(Investigation) 모델"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, generate_uuid
from app.models.enums import InvestigationStatus

if TYPE_CHECKING:
    from app.models.evidence import EvidenceFile
    from app.models.intervention import ManualInterventionQueue
    from app.models.site import Site
    from app.models.sms import SmsNumber
    from app.models.user import User


class Investigation(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[InvestigationStatus] = mapped_column(
        Enum(InvestigationStatus),
        nullable=False,
        default=InvestigationStatus.QUEUED,
    )
    current_stage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    proxy_used: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    browser_fingerprint: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_by_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    batch_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Relationships
    site: Mapped["Site"] = relationship(back_populates="investigations")
    created_by: Mapped[Optional["User"]] = relationship(
        back_populates="investigations", foreign_keys=[created_by_id]
    )
    evidence_files: Mapped[list["EvidenceFile"]] = relationship(
        back_populates="investigation"
    )
    sms_numbers: Mapped[list["SmsNumber"]] = relationship(
        back_populates="investigation"
    )
    manual_interventions: Mapped[list["ManualInterventionQueue"]] = relationship(
        back_populates="investigation"
    )

    __table_args__ = (
        Index("ix_investigations_site_id", "site_id"),
        Index("ix_investigations_status", "status"),
        Index("ix_investigations_created_by_id", "created_by_id"),
        Index("ix_investigations_batch_id", "batch_id"),
    )
