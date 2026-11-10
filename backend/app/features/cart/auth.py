from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.settings import settings

bearer = HTTPBearer(auto_error=False)


def current_user_id(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]) -> int:
    if credentials is None:
        raise HTTPException(401, "로그인이 필요합니다", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key,
                             algorithms=["HS256"], options={"require": ["sub", "exp"]})
        user_id = int(payload["sub"])
        if user_id <= 0 or str(user_id) != payload["sub"]:
            raise ValueError("올바르지 않은 사용자 ID")
        return user_id
    except (jwt.PyJWTError, TypeError, ValueError):
        raise HTTPException(401, "유효하지 않거나 만료된 로그인입니다",
                            headers={"WWW-Authenticate": "Bearer"}) from None


CurrentUserId = Annotated[int, Depends(current_user_id)]
