from collections import defaultdict

from fastapi import HTTPException
from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.orm import Session

from app.features.cart.service import require_user
from app.features.cart.tables import albums, cart_items
from .schemas import OrderItemRead, OrderPage, OrderRead
from .tables import order_items, orders


def _serialize_orders(db: Session, rows) -> list[OrderRead]:
    if not rows:
        return []
    ids = [row["id"] for row in rows]
    lines = db.execute(select(order_items.c.order_id, order_items.c.album_id,
                              order_items.c.title, order_items.c.unit_price,
                              order_items.c.quantity)
                       .where(order_items.c.order_id.in_(ids))
                       .order_by(order_items.c.id)).mappings().all()
    grouped = defaultdict(list)
    for item in lines:
        grouped[item["order_id"]].append(OrderItemRead(
            album_id=item["album_id"], title=item["title"],
            unit_price=item["unit_price"], quantity=item["quantity"],
            line_total=item["unit_price"] * item["quantity"]))
    return [OrderRead(id=row["id"], status=row["status"],
                      total_amount=row["total_amount"], created_at=row["created_at"],
                      items=grouped[row["id"]]) for row in rows]


def read_order(db: Session, order_id: int, user_id: int) -> OrderRead:
    require_user(db, user_id)
    row = db.execute(select(orders.c.id, orders.c.status, orders.c.total_amount, orders.c.created_at)
                     .where(orders.c.id == order_id, orders.c.user_id == user_id)).mappings().first()
    if not row:
        raise HTTPException(404, "주문을 찾을 수 없습니다")
    return _serialize_orders(db, [row])[0]


def list_orders(db: Session, user_id: int, page: int, page_size: int) -> OrderPage:
    require_user(db, user_id)
    total = db.execute(select(func.count()).select_from(orders)
                       .where(orders.c.user_id == user_id)).scalar_one()
    rows = db.execute(select(orders.c.id, orders.c.status, orders.c.total_amount, orders.c.created_at)
                      .where(orders.c.user_id == user_id)
                      .order_by(orders.c.created_at.desc(), orders.c.id.desc())
                      .offset((page - 1) * page_size).limit(page_size)).mappings().all()
    return OrderPage(items=_serialize_orders(db, rows), total=total, page=page, page_size=page_size)


def checkout(db: Session, user_id: int) -> OrderRead:

    try:
        require_user(db, user_id)
        cart = db.execute(select(cart_items.c.album_id, cart_items.c.quantity)
                          .where(cart_items.c.user_id == user_id)
                          .order_by(cart_items.c.album_id).with_for_update()).mappings().all()
        if not cart:
            raise HTTPException(409, "장바구니가 비어 있습니다")

        by_id = {a["id"]: a for a in db.execute(
            select(albums.c.id, albums.c.title, albums.c.price,
                   albums.c.stock, albums.c.hidden)
            .where(albums.c.id.in_([line["album_id"] for line in cart]))
            .order_by(albums.c.id).with_for_update()).mappings().all()}

        snapshots = []
        total = 0
        for line in cart:
            album = by_id.get(line["album_id"])
            if not album or album["hidden"] or album["stock"] < line["quantity"]:
                raise HTTPException(409, "판매 상태나 재고가 변경되었습니다. 장바구니를 확인하세요")
            if line["quantity"] > 20:
                raise HTTPException(409, "음반별 최대 20개까지 주문할 수 있습니다")
            if album["price"] < 0:
                raise HTTPException(409, "음반 가격이 올바르지 않습니다")
            snapshots.append({"album_id": album["id"], "title": album["title"],
                              "unit_price": album["price"], "quantity": line["quantity"]})
            total += album["price"] * line["quantity"]

        result = db.execute(insert(orders).values(user_id=user_id, status="RECEIVED", total_amount=total))
        order_id = result.inserted_primary_key[0]
        for line in cart:
            updated = db.execute(update(albums)
                .where(albums.c.id == line["album_id"], albums.c.hidden == 0,
                       albums.c.stock >= line["quantity"])
                .values(stock=albums.c.stock - line["quantity"]))
            if updated.rowcount != 1:
                raise HTTPException(409, "재고가 부족합니다. 장바구니를 확인하세요")
        db.execute(insert(order_items), [{"order_id": order_id, **line} for line in snapshots])
        db.execute(delete(cart_items).where(cart_items.c.user_id == user_id))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return read_order(db, order_id, user_id)
