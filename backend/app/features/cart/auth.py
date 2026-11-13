from fastapi import Depends
from app.features.auth.security import get_current_user
from app.models.user import User


def current_user_id(current_user: User = Depends(get_current_user)) -> int:
    return current_user.id