# 경로의 {id}: 목록·작성은 음반 ID, 수정·삭제는 리뷰 ID

from typing import Optional
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import delete, event, exists, select


from app.features.auth.security import get_current_user
from app.features.orders.tables import Order, OrderItem
from app.db.database import get_db           
from app.models.user import User
from app.models.review import Review


from . import service
from .dependencies import get_current_user_optional
from .schemas import MyReviewResponse, ReviewCreate, ReviewResponse, ReviewUpdate


router = APIRouter(prefix="/api", tags=["reviews"])


# 음반 리뷰 목록 (인증 불필요, 비로그인 is_mine=false)
@router.get("/albums/{id}/reviews", response_model=list[ReviewResponse])
def list_album_reviews(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return service.list_reviews(db, id, current_user)


# 리뷰 작성 (주문 이력 없으면 403, 중복이면 409)
@router.post(
    "/albums/{id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_album_review(
    id: int,
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.create_review(db, id, current_user, body)



# 내 리뷰 수정 (타인 리뷰 403, 없으면 404)
@router.patch("/reviews/{id}", response_model=ReviewResponse)
def update_my_review(
    id: int,
    body: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.update_review(db, id, current_user, body)



# 내 리뷰 삭제 (성공 시 204, 본문 없음)
@router.delete("/reviews/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_review(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    service.delete_review(db, id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# 내 리뷰 목록 (마이페이지)
@router.get("/users/me/reviews", response_model=list[MyReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_my_reviews(db, current_user)
