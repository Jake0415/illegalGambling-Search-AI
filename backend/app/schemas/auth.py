"""인증 관련 Pydantic v2 스키마"""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """이메일+비밀번호 로그인 요청"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT 토큰 응답"""

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class UserResponse(BaseModel):
    """사용자 정보 응답"""

    id: str
    name: str | None = None
    email: str
    role: str
    is_active: bool
    department: str | None = None
    phone: str | None = None

    model_config = {"from_attributes": True}


class SetupRequest(BaseModel):
    """초기 설정 (첫 슈퍼어드민 계정 생성) 요청"""

    name: str
    email: EmailStr
    password: str
    organization_name: str | None = None
