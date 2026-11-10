from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.cart.auth import CurrentUserId
from .schemas import OrderPage, OrderRead
from .service import checkout, list_orders, read_order

router = APIRouter(prefix="/api/orders", tags=["주문"])
DB = Annotated[Session, Depends(get_db)]


@router.post("", status_code=201, response_model=OrderRead)
def create_order(user_id: CurrentUserId, db: DB):
    return checkout(db, user_id)


@router.get("", response_model=OrderPage)
def get_orders(user_id: CurrentUserId, db: DB,
               page: Annotated[int, Query(ge=1)] = 1,
               page_size: Annotated[int, Query(ge=1, le=50)] = 10):
    return list_orders(db, user_id, page, page_size)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: Annotated[int, Path(gt=0)], user_id: CurrentUserId, db: DB):
    return read_order(db, order_id, user_id)
