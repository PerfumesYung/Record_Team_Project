from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    album_id: int = Field(gt=0)
    quantity: int = Field(ge=1)


class CartQuantity(BaseModel):
    quantity: int = Field(ge=1)


class CartAlbum(BaseModel):
    id: int
    title: str
    artist: str
    format: str
    image_url: str | None
    stock: int


class CartItemRead(BaseModel):
    id: int
    album_id: int
    quantity: int
    unit_price: int
    subtotal: int
    album: CartAlbum


class CartRead(BaseModel):
    items: list[CartItemRead]
    total_amount: int


class CartItemChanged(BaseModel):
    id: int
    album_id: int
    quantity: int
