"""관리자 추천 관리 API(#30, #31)의 입력·응답 형태 (API 명세 v0.3 기준)."""
from typing import List

from pydantic import BaseModel, StrictBool, field_validator, model_validator

REASON_MAX_LENGTH = 160  # DB의 reason 컬럼 길이


class RecommendationSave(BaseModel):
    """PUT /api/admin/recommendations/{id} 요청 본문"""

    enabled: StrictBool
    reason: str = ""

    @field_validator("reason")
    @classmethod
    def check_reason_length(cls, value: str) -> str:
        value = value.strip()
        if len(value) > REASON_MAX_LENGTH:
            raise ValueError(f"추천 이유는 {REASON_MAX_LENGTH}자 이하로 입력해 주세요.")
        return value

    @model_validator(mode="after")
    def check_reason_when_enabled(self):
        # 노출을 켤 때는 이유가 공백 제외 1자 이상이어야 합니다. (끌 때는 빈 문자열 허용)
        if self.enabled and not self.reason:
            raise ValueError(f"추천 노출을 켜려면 추천 이유를 1~{REASON_MAX_LENGTH}자로 입력해 주세요.")
        return self


class AdminRecommendation(BaseModel):
    """관리자 추천 목록의 한 줄: 음반 정보 + 추천 설정"""

    album_id: int
    title: str
    artist: str
    genre: str
    stock: int
    hidden: bool
    enabled: bool
    reason: str


class AdminRecommendationList(BaseModel):
    items: List[AdminRecommendation]
    total: int
    page: int
    size: int


class AdminRecommendationSaved(BaseModel):
    """저장 결과"""

    album_id: int
    enabled: bool
    reason: str
