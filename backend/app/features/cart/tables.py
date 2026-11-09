from sqlalchemy import BigInteger, Column, DateTime, Integer, MetaData, String, Table

metadata = MetaData()

users = Table("users", metadata,
    Column("id", BigInteger, primary_key=True),
)

albums = Table("albums", metadata,
    Column("id", BigInteger, primary_key=True),
    Column("title", String(120)),
    Column("artist", String(100)),
    Column("price", Integer),
    Column("genre", String(50)),
    Column("format", String(2)),
    Column("image_url", String(2048)),
    Column("stock", Integer),
    Column("hidden", Integer),
)

cart_items = Table("cart_items", metadata,
    Column("id", BigInteger, primary_key=True),
    Column("user_id", BigInteger),
    Column("album_id", BigInteger),
    Column("quantity", Integer),
    Column("created_at", DateTime),
    Column("updated_at", DateTime),
)
