"""관리자 추천 설정 로직 (목록 조회·저장). 공통 모델 Album, AlbumRecommendation을 사용합니다."""
from typing import Dict

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.features.admin.recommendations_schemas import RecommendationSave
from app.models.album import Album
from app.models.album_recommendation import AlbumRecommendation


def list_recommendations(db: Session, page: int, size: int) -> Dict:
    """모든 음반(비공개 포함)과 추천 설정을 함께 보여줍니다.
    추천 설정 줄이 아직 없는 음반도 빠지지 않도록 LEFT JOIN을 쓰고, 없으면 enabled=false, reason=""로 보여줍니다."""
    total = db.scalar(select(func.count()).select_from(Album)) or 0

    stmt = (
        select(
            Album.id.label("album_id"),
            Album.title,
            Album.artist,
            Album.genre,
            Album.stock,
            Album.hidden,
            func.coalesce(AlbumRecommendation.enabled, 0).label("enabled"),
            func.coalesce(AlbumRecommendation.reason, "").label("reason"),
        )
        .select_from(Album)
        .outerjoin(AlbumRecommendation, AlbumRecommendation.album_id == Album.id)
        .order_by(Album.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = db.execute(stmt).all()
    items = [
        {
            "album_id": row.album_id,
            "title": row.title,
            "artist": row.artist,
            "genre": row.genre,
            "stock": row.stock,
            "hidden": bool(row.hidden),
            "enabled": bool(row.enabled),
            "reason": row.reason,
        }
        for row in rows
    ]
    return {"items": items, "total": total, "page": page, "size": size}


def save_recommendation(db: Session, album_id: int, data: RecommendationSave) -> Dict:
    """추천 설정이 없으면 만들고, 있으면 수정합니다. 음반이 없으면 404."""
    if db.get(Album, album_id) is None:
        raise HTTPException(status_code=404, detail="음반을 찾을 수 없습니다.")

    recommendation = db.get(AlbumRecommendation, album_id)
    if recommendation is None:
        recommendation = AlbumRecommendation(album_id=album_id)
        db.add(recommendation)
    recommendation.enabled = 1 if data.enabled else 0
    recommendation.reason = data.reason

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {
        "album_id": album_id,
        "enabled": data.enabled,
        "reason": data.reason,
    }
