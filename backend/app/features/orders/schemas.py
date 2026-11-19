from datetime import datetime
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    album_id: int = Field(gt=0)
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    album_id: int
    title: str
    unit_price: int
    quantity: int


class OrderRead(BaseModel):
    id: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemRead]


class OrderSummary(BaseModel):
    id: int
    status: str
    total_amount: int
    created_at: datetime


class OrderPage(BaseModel):
    items: list[OrderSummary]
    total: int
    page: int
    size: int
