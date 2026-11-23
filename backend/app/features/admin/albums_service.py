"""관리자 음반 관리 로직 (조회·등록·수정). 공통 모델 Album, AlbumRecommendation을 사용합니다."""
from typing import Dict, Optional

from fastapi import HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.features.admin.albums_schemas import AlbumCreate, AlbumUpdate
from app.models.album import Album
from app.models.album_recommendation import AlbumRecommendation


def serialize_album(album: Album) -> Dict:
    """모델 → 응답. DB의 hidden(0/1)을 true/false로 바꿉니다."""
    return {
        "id": album.id,
        "title": album.title,
        "artist": album.artist,
        "price": album.price,
        "genre": album.genre,
        "format": album.format,
        "image_url": album.image_url,
        "stock": album.stock,
        "hidden": bool(album.hidden),
    }


def list_albums(
    db: Session,
    keyword: Optional[str],
    format_: Optional[str],
    genre: Optional[str],
    hidden: Optional[bool],
    page: int,
    size: int,
) -> Dict:
    """비공개를 포함한 음반 목록. hidden을 생략하면 공개·비공개 모두 보여줍니다."""
    conditions = []
    keyword = (keyword or "").strip()
    if keyword:
        # autoescape=True: 입력한 %, _ 가 검색 기호로 동작하지 않게 막습니다.
        conditions.append(
            or_(
                Album.title.contains(keyword, autoescape=True),
                Album.artist.contains(keyword, autoescape=True),
            )
        )
    if format_:
        conditions.append(Album.format == format_)
    if genre:
        conditions.append(Album.genre == genre)
    if hidden is not None:
        conditions.append(Album.hidden == (1 if hidden else 0))

    count_stmt = select(func.count()).select_from(Album)
    list_stmt = select(Album)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        list_stmt = list_stmt.where(*conditions)

    total = db.scalar(count_stmt) or 0
    albums = db.scalars(
        list_stmt.order_by(Album.id.desc()).offset((page - 1) * size).limit(size)
    ).all()
    return {
        "items": [serialize_album(album) for album in albums],
        "total": total,
        "page": page,
        "size": size,
    }


def create_album(db: Session, data: AlbumCreate) -> Dict:
    """음반과 기본 추천 설정(enabled=0, reason="")을 한 번에 저장합니다.
    둘 중 하나라도 실패하면 모두 취소(rollback)합니다."""
    album = Album(
        title=data.title,
        artist=data.artist,
        price=data.price,
        genre=data.genre,
        format=data.format,
        image_url=data.image_url,
        stock=data.stock,
        hidden=1 if data.hidden else 0,
    )
    try:
        db.add(album)
        db.flush()  # 아직 확정하지 않고 음반 번호(id)만 받아옵니다.
        db.add(AlbumRecommendation(album_id=album.id, enabled=0, reason=""))
        db.commit()  # 음반과 추천 설정을 함께 확정
    except Exception:
        db.rollback()
        raise
    return serialize_album(album)


def update_album(db: Session, album_id: int, data: AlbumUpdate) -> Dict:
    """보낸 항목만 수정합니다. 음반이 없으면 404."""
    album = db.get(Album, album_id)
    if album is None:
        raise HTTPException(status_code=404, detail="음반을 찾을 수 없습니다.")

    for name in data.model_fields_set:
        value = getattr(data, name)
        if name == "hidden":
            value = 1 if value else 0
        setattr(album, name, value)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return serialize_album(album)
