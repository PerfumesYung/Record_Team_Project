from pydantic import BaseModel, Field


class CartQuantity(BaseModel):
    quantity: int = Field(ge=1)


class CartAlbum(BaseModel):
    id: int
    title: str
    artist: str
    format: str
    image_url: str | None
    price: int
    stock: int
    hidden: int


class CartLine(BaseModel):
    album: CartAlbum
    quantity: int
    line_total: int


class CartRead(BaseModel):
    items: list[CartLine]
    subtotal: int
    total: int
