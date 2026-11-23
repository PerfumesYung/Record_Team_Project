"""관리자 리뷰 관리 API."""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.auth.security import get_current_admin
from app.models.review import Review


# /api/admin은 main.py에서 한 번만 붙입니다.
router = APIRouter(
    prefix="/reviews",
    tags=["관리자 리뷰"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("")
def read_admin_reviews(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """관리자가 전체 리뷰 목록을 조회합니다."""

    # 전체 리뷰 개수를 구합니다.
    count_sql = text("""
        SELECT COUNT(*)
        FROM reviews
    """)

    # 리뷰와 연결된 사용자·음반 정보를 함께 가져옵니다.
    list_sql = text("""
        SELECT
            reviews.id,
            reviews.user_id,
            users.username,
            reviews.album_id,
            albums.title AS album_title,
            reviews.rating,
            reviews.content,
            reviews.hidden,
            reviews.created_at
        FROM reviews
        JOIN users ON reviews.user_id = users.id
        JOIN albums ON reviews.album_id = albums.id
        ORDER BY reviews.id DESC
        LIMIT :size OFFSET :offset
    """)

    # 페이지마다 앞에서 건너뛸 리뷰 개수
    offset = (page - 1) * size

    total = db.execute(count_sql).scalar()

    rows = db.execute(
        list_sql,
        {"size": size, "offset": offset},
    ).mappings().all()

    items = []

    for row in rows:
        items.append(dict(row))

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
    }


class ReviewVisibilityUpdate(BaseModel):
    # true: 숨김 / false: 공개
    hidden: bool


@router.patch("/{review_id}/visibility")
def update_review_visibility(
    review_id: int,
    body: ReviewVisibilityUpdate,
    db: Session = Depends(get_db),
):
    """관리자가 리뷰를 숨기거나 다시 공개합니다."""
    review = db.query(Review).filter(Review.id == review_id).first()

    if review is None:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")

    # DB에서는 0이 공개, 1이 숨김입니다.
    review.hidden = 1 if body.hidden else 0
    db.commit()
    db.refresh(review)

    return {"id": review.id, "hidden": bool(review.hidden)}
