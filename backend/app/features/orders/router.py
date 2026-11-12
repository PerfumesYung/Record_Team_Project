from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.features.cart.auth import current_user_id
from .schemas import OrderPage, OrderRead
from .service import checkout, list_orders, read_order, delete_order

router = APIRouter(prefix="/api/orders", tags=["주문"])

@router.post("", status_code=201, response_model=OrderRead)
def create_order(user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    return checkout(db, user_id)

@router.get("", response_model=OrderPage)
def get_orders(page: int = Query(1, ge=1),
               page_size: int = Query(10, ge=1, le=50),
               user_id: int = Depends(current_user_id),
               db: Session = Depends(get_db)):
    return list_orders(db, user_id, page, page_size)

@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int = Path(..., gt=0),
              user_id: int = Depends(current_user_id),
              db: Session = Depends(get_db)):
    return read_order(db, order_id, user_id)

@router.delete("/{order_id}")
def remove_order(order_id: int = Path(..., gt=0),
                 user_id: int = Depends(current_user_id),
                 db: Session = Depends(get_db)):
    return delete_order(db, order_id, user_id)