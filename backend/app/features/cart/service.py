from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.album import Album
from .schemas import CartAlbum, CartLine, CartRead
from .tables import CartItem, users

def require_user(db: Session, user_id: int):
    user = db.query(users.c.id).filter(users.c.id == user_id).first()
    if user is None:
        raise HTTPException(401, "로그인한 회원을 찾을 수 없습니다")

def read_cart(db: Session, user_id: int):
    require_user(db, user_id)
    cart_list = db.query(CartItem).filter(CartItem.user_id == user_id).all()

    items = []
    total = 0

    for cart in cart_list:
        album = db.query(Album).filter(Album.id == cart.album_id).first()

        album_data = CartAlbum(
            id=album.id,
            title=album.title,
            artist=album.artist,
            format=album.format,
            image_url=album.image_url,
            price=album.price,
            stock=album.stock,
            hidden=album.hidden
        )
        line_total = album.price * cart.quantity
        items.append(CartLine(album=album_data, quantity=cart.quantity, line_total=line_total))
        total += line_total

    return CartRead(items=items, subtotal=total, total=total)

def set_quantity(db: Session, user_id: int, album_id: int, quantity: int):
    require_user(db, user_id)

    album = db.query(Album).filter(Album.id == album_id).first()
    if album is None or album.hidden == 1:
        raise HTTPException(404, "구매 가능한 음반을 찾을 수 없습니다")
    if album.stock < quantity:
        raise HTTPException(409, "재고가 부족합니다")

    cart = db.query(CartItem).filter(
        CartItem.user_id == user_id, CartItem.album_id == album_id
    ).first()

    if cart is None:
        cart = CartItem(user_id=user_id, album_id=album_id, quantity=quantity)
        db.add(cart)
    else:
        cart.quantity = quantity

    db.commit()
    return read_cart(db, user_id)

def remove_item(db: Session, user_id: int, album_id: int):
    require_user(db, user_id)

    cart = db.query(CartItem).filter(
        CartItem.user_id == user_id, CartItem.album_id == album_id
    ).first()

    if cart is not None:
        db.delete(cart)
        db.commit()

    return read_cart(db, user_id)
