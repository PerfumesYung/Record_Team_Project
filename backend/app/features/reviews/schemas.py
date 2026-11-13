from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator


def _check_not_blank(v: Optional[str]) -> Optional[str]:
    if v is not None and not v.strip():
        raise ValueError("리뷰 내용은 공백을 제외하고 1자 이상이어야 합니다")
    return v


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=1, max_length=1000)
    _not_blank = field_validator("content")(_check_not_blank)



class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: Optional[str] = Field(None, min_length=1, max_length=1000)
    _not_blank = field_validator("content")(_check_not_blank)

    @model_validator(mode="after")
    def at_least_one_field(self):
        if self.rating is None and self.content is None:
            raise ValueError("rating 또는 content 내용이 필요합니다.")
        return self


class ReviewResponse(BaseModel):
    id: int
    album_id: int
    user_id: int
    username: str
    rating: int
    content: str
    created_at: datetime
    is_mine: bool


class MyReviewResponse(ReviewResponse):
    album_title: str
