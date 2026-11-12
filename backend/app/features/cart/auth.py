import jwt
from fastapi import Header, HTTPException
from app.core.settings import settings


def current_user_id(token: str | None = Header(default=None)):
    if token is None:
        raise HTTPException(401, "로그인이 필요합니다")

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"], options={"require": ["sub", "exp"]})
        user_id = int(payload["sub"])

        if user_id <= 0:
            raise ValueError()
        return user_id

    except (jwt.PyJWTError, ValueError, TypeError, KeyError):
        raise HTTPException(401, "유효하지 않거나 만료된 로그인입니다")
