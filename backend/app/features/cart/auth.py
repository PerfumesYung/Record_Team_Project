from fastapi import Depends

from app.features.auth.security import get_current_user
from app.models.user import User


def current_user_id(
    current_user: User = Depends(get_current_user),
) -> int:
    # 로그인한 사용자의 번호를 장바구니·주문 기능에 전달
    return current_user.id