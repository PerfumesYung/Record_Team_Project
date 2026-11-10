from sqlalchemy import Column, String, Table, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, INTEGER, VARCHAR
from app.features.cart.tables import metadata

orders = Table(
    "orders", metadata,
    Column("id", BIGINT(unsigned=True), primary_key=True),
    Column("user_id", BIGINT(unsigned=True), nullable=False),
    Column("status", VARCHAR(12, charset="ascii", collation="ascii_bin"), nullable=False, server_default=text("'RECEIVED'")),
    Column("total_amount", BIGINT(unsigned=True), nullable=False),
    Column("created_at", DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)")),
    Column("updated_at", DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)")),
)

order_items = Table(
    "order_items", metadata,
    Column("id", BIGINT(unsigned=True), primary_key=True),
    Column("order_id", BIGINT(unsigned=True), nullable=False),
    Column("album_id", BIGINT(unsigned=True), nullable=False),
    Column("title", String(120), nullable=False),
    Column("unit_price", INTEGER(unsigned=True), nullable=False),
    Column("quantity", INTEGER(unsigned=True), nullable=False),
    Column("created_at", DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)")),
)