#음반(Albums) API 요청 및 응답 데이터 형식을 정의
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class AlbumItemResponse(BaseModel):
    #음반 목록 및 상세 조회 시 반환하는 음반 정보 형식
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    artist: str
    price: int
    genre: str
    format: Literal["LP", "CD"]
    image_url: str | None = None
    stock: int


class AlbumListResponse(BaseModel):
    #음반 목록 API(GET /api/albums)의 최종 응답 형식
    items: list[AlbumItemResponse]
    total: int
    page: int
    size: int
