# FastAPI Modules
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Project Modules
from app.core.config import settings
from app.routers import auth, health

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Accept", "Content-Type"],
)

app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
