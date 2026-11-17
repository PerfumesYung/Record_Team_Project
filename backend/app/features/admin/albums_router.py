"""관리자 음반 관리: #22 목록, #23 등록, #24 수정.

- 이 라우터에는 /api/admin 을 붙이지 않습니다. 통합 파일에서 한 번만 붙입니다.
  (통합 후 실제 주소: GET·POST /api/admin/albums, PATCH /api/admin/albums/{id})
- 관리자만 쓸 수 있도록 get_current_admin(재영 담당, app.features.auth.security)을 연결합니다.
  이 함수가 main에 올라오기 전에는 이 파일을 불러올 수 없습니다.
"""
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.admin import albums_service
from app.features.admin.albums_schemas import (
    AdminAlbum,
    AdminAlbumList,
    AlbumCreate,
    AlbumUpdate,
)
from app.features.auth.security import get_current_admin

router = APIRouter(
    prefix="/albums",
    tags=["관리자 음반"],
    dependencies=[Depends(get_current_admin)],  # 이 라우터의 모든 API는 관리자만 사용
)


@router.get("", response_model=AdminAlbumList)
def list_albums(
    keyword: Optional[str] = Query(default=None, max_length=100, description="제목 또는 아티스트 검색"),
    format_: Optional[Literal["LP", "CD"]] = Query(default=None, alias="format", description="LP 또는 CD"),
    genre: Optional[str] = Query(default=None, max_length=50, description="장르"),
    hidden: Optional[bool] = Query(default=None, description="생략하면 공개·비공개 모두"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """비공개를 포함한 음반 목록 (#22)"""
    return albums_service.list_albums(db, keyword, format_, genre, hidden, page, size)


@router.post("", response_model=AdminAlbum, status_code=201)
def create_album(data: AlbumCreate, db: Session = Depends(get_db)):
    """음반 등록 (#23). 기본 추천 설정(노출 꺼짐)도 함께 만들어집니다."""
    return albums_service.create_album(db, data)


@router.patch("/{album_id}", response_model=AdminAlbum)
def update_album(
    data: AlbumUpdate,
    album_id: int = Path(ge=1, description="음반 ID"),
    db: Session = Depends(get_db),
):
    """음반 정보·가격·재고·공개 여부 수정 (#24). 보낸 항목만 바뀝니다."""
    return albums_service.update_album(db, album_id, data)
