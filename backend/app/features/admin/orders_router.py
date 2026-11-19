"""관리자 주문 목록 API."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.auth.security import get_current_admin


from pydantic import BaseModel


class OrderStatusUpdate(BaseModel):
    """관리자가 변경할 주문 상태."""

    status: str

# /api/admin은 통합 후 관리자 API 붙이기
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



#관리자 주문 상세 정보 조회 
@router.get("/{order_id}")
def read_admin_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
):
    """관리자가 선택한 주문의 상세 정보를 조회합니다."""

    # 1. 주문 번호로 주문 정보를 찾습니다.
    order_sql = text("""
        SELECT id, user_id, status, total_amount, created_at
        FROM orders
        WHERE id = :order_id
    """)

    order = db.execute(
        order_sql,
        {"order_id": order_id},
    ).mappings().first()

    # 2. 주문이 없으면 404 오류를 반환합니다.
    if order is None:
        raise HTTPException(
            status_code=404,
            detail="주문을 찾을 수 없습니다.",
        )

    # 3. 해당 주문에 포함된 음반 목록을 찾습니다.
    items_sql = text("""
        SELECT album_id, title, unit_price, quantity
        FROM order_items
        WHERE order_id = :order_id
        ORDER BY id
    """)

    rows = db.execute(
        items_sql,
        {"order_id": order_id},
    ).mappings().all()

    # 4. 조회한 주문 항목을 응답에 담습니다.
    items = []

    for row in rows:
        items.append(dict(row))

    # 5. 주문 정보와 주문 항목을 함께 반환합니다.
    return {
        "id": order["id"],
        "user_id": order["user_id"],
        "status": order["status"],
        "total_amount": order["total_amount"],
        "created_at": order["created_at"],
        "items": items,
    }

#관리자 주문 진행 상태 변경 API
@router.patch("/{order_id}/status")
def update_admin_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """관리자가 주문 진행 상태를 변경합니다."""

    # 주문 상태를 순서대로 정합니다.
    status_order = ["RECEIVED", "PROCESSING", "COMPLETED"]

    # 주문상태 올바른지 체크
    if body.status not in status_order:
        raise HTTPException(
            status_code=422,
            detail="올바른 주문 상태가 아닙니다.",
        )

    # 현재 주문 상태를 확인
    find_sql = text("""
        SELECT id, status
        FROM orders
        WHERE id = :order_id
    """)

    order = db.execute(
        find_sql,
        {"order_id": order_id},
    ).mappings().first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="주문을 찾을 수 없습니다.",
        )

    current_status = order["status"]

    # DB에 없는 상태 들어있으면 오류 발생
    if current_status not in status_order:
        raise HTTPException(
            status_code=409,
            detail="현재 주문 상태를 확인할 수 없습니다.",
        )

    current_index = status_order.index(current_status)
    new_index = status_order.index(body.status)

    # 완료된 주문을 다시 초기로 돌리는거 막는 상태
    if new_index < current_index:
        raise HTTPException(
            status_code=409,
            detail="주문 상태를 이전 단계로 변경할 수 없습니다.",
        )

    # 같은 상태를 다시 선택한 경우 그대로 반환
    if body.status == current_status:
        return {
            "id": order_id,
            "status": current_status,
        }

    # 확인한 뒤 다른 요청이 상태를 바꿨다면 덮어쓰지 않도록 조회했던 상태와 아직 같은 경우에만 변경
    update_sql = text("""
        UPDATE orders
        SET status = :new_status
        WHERE id = :order_id
        AND status = :current_status
    """)

    result = db.execute(
        update_sql,
        {
            "new_status": body.status,
            "order_id": order_id,
            "current_status": current_status,
        },
    )

    if result.rowcount == 0:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="주문 상태가 변경되었습니다. 다시 조회해 주세요.",
        )

    # DB에 변경사항을 저장합니다.
    db.commit()

    return {
        "id": order_id,
        "status": body.status,
    }
