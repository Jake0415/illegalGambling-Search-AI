"""수동 개입 큐 모델"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
from app.models.enums import InterventionStatus, InterventionType

if TYPE_CHECKING:
    from app.models.investigation import Investigation
    from app.models.user import User


class ManualInterventionQueue(Base, TimestampMixin):
    __tablename__ = "manual_intervention_queues"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    investigation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investigations.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[InterventionType] = mapped_column(
        Enum(InterventionType), nullable=False
    )
    status: Mapped[InterventionStatus] = mapped_column(
        Enum(InterventionStatus),
        nullable=False,
        default=InterventionStatus.PENDING,
    )
    cdp_session_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    screenshot_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assigned_to_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    investigation: Mapped["Investigation"] = relationship(
        back_populates="manual_interventions"
    )
    assigned_to: Mapped[Optional["User"]] = relationship(
        foreign_keys=[assigned_to_id]
    )

    __table_args__ = (
        Index("ix_manual_intervention_queues_investigation_id", "investigation_id"),
        Index("ix_manual_intervention_queues_status", "status"),
        Index("ix_manual_intervention_queues_assigned_to_id", "assigned_to_id"),
    )
