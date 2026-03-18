"""SMS 관련 모델: SmsNumber, SmsMessage"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
from app.models.enums import SmsNumberStatus, SmsProvider

if TYPE_CHECKING:
    from app.models.investigation import Investigation


class SmsNumber(Base, TimestampMixin):
    __tablename__ = "sms_numbers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    country_code: Mapped[str] = mapped_column(
        String(5), nullable=False, default="+82"
    )
    provider: Mapped[SmsProvider] = mapped_column(
        Enum(SmsProvider), nullable=False
    )
    status: Mapped[SmsNumberStatus] = mapped_column(
        Enum(SmsNumberStatus), nullable=False, default=SmsNumberStatus.ACTIVE
    )
    investigation_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("investigations.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expired_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cost_usd: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4), nullable=True
    )

    # Relationships
    investigation: Mapped[Optional["Investigation"]] = relationship(
        back_populates="sms_numbers"
    )
    messages: Mapped[list["SmsMessage"]] = relationship(
        back_populates="sms_number", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_sms_numbers_phone_number", "phone_number"),
        Index("ix_sms_numbers_investigation_id", "investigation_id"),
        Index("ix_sms_numbers_status", "status"),
    )


class SmsMessage(Base, TimestampMixin):
    __tablename__ = "sms_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    sms_number_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sms_numbers.id", ondelete="CASCADE"),
        nullable=False,
    )
    message_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    otp_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    received_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    parsed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    sms_number: Mapped["SmsNumber"] = relationship(back_populates="messages")

    __table_args__ = (
        Index("ix_sms_messages_sms_number_id", "sms_number_id"),
    )
