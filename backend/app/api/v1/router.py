"""API v1 라우터 통합"""

from fastapi import APIRouter

from app.api.v1.analytics import router as analytics_router
from app.api.v1.auth import router as auth_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.sites import router as sites_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["인증"])
api_router.include_router(sites_router, prefix="/sites", tags=["사이트"])
api_router.include_router(
    investigations_router, prefix="/investigations", tags=["채증"]
)
api_router.include_router(evidence_router, prefix="/evidence", tags=["증거"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["통계"])
