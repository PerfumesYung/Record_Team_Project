from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.db.database import get_db
from .auth import current_user_id
from .schemas import CartQuantity, CartRead
from .service import read_cart, remove_item, set_quantity

router = APIRouter(prefix="/api/cart", tags=["장바구니"])

@router.get("", response_model=CartRead)
def get_cart(user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return read_cart(db, user_id)

@router.put("/items/{album_id}", response_model=CartRead)
def put_cart_item(data: CartQuantity, album_id: int = Path(..., gt=0), user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return set_quantity(db, user_id, album_id, data.quantity)

@router.delete("/items/{album_id}", response_model=CartRead)
def delete_cart_item(album_id: int = Path(..., gt=0), user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return remove_item(db, user_id, album_id)
