from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.album import Album 
from app.features.orders.tables import OrderItem     
from app.features.orders.tables import Order      
from app.models.review import Review
from app.models.user import User      

from .schemas import ReviewCreate, ReviewUpdate

MSG_NOT_ORDERED = "주문한 음반에만 리뷰를 작성할 수 있습니다"
MSG_DUPLICATE = "이미 이 음반에 리뷰를 작성했습니다"
MSG_ALBUM_NOT_FOUND = "음반을 찾을 수 없습니다"
MSG_REVIEW_NOT_FOUND = "리뷰를 찾을 수 없습니다"
MSG_FORBIDDEN = "본인 리뷰만 수정·삭제할 수 있습니다"


def _to_response(review: Review, username: str, current_user_id: Optional[int]) -> dict:
    return {
        "id": review.id,
        "album_id": review.album_id,
        "user_id": review.user_id,
        "username": username,
        "rating": review.rating,
        "content": review.content,
        "created_at": review.created_at,
        "is_mine": current_user_id is not None and review.user_id == current_user_id,
    }


def _get_album_or_404(db: Session, album_id: int) -> Album:
    album = db.get(Album, album_id)
    if album is None or album.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, MSG_ALBUM_NOT_FOUND)
    return album


def _get_my_review_or_error(db: Session, review_id: int, user: User) -> Review:
    review = db.get(Review, review_id)
    if review is None or review.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, MSG_REVIEW_NOT_FOUND)
    if review.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, MSG_FORBIDDEN)
    return review


def list_reviews(db: Session, album_id: int, current_user: Optional[User]) -> list[dict]:
    _get_album_or_404(db, album_id)
    rows = (
        db.query(Review, User.username)
        .join(User, User.id == Review.user_id)
        .filter(Review.album_id == album_id, Review.hidden == 0)
        .order_by(Review.created_at.desc(), Review.id.desc())
        .all()
    )
    current_user_id = current_user.id if current_user else None
    return [_to_response(r, username, current_user_id) for r, username in rows]



def create_review(db: Session, album_id: int, user: User, data: ReviewCreate) -> dict:
    _get_album_or_404(db, album_id)

    has_ordered = (
        db.query(Order.id)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(Order.user_id == user.id, OrderItem.album_id == album_id)
        .first()
        is not None
    )
    if not has_ordered:
        raise HTTPException(status.HTTP_403_FORBIDDEN, MSG_NOT_ORDERED)


    exists = (
        db.query(Review.id)
        .filter(Review.user_id == user.id, Review.album_id == album_id)
        .first()
    )
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, MSG_DUPLICATE)

    review = Review(
        user_id=user.id,
        album_id=album_id,
        rating=data.rating,
        content=data.content,
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, MSG_DUPLICATE)
    db.refresh(review)
    return _to_response(review, user.username, user.id)



def update_review(db: Session, review_id: int, user: User, data: ReviewUpdate) -> dict:
    review = _get_my_review_or_error(db, review_id, user)
    if data.rating is not None:
        review.rating = data.rating
    if data.content is not None:
        review.content = data.content
    db.commit()
    db.refresh(review)
    return _to_response(review, user.username, user.id)



def delete_review(db: Session, review_id: int, user: User) -> None:
    review = _get_my_review_or_error(db, review_id, user)
    db.delete(review)
    db.commit()
