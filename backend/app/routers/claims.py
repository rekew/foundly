# Python Modules
from typing import Annotated

# FastAPI Modules
from fastapi import APIRouter, Depends, status

# Database Modules
from sqlalchemy.ext.asyncio import AsyncSession

# Project Modules
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.claim import Claim, ClaimStatus
from app.models.user import User
from app.routers.items import to_item_claim
from app.schemas.claim import ClaimRead, ItemClaimRead, MyClaimRead
from app.schemas.item import ItemRead
from app.services import claims as claims_service

router = APIRouter(prefix="/claims", tags=["claims"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def to_my_claim(claim: Claim) -> MyClaimRead:
    approved = claim.status == ClaimStatus.approved
    return MyClaimRead(
        **ClaimRead.model_validate(claim).model_dump(),
        item=ItemRead.model_validate(claim.item),
        finder_email=claim.item.finder.email if approved else None,
    )


@router.get("/mine", response_model=list[MyClaimRead])
async def list_my_claims(db: DbSession, current_user: CurrentUser) -> list[MyClaimRead]:
    claims = await claims_service.list_my_claims(db, current_user)
    return [to_my_claim(claim) for claim in claims]


@router.post("/{claim_id}/approve", response_model=ItemClaimRead)
async def approve_claim(
    claim_id: int, db: DbSession, current_user: CurrentUser
) -> ItemClaimRead:
    claim = await claims_service.approve_claim(db, claim_id, current_user)
    return to_item_claim(claim)


@router.post("/{claim_id}/reject", response_model=ItemClaimRead)
async def reject_claim(
    claim_id: int, db: DbSession, current_user: CurrentUser
) -> ItemClaimRead:
    claim = await claims_service.reject_claim(db, claim_id, current_user)
    return to_item_claim(claim)


@router.delete("/{claim_id}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_claim(
    claim_id: int, db: DbSession, current_user: CurrentUser
) -> None:
    await claims_service.withdraw_claim(db, claim_id, current_user)
