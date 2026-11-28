# Python Modules
from typing import Optional

# Database Modules
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

# Project Modules
from app.models.item import Item, ItemCategory, ItemStatus
from app.models.user import User
from app.schemas.item import ItemCreate, ItemUpdate
from app.services.errors import NotFoundError, PermissionDeniedError


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


async def list_items(
    db: AsyncSession,
    *,
    q: Optional[str] = None,
    category: Optional[ItemCategory] = None,
    status: Optional[ItemStatus] = None,
    finder_id: Optional[int] = None,
    limit: int = 12,
    offset: int = 0,
) -> tuple[list[Item], int]:
    conditions = []
    if q and q.strip():
        pattern = f"%{_escape_like(q.strip().lower())}%"
        conditions.append(
            or_(
                func.lower(Item.title).like(pattern, escape="\\"),
                func.lower(Item.description).like(pattern, escape="\\"),
                func.lower(Item.location).like(pattern, escape="\\"),
            )
        )
    if category is not None:
        conditions.append(Item.category == category)
    if status is not None:
        conditions.append(Item.status == status)
    if finder_id is not None:
        conditions.append(Item.finder_id == finder_id)

    total = await db.scalar(select(func.count(Item.id)).where(*conditions))
    result = await db.execute(
        select(Item)
        .where(*conditions)
        .order_by(Item.found_on.desc(), Item.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all()), total or 0


async def get_item(db: AsyncSession, item_id: int) -> Item:
    item = await db.get(Item, item_id)
    if item is None:
        raise NotFoundError("Item not found")
    return item


async def get_owned_item(db: AsyncSession, item_id: int, user: User) -> Item:
    item = await get_item(db, item_id)
    if item.finder_id != user.id:
        raise PermissionDeniedError("Only the finder can manage this item")
    return item


async def create_item(db: AsyncSession, payload: ItemCreate, finder: User) -> Item:
    data = payload.model_dump()
    if data["image_url"] is not None:
        data["image_url"] = str(data["image_url"])
    item = Item(**data, finder_id=finder.id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_item(
    db: AsyncSession, item_id: int, payload: ItemUpdate, user: User
) -> Item:
    item = await get_owned_item(db, item_id, user)
    data = payload.model_dump(exclude_unset=True)
    if "image_url" in data and data["image_url"] is not None:
        data["image_url"] = str(data["image_url"])
    for field, value in data.items():
        if value is None and field != "image_url":
            continue
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item_id: int, user: User) -> None:
    item = await get_owned_item(db, item_id, user)
    await db.delete(item)
    await db.commit()
