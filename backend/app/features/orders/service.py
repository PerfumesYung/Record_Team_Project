from fastapi import HTTPException
from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.orm import Session
from app.features.cart.service import require_user
from app.features.cart.tables import albums, cart_items
from .schemas import OrderItemRead, OrderPage, OrderRead
from .tables import order_items, orders


def make_order_list(db: Session, rows):
    if not rows:
        return []

    ids = []
    grouped = {}

    for row in rows:
        ids.append(row["id"])
        grouped[row["id"]] = []

    lines = db.execute(
        select(order_items).where(order_items.c.order_id.in_(ids)).order_by(order_items.c.id)
    ).mappings().all()

    for line in lines:
        item = OrderItemRead(
            album_id=line["album_id"],
            title=line["title"],
            unit_price=line["unit_price"],
            quantity=line["quantity"],
            line_total=line["unit_price"] * line["quantity"]
        )
        grouped[line["order_id"]].append(item)

    result = []
    for row in rows:
        order = OrderRead(
            id=row["id"],
            status=row["status"],
            total_amount=row["total_amount"],
            created_at=row["created_at"],
            items=grouped[row["id"]]
        )
        result.append(order)

    return result

def read_order(db: Session, order_id: int, user_id: int):
    require_user(db, user_id)

    order = db.execute(
        select(orders).where(orders.c.id == order_id, orders.c.user_id == user_id)
    ).mappings().first()

    if order is None:
        raise HTTPException(404, "주문을 찾을 수 없습니다")

    result = make_order_list(db, [order])
    return result[0]

def list_orders(db: Session, user_id: int, page: int, page_size: int):
    require_user(db, user_id)

    total = db.execute(
        select(func.count()).select_from(orders).where(orders.c.user_id == user_id)
    ).scalar()

    rows = db.execute(
        select(orders).where(orders.c.user_id == user_id).order_by(orders.c.created_at.desc(), orders.c.id.desc()).offset((page - 1) * page_size).limit(page_size)
    ).mappings().all()

    items = make_order_list(db, rows)

    return OrderPage(items=items, total=total, page=page, page_size=page_size)

def checkout(db: Session, user_id: int):
    try:
        require_user(db, user_id)

        cart = db.execute(
            select(cart_items.c.album_id, cart_items.c.quantity).where(cart_items.c.user_id == user_id).order_by(cart_items.c.album_id).with_for_update()
        ).mappings().all()

        if not cart:
            raise HTTPException(409, "장바구니가 비어 있습니다")

        items = []
        total = 0

        for line in cart:
            album = db.execute(
                select(albums.c.id, albums.c.title, albums.c.price,
                       albums.c.stock, albums.c.hidden).where(albums.c.id == line["album_id"]).with_for_update()
            ).mappings().first()

            if album is None or album["hidden"]:
                raise HTTPException(409, "판매 상태가 변경되었습니다. 장바구니를 확인하세요")

            if line["quantity"] < 1 or line["quantity"] > 20:
                raise HTTPException(409, "음반별 주문 수량은 1~20개입니다")

            if album["stock"] < line["quantity"]:
                raise HTTPException(409, "재고가 부족합니다. 장바구니를 확인하세요")

            if album["price"] < 0:
                raise HTTPException(409, "음반 가격이 올바르지 않습니다")

            item = {
                "album_id": album["id"],
                "title": album["title"],
                "unit_price": album["price"],
                "quantity": line["quantity"]
            }
            items.append(item)
            total += album["price"] * line["quantity"]

        result = db.execute(
            insert(orders).values(
                user_id=user_id,
                status="RECEIVED",
                total_amount=total
            )
        )
        order_id = result.inserted_primary_key[0]

        for item in items:
            quantity = item["quantity"]

            updated = db.execute(
                update(albums)
                .where(
                    albums.c.id == item["album_id"],
                    albums.c.hidden == 0,
                    albums.c.stock >= quantity
                )
                .values(stock=albums.c.stock - quantity)
            )

            if updated.rowcount != 1:
                raise HTTPException(409, "재고가 부족합니다. 장바구니를 확인하세요")

            db.execute(
                insert(order_items).values(
                    order_id=order_id,
                    album_id=item["album_id"],
                    title=item["title"],
                    unit_price=item["unit_price"],
                    quantity=quantity
                )
            )

        db.execute(
            delete(cart_items).where(cart_items.c.user_id == user_id)
        )
        db.commit()

    except Exception:

        db.rollback()
        raise

    return read_order(db, order_id, user_id)
