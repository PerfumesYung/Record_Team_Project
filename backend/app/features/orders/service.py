from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.features.cart.service import require_user
from app.features.cart.tables import CartItem
from app.models.album import Album
from .schemas import OrderItemRead, OrderPage, OrderRead
from .tables import Order, OrderItem

def read_order(db: Session, order_id: int, user_id: int):
    require_user(db, user_id)

    order = db.query(Order).filter(
        Order.id == order_id, Order.user_id == user_id
    ).first()
    if order is None:
        raise HTTPException(404, "주문을 찾을 수 없습니다")

    order_list = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    items = []

    for item in order_list:
        items.append(OrderItemRead(
            album_id=item.album_id,
            title=item.title,
            unit_price=item.unit_price,
            quantity=item.quantity,
            line_total=item.unit_price * item.quantity
        ))

    return OrderRead(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items
    )

def list_orders(db: Session, user_id: int, page: int, page_size: int):
    require_user(db, user_id)
    order_list = db.query(Order).filter(Order.user_id == user_id).order_by(Order.id.desc()).all()
    total = len(order_list)

    start = (page - 1) * page_size
    order_list = order_list[start:start + page_size]

    items = []
    for order in order_list:
        items.append(read_order(db, order.id, user_id))

    return OrderPage(items=items, total=total, page=page, page_size=page_size)

def checkout(db: Session, user_id: int):
    require_user(db, user_id)
    cart_list = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    if not cart_list:
        raise HTTPException(409, "장바구니가 비어 있습니다")

    total = 0
    products = []

    for cart in cart_list:
        album = db.query(Album).filter(Album.id == cart.album_id).first()
        if album is None or album.hidden == 1:
            raise HTTPException(409, "구매할 수 없는 음반이 있습니다")
        if album.stock < cart.quantity:
            raise HTTPException(409, "재고가 부족합니다")

        total += album.price * cart.quantity
        products.append((cart, album))

    order = Order(user_id=user_id, status="RECEIVED", total_amount=total)
    db.add(order)
    db.flush()

    for cart, album in products:
        album.stock -= cart.quantity

        order_item = OrderItem(
            order_id=order.id,
            album_id=album.id,
            title=album.title,
            unit_price=album.price,
            quantity=cart.quantity
        )
        db.add(order_item)
        db.delete(cart)

    db.commit()
    return read_order(db, order.id, user_id)
