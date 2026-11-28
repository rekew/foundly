# Python Modules
from datetime import date, datetime
from typing import Optional

# Validation Modules
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

# Project Modules
from app.models.item import ItemCategory, ItemStatus


def _not_in_future(value: Optional[date]) -> Optional[date]:
    if value is not None and value > date.today():
        raise ValueError("found_on cannot be in the future")
    return value


def _strip(value: Optional[str]) -> Optional[str]:
    return value.strip() if isinstance(value, str) else value


class ItemBase(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=2000)
    category: ItemCategory
    location: str = Field(min_length=2, max_length=200)
    found_on: date
    image_url: Optional[HttpUrl] = None

    _strip_text = field_validator("title", "description", "location", mode="before")(
        _strip
    )
    _check_date = field_validator("found_on")(_not_in_future)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=120)
    description: Optional[str] = Field(default=None, min_length=10, max_length=2000)
    category: Optional[ItemCategory] = None
    location: Optional[str] = Field(default=None, min_length=2, max_length=200)
    found_on: Optional[date] = None
    image_url: Optional[HttpUrl] = None
    status: Optional[ItemStatus] = None

    _strip_text = field_validator("title", "description", "location", mode="before")(
        _strip
    )
    _check_date = field_validator("found_on")(_not_in_future)


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: ItemCategory
    location: str
    found_on: date
    image_url: Optional[str]
    status: ItemStatus
    finder_id: int
    created_at: datetime


class ItemPage(BaseModel):
    items: list[ItemRead]
    total: int
    limit: int
    offset: int
