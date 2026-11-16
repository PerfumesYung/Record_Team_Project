# security.py 의 로그인 확인 함수에서
# 성공: 사용자 정보(current_user)를 돌려줌
# 실패(로그인 누락, 토큰 만료·오류): 401
# 비로그인 사용자는 리뷰 목록을 볼 수 없음

# 그래서 security.py 를 고치지 않고, 그 함수를 감싸서 사용
#   - 토큰 없음          -> None (비로그인)
#   - 토큰 있음 + 성공   -> current_user
#   - 토큰 있음 + 401    -> None (만료돼도 리뷰는 볼 수 있게)

from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.features.auth.security import get_current_user
from app.db.database import get_db  
from app.models.user import User

_optional_bearer = HTTPBearer(auto_error=False)

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
    db: Session = Depends(get_db),) -> Optional[User]:
    if credentials is None:
        return None
    try:
        return get_current_user(token=credentials.credentials, db=db)
    except HTTPException:
        return None
