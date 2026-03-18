"""도메인 관련 모델: DomainHistory, DomainCluster, SiteDomainCluster"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
from app.models.enums import DomainStatus

if TYPE_CHECKING:
    from app.models.site import Site


class DomainHistory(Base, TimestampMixin):
    __tablename__ = "domain_histories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    dns_records: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    status: Mapped[DomainStatus] = mapped_column(
        Enum(DomainStatus), nullable=False
    )
    checked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    response_time_ms: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    redirect_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    site: Mapped["Site"] = relationship(back_populates="domain_history")

    __table_args__ = (
        Index("ix_domain_histories_site_id", "site_id"),
        Index("ix_domain_histories_domain", "domain"),
        Index("ix_domain_histories_status", "status"),
    )


class DomainCluster(Base, TimestampMixin):
    __tablename__ = "domain_clusters"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    site_links: Mapped[list["SiteDomainCluster"]] = relationship(
        back_populates="cluster", cascade="all, delete-orphan"
    )


class SiteDomainCluster(Base, TimestampMixin):
    """Site-DomainCluster 다대다 연결 테이블 (복합 PK)"""

    __tablename__ = "site_domain_clusters"

    site_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sites.id", ondelete="CASCADE"),
        primary_key=True,
    )
    cluster_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("domain_clusters.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Relationships
    site: Mapped["Site"] = relationship()
    cluster: Mapped["DomainCluster"] = relationship(back_populates="site_links")

    __table_args__ = (
        Index("ix_site_domain_clusters_site_id", "site_id"),
        Index("ix_site_domain_clusters_cluster_id", "cluster_id"),
    )
