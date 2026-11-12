#음반(Albums) 조회·검색·필터링 비즈니스 로직을 처리
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.album import Album


def get_public_albums(
    db: Session,
    keyword: str | None = None,
    format: str | None = None,
    genre: str | None = None,
    page: int = 1,
    size: int = 12,
) -> tuple[list[Album], int]:
    #공개된(hidden == 0) 음반 목록을 조건에 맞게 필터링하여 반환
    #기본 조건: 비공개(hidden=1) 음반은 일반 사용자에게 노출하지 않음
    conditions = [Album.hidden == 0]

    # 1. 검색어(keyword) 필터: 제목 또는 아티스트에 포함되어 있는지 검사
    if keyword and keyword.strip():
        clean_keyword = f"%{keyword.strip()}%"
        conditions.append(
            or_(
                Album.title.ilike(clean_keyword),
                Album.artist.ilike(clean_keyword),
            )
        )

    #포맷(format) 필터: LP 또는 CD
    if format and format.strip():
        conditions.append(Album.format == format.strip())

    #장르(genre) 필터
    if genre and genre.strip():
        conditions.append(Album.genre == genre.strip())

    #전체 개수(total) 조회
    count_stmt = select(func.count()).select_from(Album).where(*conditions)
    total = db.scalar(count_stmt) or 0

    #페이지네이션 적용 목록 조회 (최신 등록순 또는 ID 오름차순 정렬)
    offset = (page - 1) * size
    list_stmt = (
        select(Album)
        .where(*conditions)
        .order_by(Album.id.asc())
        .offset(offset)
        .limit(size)
    )
    items = list(db.scalars(list_stmt).all())

    return items, total


def get_public_album_by_id(db: Session, album_id: int) -> Album | None:
    #음반 ID로 공개된(hidden == 0) 음반 상세 정보를 조회
    stmt = select(Album).where(Album.id == album_id, Album.hidden == 0)
    return db.scalar(stmt)
