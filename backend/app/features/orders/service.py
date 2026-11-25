from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.features.cart.service import require_user
from app.features.cart.tables import CartItem
from app.models.album import Album
from .schemas import OrderItemRead, OrderPage, OrderRead, OrderSummary
from .tables import Order, OrderItem
from app.models.review import Review

def utc_time(value):
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def read_order(db: Session, order_id: int, user_id: int):
    require_user(db, user_id)

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_id
    ).first()

    if order is None:
        raise HTTPException(404, "주문을 찾을 수 없습니다")

    order_list = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).order_by(OrderItem.id).all()

    items = []

    for item in order_list:
        album = db.query(Album).filter(
            Album.id == item.album_id
        ).first()

        items.append(OrderItemRead(
            album_id=item.album_id,
            title=item.title,
            unit_price=item.unit_price,
            quantity=item.quantity,
            image_url=album.image_url if album else None,
            artist=album.artist if album else None
        ))

    return OrderRead(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=utc_time(order.created_at),
        items=items
    )

def list_orders(db: Session, user_id: int, page: int, size: int):
    require_user(db, user_id)

    query = db.query(Order).filter(Order.user_id == user_id)
    total = query.count()

    order_list = query.order_by(
        Order.created_at.desc(), Order.id.desc()
    ).offset((page - 1) * size).limit(size).all()

    items = []

    for order in order_list:
        order_detail = read_order(db, order.id, user_id)

        items.append(OrderSummary(
            id=order.id,
            status=order.status,
            total_amount=order.total_amount,
            created_at=utc_time(order.created_at),
            items=order_detail.items
        ))

    return OrderPage(
        items=items,
        total=total,
        page=page,
        size=size
    )


def checkout(db: Session, user_id: int, requested_items, clear_cart: bool = True):
    require_user(db, user_id)
    quantities = {}
    for item in requested_items:
        if item.album_id not in quantities:
            quantities[item.album_id] = 0
        quantities[item.album_id] += item.quantity

    if not quantities:
        raise HTTPException(422, "주문할 음반이 없습니다")

    try:
        products = []
        total = 0
        for album_id in sorted(quantities):
            album = db.query(Album).filter(Album.id == album_id).with_for_update().first()
            quantity = quantities[album_id]
            if album is None or album.hidden == 1:
                raise HTTPException(409, "구매할 수 없는 음반이 있습니다")
            if album.stock < quantity:
                raise HTTPException(409, "재고가 부족합니다")
            products.append((album, quantity))
            total += album.price * quantity

        order = Order(
            user_id=user_id, status="RECEIVED", total_amount=total,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None)
        )
        db.add(order)
        db.flush()

        for album, quantity in products:
            album.stock -= quantity
            db.add(OrderItem(
                order_id=order.id, album_id=album.id, title=album.title,
                unit_price=album.price, quantity=quantity
            ))
            
            # 장바구니 주문일 때만 주문한 음반을 장바구니에서 제거
            if clear_cart:
                cart = db.query(CartItem).filter(
                    CartItem.user_id == user_id,
                    CartItem.album_id == album.id,
                ).first()

                if cart is not None:
                    db.delete(cart)

        db.commit()
    except Exception:
        db.rollback()
        raise

    return read_order(db, order.id, user_id)


def delete_order(db: Session, order_id: int, user_id: int):
    require_user(db, user_id)

    try:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).with_for_update().first()

        if order is None:
            raise HTTPException(404, "주문을 찾을 수 없습니다")

        if order.status != "RECEIVED":
            raise HTTPException(409, "접수된 주문만 삭제할 수 있습니다")

        order_list = db.query(OrderItem).filter(
            OrderItem.order_id == order_id
        ).all()

        for item in sorted(order_list, key=lambda item: item.album_id):
            album = db.query(Album).filter(
                Album.id == item.album_id
            ).with_for_update().first()

            if album is None:
                raise HTTPException(409, "재고를 복구할 음반을 찾을 수 없습니다")

            album.stock += item.quantity
            other_order = db.query(OrderItem).join(
                Order, Order.id == OrderItem.order_id
            ).filter(
                Order.user_id == user_id,
                Order.id != order_id,
                OrderItem.album_id == item.album_id
            ).first()

            if other_order is None:
                review = db.query(Review).filter(
                    Review.user_id == user_id,
                    Review.album_id == item.album_id
                ).first()

                if review is not None:
                    db.delete(review)

            db.delete(item)

        db.flush()
        db.delete(order)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {"message": "주문 삭제 및 재고 복구 완료", "order_id": order_id}
