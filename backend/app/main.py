"""GambleGuard API - FastAPI 메인 애플리케이션"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.api.v1.router import api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Nginx 프록시 헤더 처리 (X-Forwarded-For, X-Forwarded-Proto)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# 헬스체크
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
