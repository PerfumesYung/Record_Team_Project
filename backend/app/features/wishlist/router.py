from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User

from . import service
from .schemas import WishlistAddResponse, WishlistListResponse



router = APIRouter(prefix="/api/users/me/wishlist", tags=["wishlist"])



# 내 찜 목록
@router.get("", response_model=WishlistListResponse)
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_my_wishlist(db, current_user)




# 음반 찜 등록 (200, {album_id, wished:true})
@router.put("/{id}", response_model=WishlistAddResponse)
def add_wishlist(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.add_to_wishlist(db, current_user, id)



# 음반 찜 해제 (204)
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    service.remove_from_wishlist(db, current_user, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
