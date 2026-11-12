#음반(Albums) 관련 API 경로를 처리하는 라우터
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.albums import schemas, service

router = APIRouter(prefix="/api/albums", tags=["albums"])


@router.get("", response_model=schemas.AlbumListResponse)
def list_albums(
    keyword: str | None = Query(default=None, max_length=100, description="제목 또는 아티스트 검색"),
    format: Literal["LP", "CD"] | None = Query(default=None, description="LP 또는 CD 필터"),
    genre: str | None = Query(default=None, max_length=50, description="장르 필터"),
    page: int = Query(default=1, ge=1, description="페이지 번호 (1 이상)"),
    size: int = Query(default=12, ge=1, le=50, description="페이지당 개수 (1~50)"),
    db: Session = Depends(get_db),
):
    #GET /api/albums : 음반 목록·검색·필터·페이지 조회
    items, total = service.get_public_albums(
        db=db,
        keyword=keyword,
        format=format,
        genre=genre,
        page=page,
        size=size,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/{album_id}", response_model=schemas.AlbumItemResponse)
def get_album_detail(
    album_id: int = Path(..., ge=1, description="음반 ID (양의 정수)"),
    db: Session = Depends(get_db),
):
    #GET /api/albums/{id} : 음반 상세 조회
    album = service.get_public_album_by_id(db=db, album_id=album_id)
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 음반을 찾을 수 없습니다.",
        )
    return album
