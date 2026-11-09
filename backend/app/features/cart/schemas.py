from pydantic import BaseModel, ConfigDict, Field


class CartQuantity(BaseModel):
    model_config = ConfigDict(extra="forbid")
    quantity: int = Field(strict=True, ge=1, le=20)


class CartAlbum(BaseModel):
    id: int
    title: str
    artist: str
    format: str
    image_url: str | None
    price: int
    stock: int
    hidden: bool


class CartLine(BaseModel):
    album: CartAlbum
    quantity: int
    line_total: int


class CartRead(BaseModel):
    items: list[CartLine]
    subtotal: int
    total: int
