from sqlalchemy import Column, MetaData, Table
from sqlalchemy.dialects.mysql import BIGINT, INTEGER
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

users = Table(
    "users", MetaData(),
    Column("id", BIGINT(unsigned=True), primary_key=True)
)


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True)
    user_id: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    album_id: Mapped[int] = mapped_column(BIGINT(unsigned=True))
    quantity: Mapped[int] = mapped_column(INTEGER(unsigned=True))