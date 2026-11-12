"""관리자 주문 목록 API."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.auth.security import get_current_admin


# /api/admin은 통합하는 쪽에서 붙입니다.
router = APIRouter(
    prefix="/orders",
    tags=["관리자 주문"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("")
def read_admin_orders(
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """관리자가 전체 주문 목록을 조회합니다."""

    allowed_statuses = ["RECEIVED", "PROCESSING", "COMPLETED"]

    if status is not None and status not in allowed_statuses:
        raise HTTPException(
            status_code=422,
            detail="올바른 주문 상태가 아닙니다.",
        )

    # status가 없으면 전체 주문, 있으면 해당 상태만 조회합니다.
    count_sql = text("""
        SELECT COUNT(*)
        FROM orders
        WHERE (:status IS NULL OR status = :status)
    """)

    list_sql = text("""
        SELECT id, user_id, status, total_amount, created_at
        FROM orders
        WHERE (:status IS NULL OR status = :status)
        ORDER BY id DESC
        LIMIT :size OFFSET :offset
    """)

    # 첫 페이지: 0부터 / 두 번째 페이지: size만큼 건너뜀
    offset = (page - 1) * size

    total = db.execute(
        count_sql,
        {"status": status},
    ).scalar()

    rows = db.execute(
        list_sql,
        {
            "status": status,
            "size": size,
            "offset": offset,
        },
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