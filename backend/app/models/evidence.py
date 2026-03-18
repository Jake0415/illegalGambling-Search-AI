"""증거 관련 모델: EvidenceFile, HashRecord, Timestamp"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
from app.models.enums import (
    EvidenceFileType,
    HashAlgorithm,
    TimestampType,
    VerificationStatus,
)

if TYPE_CHECKING:
    from app.models.investigation import Investigation


class EvidenceFile(Base, TimestampMixin):
    __tablename__ = "evidence_files"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    investigation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investigations.id", ondelete="CASCADE"),
        nullable=False,
    )
    file_type: Mapped[EvidenceFileType] = mapped_column(
        Enum(EvidenceFileType), nullable=False
    )
    stage: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    original_filename: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    investigation: Mapped["Investigation"] = relationship(
        back_populates="evidence_files"
    )
    hash_records: Mapped[list["HashRecord"]] = relationship(
        back_populates="evidence_file", cascade="all, delete-orphan"
    )
    timestamps: Mapped[list["EvidenceTimestamp"]] = relationship(
        back_populates="evidence_file", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_evidence_files_investigation_id", "investigation_id"),
        Index("ix_evidence_files_file_type", "file_type"),
        Index("ix_evidence_files_sha256_hash", "sha256_hash"),
    )


class HashRecord(Base, TimestampMixin):
    __tablename__ = "hash_records"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    evidence_file_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("evidence_files.id", ondelete="CASCADE"),
        nullable=False,
    )
    algorithm: Mapped[HashAlgorithm] = mapped_column(
        Enum(HashAlgorithm), nullable=False
    )
    hash_value: Mapped[str] = mapped_column(String(128), nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus),
        nullable=False,
        default=VerificationStatus.PENDING,
    )

    # Relationships
    evidence_file: Mapped["EvidenceFile"] = relationship(
        back_populates="hash_records"
    )

    __table_args__ = (
        Index("ix_hash_records_evidence_file_id", "evidence_file_id"),
    )


class EvidenceTimestamp(Base, TimestampMixin):
    __tablename__ = "evidence_timestamps"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    evidence_file_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("evidence_files.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[TimestampType] = mapped_column(
        Enum(TimestampType), nullable=False
    )
    timestamp_value: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    proof_file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus),
        nullable=False,
        default=VerificationStatus.PENDING,
    )

    # Relationships
    evidence_file: Mapped["EvidenceFile"] = relationship(
        back_populates="timestamps"
    )

    __table_args__ = (
        Index("ix_evidence_timestamps_evidence_file_id", "evidence_file_id"),
    )
