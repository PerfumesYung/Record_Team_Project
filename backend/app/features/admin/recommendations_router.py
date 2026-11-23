"""관리자 추천 관리: #30 목록 조회, #31 저장.

- 이 라우터에는 /api/admin 을 붙이지 않습니다. 통합 파일에서 한 번만 붙입니다.
  (통합 후 실제 주소: GET /api/admin/recommendations, PUT /api/admin/recommendations/{id})
- 관리자만 쓸 수 있도록 get_current_admin(재영 담당, app.features.auth.security)을 연결합니다.
  이 함수가 main에 올라오기 전에는 이 파일을 불러올 수 없습니다.
"""
from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.admin import recommendations_service
from app.features.admin.recommendations_schemas import (
    AdminRecommendationList,
    AdminRecommendationSaved,
    RecommendationSave,
)
from app.features.auth.security import get_current_admin

router = APIRouter(
    prefix="/recommendations",
    tags=["관리자 추천"],
    dependencies=[Depends(get_current_admin)],  # 이 라우터의 모든 API는 관리자만 사용
)


@router.get("", response_model=AdminRecommendationList)
def list_recommendations(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """음반별 추천 노출 설정·이유 조회 (#30)"""
    return recommendations_service.list_recommendations(db, page, size)


@router.put("/{album_id}", response_model=AdminRecommendationSaved)
def save_recommendation(
    data: RecommendationSave,
    album_id: int = Path(ge=1, description="음반 ID"),
    db: Session = Depends(get_db),
):
    """음반별 추천 노출 설정·이유 저장 (#31). 설정이 없으면 만들고 있으면 수정합니다."""
    return recommendations_service.save_recommendation(db, album_id, data)
