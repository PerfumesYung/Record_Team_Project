from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.album import Album
from app.models.user import User
from .schemas import CartAlbum, CartItemChanged, CartItemRead, CartRead
from .tables import CartItem


def require_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(401, "로그인한 회원을 찾을 수 없습니다")


def read_cart(db: Session, user_id: int):
    require_user(db, user_id)
    cart_list = db.query(CartItem).filter(CartItem.user_id == user_id).order_by(CartItem.id).all()
    items = []
    total = 0

    for cart in cart_list:
        album = db.query(Album).filter(Album.id == cart.album_id).first()
        if album is None:
            raise HTTPException(409, "장바구니의 음반 정보를 찾을 수 없습니다")

        subtotal = album.price * cart.quantity
        items.append(CartItemRead(
            id=cart.id, album_id=album.id, quantity=cart.quantity,
            unit_price=album.price, subtotal=subtotal,
            album=CartAlbum(
                id=album.id, title=album.title, artist=album.artist,
                format=album.format, image_url=album.image_url, stock=album.stock
            )
        ))
        total += subtotal

    return CartRead(items=items, total_amount=total)


def add_cart_item(db: Session, user_id: int, album_id: int, quantity: int):
    require_user(db, user_id)
    album = db.query(Album).filter(Album.id == album_id).first()
    if album is None or album.hidden == 1:
        raise HTTPException(404, "구매 가능한 음반을 찾을 수 없습니다")

    cart = db.query(CartItem).filter(
        CartItem.user_id == user_id, CartItem.album_id == album_id
    ).first()
    new_item = cart is None
    new_quantity = quantity if new_item else cart.quantity + quantity
    if new_quantity > album.stock:
        raise HTTPException(409, "재고가 부족합니다")

    if new_item:
        cart = CartItem(user_id=user_id, album_id=album_id, quantity=new_quantity)
        db.add(cart)
    else:
        cart.quantity = new_quantity

    db.commit()
    db.refresh(cart)
    return CartItemChanged(id=cart.id, album_id=cart.album_id, quantity=cart.quantity), new_item


def change_cart_item(db: Session, user_id: int, cart_item_id: int, quantity: int):
    require_user(db, user_id)
    cart = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.user_id == user_id
    ).first()
    if cart is None:
        raise HTTPException(404, "장바구니 항목을 찾을 수 없습니다")

    album = db.query(Album).filter(Album.id == cart.album_id).first()
    if album is None or album.hidden == 1:
        raise HTTPException(409, "구매할 수 없는 음반입니다")
    if quantity > album.stock:
        raise HTTPException(409, "재고가 부족합니다")

    cart.quantity = quantity
    db.commit()
    return CartItemChanged(id=cart.id, album_id=cart.album_id, quantity=cart.quantity)


def remove_cart_item(db: Session, user_id: int, cart_item_id: int):
    require_user(db, user_id)
    cart = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.user_id == user_id
    ).first()
    if cart is None:
        raise HTTPException(404, "장바구니 항목을 찾을 수 없습니다")
    db.delete(cart)
    db.commit()
