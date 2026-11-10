from sqlalchemy import Column, MetaData, Table, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, INTEGER

metadata = MetaData()

users = Table(
    "users", metadata,
    Column("id", BIGINT(unsigned=True), primary_key=True),
)

cart_items = Table(
    "cart_items", metadata,
    Column("id", BIGINT(unsigned=True), primary_key=True),
    Column("user_id", BIGINT(unsigned=True), nullable=False),
    Column("album_id", BIGINT(unsigned=True), nullable=False),
    Column("quantity", INTEGER(unsigned=True), nullable=False),
    Column("created_at", DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)")),
    Column("updated_at", DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)")),
)
