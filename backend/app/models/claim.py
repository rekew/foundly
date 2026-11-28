# Python Modules
import enum
from datetime import datetime
from typing import TYPE_CHECKING

# Database Modules
from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Project Modules
from app.database.base import Base

if TYPE_CHECKING:
    # Project Modules
    from app.models.item import Item
    from app.models.user import User


class ClaimStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), index=True, nullable=False
    )
    claimant_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ClaimStatus] = mapped_column(
        Enum(
            ClaimStatus,
            name="claim_status",
            native_enum=False,
            length=32,
            create_constraint=True,
        ),
        default=ClaimStatus.pending,
        server_default=ClaimStatus.pending.value,
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    item: Mapped["Item"] = relationship(back_populates="claims", lazy="raise")
    claimant: Mapped["User"] = relationship(lazy="raise")
