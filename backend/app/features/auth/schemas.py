"""회원가입과 로그인에서 사용하는 요청·응답 형식."""

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """회원가입할 때 받는 정보."""

    email: EmailStr = Field(max_length=254)
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=8, max_length=64)


class UserRead(BaseModel):
    """회원가입 성공 시 보여줄 정보."""

    id: int
    email: EmailStr
    username: str

    # DB에서 가져온 User 객체의 속성을 읽어서 응답으로 변환
    model_config = {"from_attributes": True}


class CurrentUserRead(UserRead):
    """내 정보 조회 시 관리자 여부도 반환."""

    is_admin: bool


class TokenResponse(BaseModel):
    """로그인 성공 시 반환할 토큰."""
    access_token: str
    token_type: str = "bearer"