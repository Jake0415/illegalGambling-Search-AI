"""Pydantic v2 공통 스키마 — camelCase 응답 지원"""

from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class CamelModel(BaseModel):
    """camelCase alias를 자동 생성하는 기본 모델"""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class PaginationInfo(CamelModel):
    """페이지네이션 메타 정보"""

    total: int
    page: int
    limit: int
    has_next: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 포함 목록 응답 — { data, pagination }"""

    data: list[T]
    pagination: PaginationInfo


class ApiResponse(BaseModel, Generic[T]):
    """표준 API 성공 응답"""

    success: bool = True
    data: T
    meta: Optional[dict] = None


class ApiError(BaseModel):
    """표준 API 에러 응답"""

    success: bool = False
    error: dict  # code, message, details
