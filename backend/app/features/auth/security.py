"""비밀번호와 JWT 토큰을 다루는 공통 함수."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.settings import settings
from app.db.database import get_db
from app.models.user import User


# 비밀번호를 안전한 해시값으로 바꾸고 검사할 도구
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

# Swagger의 Authorize 버튼에서 사용할 로그인 주소
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def hash_password(password: str) -> str:
    """비밀번호 원문을 해시로 변환."""
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """입력한 비밀번호가 저장된 해시와 일치하는지 확인."""
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    """사용자 번호가 담긴 JWT 발급."""

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        # JWT의 sub에는 문자열 형태로 사용자 번호 저장
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm="HS256",
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """토큰을 검사하고 현재 로그인한 사용자를 조회."""

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="유효하지 않거나 만료된 로그인입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            options={"require": ["sub", "exp"]},
        )

        user_id = int(payload["sub"])

        if user_id <= 0:
            raise ValueError

    except (InvalidTokenError, KeyError, ValueError, TypeError):
        raise credentials_error

    # 수업에서 사용한 query / filter 방식으로 로그인 사용자 찾기
    current_user = db.query(User).filter(User.id == user_id).first()

    if current_user is None:
        raise credentials_error

    return current_user