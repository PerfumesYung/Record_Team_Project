from sqlalchemy import BigInteger, Column, DateTime, Integer, String, Table
from app.features.cart.tables import metadata

orders = Table("orders", metadata,
    Column("id", BigInteger, primary_key=True),
    Column("user_id", BigInteger),
    Column("status", String(12)),
    Column("total_amount", BigInteger),
    Column("created_at", DateTime),
)

order_items = Table("order_items", metadata,
    Column("id", BigInteger, primary_key=True),
    Column("order_id", BigInteger),
    Column("album_id", BigInteger),
    Column("title", String(120)),
    Column("unit_price", Integer),
    Column("quantity", Integer),
)