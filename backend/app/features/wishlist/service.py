from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.album import Album
from app.models.user import User
from app.models.wishlist import Wishlist

MSG_ALBUM_NOT_FOUND = "음반을 찾을 수 없습니다"


def _enum_value(v):
    return getattr(v, "value", v)


def _album_to_item(album: Album) -> dict:
    return {
        "id": album.id,
        "title": album.title,
        "artist": album.artist,
        "price": album.price,
        "format": _enum_value(album.format),
        "genre": _enum_value(album.genre),
        "image_url": album.image_url,
        "stock": album.stock,
    }


# GET /api/users/me/wishlist
def list_my_wishlist(db: Session, user: User) -> dict:
    albums = (
        db.query(Album)
        .join(Wishlist, Wishlist.album_id == Album.id)
        .filter(Wishlist.user_id == user.id)
        .filter(Album.hidden == 0)
        .order_by(Wishlist.created_at.desc(), Wishlist.id.desc())
        .all()
    )
    return {"items": [_album_to_item(a) for a in albums]}


# PUT /api/users/me/wishlist/{id}
def add_to_wishlist(db: Session, user: User, album_id: int) -> dict:
    album = db.get(Album, album_id)
    if album is None or album.hidden: 
        raise HTTPException(status.HTTP_404_NOT_FOUND, MSG_ALBUM_NOT_FOUND)

    exists = (
        db.query(Wishlist.id)
        .filter(Wishlist.user_id == user.id, Wishlist.album_id == album_id)
        .first()
    )
    if not exists:
        db.add(Wishlist(user_id=user.id, album_id=album_id))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return {"album_id": album_id, "wished": True}


# DELETE /api/users/me/wishlist/{id}
def remove_from_wishlist(db: Session, user: User, album_id: int) -> None:
    db.query(Wishlist).filter(
        Wishlist.user_id == user.id, Wishlist.album_id == album_id
    ).delete(synchronize_session=False)
    db.commit()
