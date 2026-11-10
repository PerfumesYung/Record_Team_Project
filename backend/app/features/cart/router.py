from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.db.database import get_db
from .auth import CurrentUserId
from .schemas import CartQuantity, CartRead
from .service import read_cart, remove_item, set_quantity

router = APIRouter(prefix="/api/cart", tags=["장바구니"])
DB = Annotated[Session, Depends(get_db)]


@router.get("", response_model=CartRead)
def get_cart(user_id: CurrentUserId, db: DB):
    return read_cart(db, user_id)


@router.put("/items/{album_id}", response_model=CartRead)
def put_cart_item(album_id: Annotated[int, Path(gt=0)], data: CartQuantity,
                  user_id: CurrentUserId, db: DB):
    return set_quantity(db, user_id, album_id, data.quantity)


@router.delete("/items/{album_id}", response_model=CartRead)
def delete_cart_item(album_id: Annotated[int, Path(gt=0)], user_id: CurrentUserId, db: DB):
    return remove_item(db, user_id, album_id)
