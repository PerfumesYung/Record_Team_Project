"""관리자 음반 관리 API(#22~#24)의 입력·응답 형태 (API 명세 v0.3 기준)."""
from typing import Annotated, List, Literal, Optional

from pydantic import BaseModel, Field, StrictBool, field_validator, model_validator

# 장르 선택지 (API 명세·DB 정의서 기준). 추가할 때는 화면과 서버 기준을 함께 바꿔야 합니다.
GENRES = ("Jazz", "Pop", "Rock", "Indie", "R&B", "Classical")

# DB의 INT UNSIGNED 최댓값. 가격·재고는 0 이상 이 값 이하의 정수만 받습니다.
UINT_MAX = 4_294_967_295
UnsignedInt = Annotated[int, Field(strict=True, ge=0, le=UINT_MAX)]


def _clean_text(value: str, label: str, max_length: int) -> str:
    """앞뒤 공백을 지우고 1~max_length자인지 검사합니다."""
    value = value.strip()
    if not 1 <= len(value) <= max_length:
        raise ValueError(f"{label}은(는) 공백을 제외하고 1~{max_length}자로 입력해 주세요.")
    return value


def _clean_genre(value: str) -> str:
    value = value.strip()
    if value not in GENRES:
        raise ValueError("장르는 " + ", ".join(GENRES) + " 중에서 선택해 주세요.")
    return value


def _clean_image_url(value: Optional[str]) -> Optional[str]:
    """이미지 경로·주소. 비워 두면 null로 저장되어 화면에서 대체 표지를 보여줍니다."""
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    if len(value) > 2048:
        raise ValueError("이미지 주소는 2048자 이하로 입력해 주세요.")
    return value


class AlbumCreate(BaseModel):
    """POST /api/admin/albums 요청 본문"""

    title: str
    artist: str
    price: UnsignedInt
    genre: str
    format: Literal["LP", "CD"]
    stock: UnsignedInt
    hidden: StrictBool = False  # 기본은 공개
    image_url: Optional[str] = None

    @field_validator("title")
    @classmethod
    def check_title(cls, value: str) -> str:
        return _clean_text(value, "음반명", 120)

    @field_validator("artist")
    @classmethod
    def check_artist(cls, value: str) -> str:
        return _clean_text(value, "아티스트", 100)

    @field_validator("genre")
    @classmethod
    def check_genre(cls, value: str) -> str:
        return _clean_genre(value)

    @field_validator("image_url")
    @classmethod
    def check_image_url(cls, value: Optional[str]) -> Optional[str]:
        return _clean_image_url(value)


class AlbumUpdate(BaseModel):
    """PATCH /api/admin/albums/{id} 요청 본문. 보낸 항목만 바꿉니다. (최소 1개 필요)"""

    title: Optional[str] = None
    artist: Optional[str] = None
    price: Optional[UnsignedInt] = None
    genre: Optional[str] = None
    format: Optional[Literal["LP", "CD"]] = None
    stock: Optional[UnsignedInt] = None
    hidden: Optional[StrictBool] = None
    image_url: Optional[str] = None  # null 또는 빈 문자열을 보내면 이미지를 지웁니다.

    @field_validator("title")
    @classmethod
    def check_title(cls, value: Optional[str]) -> Optional[str]:
        return None if value is None else _clean_text(value, "음반명", 120)

    @field_validator("artist")
    @classmethod
    def check_artist(cls, value: Optional[str]) -> Optional[str]:
        return None if value is None else _clean_text(value, "아티스트", 100)

    @field_validator("genre")
    @classmethod
    def check_genre(cls, value: Optional[str]) -> Optional[str]:
        return None if value is None else _clean_genre(value)

    @field_validator("image_url")
    @classmethod
    def check_image_url(cls, value: Optional[str]) -> Optional[str]:
        return _clean_image_url(value)

    @model_validator(mode="after")
    def check_not_empty(self):
        if not self.model_fields_set:
            raise ValueError("변경할 항목을 하나 이상 보내 주세요.")
        # image_url 말고는 값을 비울(null) 수 없습니다.
        for name in ("title", "artist", "price", "genre", "format", "stock", "hidden"):
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} 값은 비울 수 없습니다.")
        return self


class AdminAlbum(BaseModel):
    """관리자 음반 응답: 일반 음반 필드 + hidden"""

    id: int
    title: str
    artist: str
    price: int
    genre: str
    format: str
    image_url: Optional[str] = None
    stock: int
    hidden: bool


class AdminAlbumList(BaseModel):
    items: List[AdminAlbum]
    total: int
    page: int
    size: int
