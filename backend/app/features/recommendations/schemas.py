"""추천 API의 응답 형태 (API 명세 v0.3 '추천 요청과 응답' 기준)."""
from typing import List, Optional

from pydantic import BaseModel


class RecommendedAlbum(BaseModel):
    # 음반 객체의 기본키는 id지만, 추천 응답은 명세대로 album_id를 사용합니다.
    album_id: int
    title: str
    artist: str
    price: int
    genre: str
    format: str
    image_url: Optional[str] = None  # 표지가 없으면 null. 화면에서 대체 표지를 보여줍니다.
    stock: int
    reason: str  # 관리자가 입력한 추천 이유


class RecommendationResponse(BaseModel):
    items: List[RecommendedAlbum]
    is_fallback: bool  # 조건을 완화한 대체 목록이면 True
    message: str  # 화면에 보여줄 안내 문구
