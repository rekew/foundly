# Python Modules
from typing import Annotated, Optional

# FastAPI Modules
from fastapi import APIRouter, Depends, Query, status

# Database Modules
from sqlalchemy.ext.asyncio import AsyncSession

# Project Modules
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.claim import Claim
from app.models.item import Item, ItemCategory, ItemStatus
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimRead, ItemClaimRead
from app.schemas.item import ItemCreate, ItemPage, ItemRead, ItemUpdate
from app.services import claims as claims_service
from app.services import items as items_service

router = APIRouter(prefix="/items", tags=["items"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
Limit = Annotated[int, Query(ge=1, le=50)]
Offset = Annotated[int, Query(ge=0)]


@router.get("", response_model=ItemPage)
async def list_items(
    db: DbSession,
    q: Annotated[Optional[str], Query(max_length=100)] = None,
    category: Optional[ItemCategory] = None,
    status: Optional[ItemStatus] = None,
    limit: Limit = 12,
    offset: Offset = 0,
) -> ItemPage:
    items, total = await items_service.list_items(
        db, q=q, category=category, status=status, limit=limit, offset=offset
    )
    return ItemPage(items=items, total=total, limit=limit, offset=offset)


@router.get("/mine", response_model=ItemPage)
async def list_my_items(
    db: DbSession,
    current_user: CurrentUser,
    limit: Limit = 50,
    offset: Offset = 0,
) -> ItemPage:
    items, total = await items_service.list_items(
        db, finder_id=current_user.id, limit=limit, offset=offset
    )
    return ItemPage(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: ItemCreate, db: DbSession, current_user: CurrentUser
) -> Item:
    return await items_service.create_item(db, payload, current_user)


@router.get("/{item_id}", response_model=ItemRead)
async def get_item(item_id: int, db: DbSession) -> Item:
    return await items_service.get_item(db, item_id)


@router.patch("/{item_id}", response_model=ItemRead)
async def update_item(
    item_id: int, payload: ItemUpdate, db: DbSession, current_user: CurrentUser
) -> Item:
    return await items_service.update_item(db, item_id, payload, current_user)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int, db: DbSession, current_user: CurrentUser) -> None:
    await items_service.delete_item(db, item_id, current_user)


@router.get("/{item_id}/claims", response_model=list[ItemClaimRead])
async def list_item_claims(
    item_id: int, db: DbSession, current_user: CurrentUser
) -> list[ItemClaimRead]:
    claims = await claims_service.list_item_claims(db, item_id, current_user)
    return [to_item_claim(claim) for claim in claims]


@router.post(
    "/{item_id}/claims",
    response_model=ClaimRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_claim(
    item_id: int, payload: ClaimCreate, db: DbSession, current_user: CurrentUser
) -> Claim:
    return await claims_service.create_claim(db, item_id, payload, current_user)


def to_item_claim(claim: Claim) -> ItemClaimRead:
    return ItemClaimRead(
        **ClaimRead.model_validate(claim).model_dump(),
        claimant_email=claim.claimant.email,
    )
