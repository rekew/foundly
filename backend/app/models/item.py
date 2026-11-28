# Python Modules
import enum
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

# Database Modules
from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Project Modules
from app.database.base import Base

if TYPE_CHECKING:
    # Project Modules
    from app.models.claim import Claim
    from app.models.user import User


class ItemCategory(str, enum.Enum):
    electronics = "electronics"
    wallets = "wallets"
    keys = "keys"
    bags = "bags"
    clothing = "clothing"
    documents = "documents"
    jewelry = "jewelry"
    other = "other"


class ItemStatus(str, enum.Enum):
    open = "open"
    returned = "returned"


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ItemCategory] = mapped_column(
        Enum(
            ItemCategory,
            name="item_category",
            native_enum=False,
            length=32,
            create_constraint=True,
        ),
        index=True,
        nullable=False,
    )
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    found_on: Mapped[date] = mapped_column(Date, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    status: Mapped[ItemStatus] = mapped_column(
        Enum(
            ItemStatus,
            name="item_status",
            native_enum=False,
            length=32,
            create_constraint=True,
        ),
        default=ItemStatus.open,
        server_default=ItemStatus.open.value,
        index=True,
        nullable=False,
    )
    finder_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    finder: Mapped["User"] = relationship(lazy="raise")
    claims: Mapped[list["Claim"]] = relationship(
        back_populates="item",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )
