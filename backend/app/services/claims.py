# Database Modules
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Project Modules
from app.models.claim import Claim, ClaimStatus
from app.models.item import Item, ItemStatus
from app.models.user import User
from app.schemas.claim import ClaimCreate
from app.services.errors import ConflictError, NotFoundError, PermissionDeniedError
from app.services.items import get_item, get_owned_item


async def create_claim(
    db: AsyncSession, item_id: int, payload: ClaimCreate, claimant: User
) -> Claim:
    item = await get_item(db, item_id)
    if item.finder_id == claimant.id:
        raise ConflictError("You cannot claim an item you reported")
    if item.status != ItemStatus.open:
        raise ConflictError("This item has already been returned")

    existing = await db.scalar(
        select(Claim.id).where(
            Claim.item_id == item_id,
            Claim.claimant_id == claimant.id,
            Claim.status.in_([ClaimStatus.pending, ClaimStatus.approved]),
        )
    )
    if existing is not None:
        raise ConflictError("You already have an active claim for this item")

    claim = Claim(item_id=item_id, claimant_id=claimant.id, message=payload.message)
    db.add(claim)
    await db.commit()
    await db.refresh(claim)
    return claim


async def list_item_claims(db: AsyncSession, item_id: int, user: User) -> list[Claim]:
    await get_owned_item(db, item_id, user)
    result = await db.execute(
        select(Claim)
        .where(Claim.item_id == item_id)
        .options(selectinload(Claim.claimant))
        .order_by(Claim.created_at.desc(), Claim.id.desc())
    )
    return list(result.scalars().all())


async def list_my_claims(db: AsyncSession, user: User) -> list[Claim]:
    result = await db.execute(
        select(Claim)
        .where(Claim.claimant_id == user.id)
        .options(selectinload(Claim.item).selectinload(Item.finder))
        .order_by(Claim.created_at.desc(), Claim.id.desc())
    )
    return list(result.scalars().all())


async def _get_claim_for_finder(db: AsyncSession, claim_id: int, user: User) -> Claim:
    claim = await db.get(
        Claim,
        claim_id,
        options=[selectinload(Claim.item), selectinload(Claim.claimant)],
    )
    if claim is None:
        raise NotFoundError("Claim not found")
    if claim.item.finder_id != user.id:
        raise PermissionDeniedError("Only the finder can review this claim")
    if claim.status != ClaimStatus.pending:
        raise ConflictError("This claim has already been reviewed")
    return claim


async def approve_claim(db: AsyncSession, claim_id: int, user: User) -> Claim:
    claim = await _get_claim_for_finder(db, claim_id, user)
    if claim.item.status != ItemStatus.open:
        raise ConflictError("This item has already been returned")

    claim.status = ClaimStatus.approved
    claim.item.status = ItemStatus.returned
    await db.execute(
        update(Claim)
        .where(
            Claim.item_id == claim.item_id,
            Claim.id != claim.id,
            Claim.status == ClaimStatus.pending,
        )
        .values(status=ClaimStatus.rejected)
        .execution_options(synchronize_session=False)
    )
    await db.commit()
    return claim


async def reject_claim(db: AsyncSession, claim_id: int, user: User) -> Claim:
    claim = await _get_claim_for_finder(db, claim_id, user)
    claim.status = ClaimStatus.rejected
    await db.commit()
    return claim


async def withdraw_claim(db: AsyncSession, claim_id: int, user: User) -> None:
    claim = await db.get(Claim, claim_id)
    if claim is None:
        raise NotFoundError("Claim not found")
    if claim.claimant_id != user.id:
        raise PermissionDeniedError("Only the claimant can withdraw this claim")
    if claim.status != ClaimStatus.pending:
        raise ConflictError("Only pending claims can be withdrawn")
    await db.delete(claim)
    await db.commit()
