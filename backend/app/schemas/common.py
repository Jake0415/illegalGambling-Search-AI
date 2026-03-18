"""Pydantic v2 공통 스키마"""

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """표준 API 성공 응답"""

    success: bool = True
    data: T
    meta: Optional[dict] = None


class ApiError(BaseModel):
    """표준 API 에러 응답"""

    success: bool = False
    error: dict  # code, message, details


class PaginationMeta(BaseModel):
    """페이지네이션 메타 정보"""

    total: int
    page: int
    page_size: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 포함 목록 응답"""

    success: bool = True
    data: list[T]
    pagination: PaginationMeta
