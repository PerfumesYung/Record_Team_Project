"""GET /api/recommendations — 장르·아티스트 조건과 관리자 설정에 따른 음반 추천 (로그인 불필요)."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.recommendations import service
from app.features.recommendations.schemas import RecommendationResponse

router = APIRouter(prefix="/api/recommendations", tags=["추천"])


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    artist: Optional[str] = Query(default=None, max_length=100, description="아티스트 이름 일부 (대소문자 구분 없음)"),
    genre: Optional[str] = Query(default=None, max_length=50, description="장르 (Jazz, Pop, Rock, Indie, R&B, Classical)"),
    limit: int = Query(default=12, ge=1, le=20, description="최대 개수"),
    db: Session = Depends(get_db),
):
    """공개 + 재고 있음 + 관리자 추천 노출(enabled)인 음반 중에서 조건에 맞는 음반을 추천합니다."""
    return service.get_recommendations(db, artist, genre, limit)
