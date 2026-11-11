from sqlalchemy import Column, ForeignKey, Index, UniqueConstraint, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME

from app.db.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    __table_args__ = (
        UniqueConstraint("user_id", "album_id", name="uk_wish_user_album"),
        Index("idx_wish_album", "album_id"),
    )

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    user_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("users.id", name="fk_wish_user", ondelete="RESTRICT", onupdate="RESTRICT"),
        nullable=False,
    )
    album_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("albums.id", name="fk_wish_album", ondelete="RESTRICT", onupdate="RESTRICT"),
        nullable=False,
    )
    created_at = Column(
        DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)")
    )
