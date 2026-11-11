from typing import Optional
from pydantic import BaseModel


class WishlistAlbumItem(BaseModel):
    id: int
    title: str
    artist: str
    price: int
    format: str
    genre: str
    image_url: Optional[str]


class WishlistListResponse(BaseModel):
    items: list[WishlistAlbumItem]


class WishlistAddResponse(BaseModel):
    album_id: int
    wished: bool
