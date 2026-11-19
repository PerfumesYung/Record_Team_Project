from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from .auth import current_user_id
from .schemas import CartItemCreate, CartQuantity, CartRead, CartItemChanged
from .service import read_cart, add_cart_item, change_cart_item, remove_cart_item

router = APIRouter(prefix="/api/cart/items", tags=["장바구니"])


@router.get("", response_model=CartRead)
def get_cart(user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return read_cart(db, user_id)


@router.post("", response_model=CartItemChanged, status_code=201)
def post_cart_item(data: CartItemCreate, response: Response,
                   user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    item, created = add_cart_item(db, user_id, data.album_id, data.quantity)
    if not created:
        response.status_code = 200
    return item


@router.patch("/{id}", response_model=CartItemChanged)
def patch_cart_item(data: CartQuantity, id: int = Path(..., gt=0),
                    user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return change_cart_item(db, user_id, id, data.quantity)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(id: int = Path(..., gt=0),
                     user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    remove_cart_item(db, user_id, id)
