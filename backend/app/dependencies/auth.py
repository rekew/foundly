# Python Modules
from typing import Annotated, Optional

# FastAPI Modules
from fastapi import Cookie, Depends, HTTPException, status

# Database Modules
from sqlalchemy.ext.asyncio import AsyncSession

# Project Modules
from app.core.config import settings
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    access_token: Annotated[Optional[str], Cookie(alias=settings.cookie_name)] = None,
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Cookie"},
    )

    if not access_token:
        raise unauthorized

    payload = decode_access_token(access_token)
    if payload is None:
        raise unauthorized

    subject = payload.get("sub")
    if subject is None:
        raise unauthorized

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise unauthorized from None

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise unauthorized

    return user
