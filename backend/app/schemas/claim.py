# Python Modules
from datetime import datetime
from typing import Optional

# Validation Modules
from pydantic import BaseModel, ConfigDict, Field, field_validator

# Project Modules
from app.models.claim import ClaimStatus
from app.schemas.item import ItemRead


class ClaimCreate(BaseModel):
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("message", mode="before")
    @classmethod
    def strip_message(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class ClaimRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    claimant_id: int
    message: str
    status: ClaimStatus
    created_at: datetime


class ItemClaimRead(ClaimRead):
    """A claim as seen by the finder of the item."""

    claimant_email: str


class MyClaimRead(ClaimRead):
    """A claim as seen by the claimant. Finder contact is shared once approved."""

    item: ItemRead
    finder_email: Optional[str] = None
