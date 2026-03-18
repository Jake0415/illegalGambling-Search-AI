"""인증 API 라우터 - 로그인, 로그아웃, 사용자 정보, 초기 설정"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.redis import (
    get_login_attempts,
    increment_login_attempts,
    reset_login_attempts,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    SetupRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """이메일+비밀번호 로그인 -> JWT 발급"""
    # 1. 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
        )

    # 2. 비활성 계정 확인
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비활성화된 계정입니다. 관리자에게 문의하세요",
        )

    # 3. Redis에서 로그인 실패 카운터 확인 (5회 초과 시 잠금)
    attempts = await get_login_attempts(request.email)
    if attempts >= settings.LOGIN_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"로그인 시도 횟수 초과입니다. {settings.LOGIN_LOCKOUT_MINUTES}분 후 다시 시도하세요",
        )

    # 4. bcrypt로 비밀번호 검증
    if not user.password_hash or not verify_password(request.password, user.password_hash):
        # 5. 실패 시 Redis 카운터 증가
        await increment_login_attempts(request.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
        )

    # 6. 성공 시 access_token + refresh_token 발급
    await reset_login_attempts(request.email)

    token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # 7. last_login_at 업데이트
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # 8. AuditLog에 로그인 기록 (AuditLog 모델이 준비되면 활성화)
    logger.info("사용자 로그인 성공: user_id=%s, email=%s", user.id, user.email)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
):
    """로그아웃 (토큰 블랙리스트 - placeholder)"""
    # TODO: Redis 토큰 블랙리스트 구현
    logger.info("사용자 로그아웃: user_id=%s", current_user.id)
    return {"success": True, "data": {"message": "로그아웃되었습니다"}}


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """현재 사용자 정보 반환 (JWT에서 추출)"""
    return ApiResponse(data=UserResponse.model_validate(current_user))


@router.post("/setup", response_model=ApiResponse[TokenResponse])
async def setup(
    request: SetupRequest,
    db: AsyncSession = Depends(get_db),
):
    """초기 설정 - 첫 슈퍼어드민 계정 생성. users 테이블이 비어있을 때만 동작"""
    # 1. users 테이블에 레코드가 있으면 403
    count_result = await db.execute(select(func.count()).select_from(User))
    user_count = count_result.scalar()

    if user_count and user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="초기 설정은 이미 완료되었습니다",
        )

    # 2. 비밀번호 bcrypt 해싱
    hashed_password = hash_password(request.password)

    # 3. SUPER_ADMIN 역할로 사용자 생성
    user = User(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role=UserRole.SUPER_ADMIN,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("초기 설정 완료: 슈퍼어드민 생성 user_id=%s", user.id)

    # 4. 자동 로그인 (토큰 발급)
    token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    )
