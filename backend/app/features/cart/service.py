from fastapi import HTTPException
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session

from .schemas import CartAlbum, CartLine, CartRead
from .tables import albums, cart_items, users


def require_user(db: Session, user_id: int):
    user = db.execute(
        select(users.c.id).where(users.c.id == user_id)
    ).first()

    if user is None:
        raise HTTPException(401, "로그인한 회원을 찾을 수 없습니다")

def read_cart(db: Session, user_id: int):
    require_user(db, user_id)

    rows = db.execute(
        select(
            cart_items.c.quantity,
            albums.c.id,
            albums.c.title,
            albums.c.artist,
            albums.c.format,
            albums.c.image_url,
            albums.c.price,
            albums.c.stock,
            albums.c.hidden
        ).select_from(cart_items.join(albums, cart_items.c.album_id == albums.c.id)).where(cart_items.c.user_id == user_id).order_by(cart_items.c.id)
    ).mappings().all()

    items = []
    subtotal = 0

    for row in rows:
        album = CartAlbum(
            id=row["id"],
            title=row["title"],
            artist=row["artist"],
            format=row["format"],
            image_url=row["image_url"],
            price=row["price"],
            stock=row["stock"],
            hidden=row["hidden"]
        )

        line_total = row["price"] * row["quantity"]
        item = CartLine(album=album, quantity=row["quantity"], line_total=line_total)

        items.append(item)
        subtotal += line_total

    return CartRead(items=items, subtotal=subtotal, total=subtotal)

def set_quantity(db: Session, user_id: int, album_id: int, quantity: int):
    try:
        require_user(db, user_id)

        album = db.execute(
            select(albums.c.id, albums.c.stock, albums.c.hidden).where(albums.c.id == album_id).with_for_update()
        ).mappings().first()

        if album is None or album["hidden"]:
            raise HTTPException(404, "구매 가능한 음반을 찾을 수 없습니다")

        if album["stock"] < quantity:
            raise HTTPException(409, "재고가 부족합니다")

        existing = db.execute(
            select(cart_items.c.id).where(cart_items.c.user_id == user_id, cart_items.c.album_id == album_id).with_for_update()
            ).scalar()

        if existing is None:
            db.execute(
                insert(cart_items).values(user_id=user_id, album_id=album_id, quantity=quantity)
            )
        else:
            db.execute(update(cart_items).where(cart_items.c.id == existing).values(quantity=quantity)
            )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return read_cart(db, user_id)

def remove_item(db: Session, user_id: int, album_id: int):
    try:
        require_user(db, user_id)

        db.execute(
            delete(cart_items).where(cart_items.c.user_id == user_id, cart_items.c.album_id == album_id)
        )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return read_cart(db, user_id)
