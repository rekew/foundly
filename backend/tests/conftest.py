# Python Modules
from collections.abc import AsyncGenerator, Awaitable, Callable

# Database Modules
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

# Third-Party Modules
import httpx
import pytest

# Project Modules
import app.models
from app.database.base import Base
from app.database.session import get_db
from app.main import app

ClientFactory = Callable[..., Awaitable[httpx.AsyncClient]]


@pytest.fixture
async def session_factory() -> AsyncGenerator[async_sessionmaker[AsyncSession], None]:
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield factory
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.fixture
async def make_client(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[ClientFactory, None]:
    clients: list[httpx.AsyncClient] = []

    async def factory(email: str = "", password: str = "password123"):
        client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test/api/v1",
        )
        clients.append(client)
        if email:
            res = await client.post(
                "/auth/register", json={"email": email, "password": password}
            )
            assert res.status_code == 201, res.text
            res = await client.post(
                "/auth/login", data={"username": email, "password": password}
            )
            assert res.status_code == 200, res.text
        return client

    yield factory
    for client in clients:
        await client.aclose()
