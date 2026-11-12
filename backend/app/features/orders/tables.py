from datetime import datetime
from sqlalchemy import String, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, INTEGER, VARCHAR
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True)
    user_id: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    status: Mapped[str] = mapped_column(VARCHAR(12), server_default=text("'RECEIVED'"))
    total_amount: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    created_at: Mapped[datetime] = mapped_column(DATETIME(fsp=6), server_default=text("CURRENT_TIMESTAMP(6)"))


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True)
    order_id: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    album_id: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    title: Mapped[str] = mapped_column(String(120))
    unit_price: Mapped[int] = mapped_column(INTEGER(unsigned=True))
    quantity: Mapped[int] = mapped_column(INTEGER(unsigned=True))