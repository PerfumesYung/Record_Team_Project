from datetime import datetime
from pydantic import BaseModel


class OrderItemRead(BaseModel):
    album_id: int
    title: str
    unit_price: int
    quantity: int
    line_total: int


class OrderRead(BaseModel):
    id: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemRead]


class OrderPage(BaseModel):
    items: list[OrderRead]
    total: int
    page: int
    page_size: int
