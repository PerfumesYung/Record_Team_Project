from fastapi import Depends
from app.features.auth.security import get_current_user
from app.models.user import User


def current_user_id(current_user: User = Depends(get_current_user)) -> int:
<<<<<<< HEAD
    return current_user.id
=======
    return current_user.id
>>>>>>> 270cdeb (백엔드 수정 및 프론트엔드 추가)
