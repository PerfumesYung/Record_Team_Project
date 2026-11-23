from sqlalchemy import CheckConstraint, Column, ForeignKey, Index, String, UniqueConstraint, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, TINYINT

from app.db.database import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        UniqueConstraint("user_id", "album_id", name="uk_reviews_user_album"),
        Index("idx_reviews_album_public_created", "album_id", "hidden", "created_at", "id"),
        Index("idx_reviews_user", "user_id"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
        CheckConstraint("CHAR_LENGTH(TRIM(content)) >= 1", name="ck_reviews_content"),
        CheckConstraint("hidden IN (0, 1)", name="ck_reviews_hidden"),
    )

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    user_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("users.id", name="fk_reviews_user", ondelete="RESTRICT", onupdate="RESTRICT"),
        nullable=False,
    )
    album_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("albums.id", name="fk_reviews_album", ondelete="RESTRICT", onupdate="RESTRICT"),
        nullable=False,
    )

    rating = Column(TINYINT(unsigned=True), nullable=False)
    content = Column(String(1000), nullable=False)

    hidden = Column(TINYINT(unsigned=True), nullable=False, server_default=text("0"))

    created_at = Column(
        DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)")
    )

    updated_at = Column(
        DATETIME(fsp=6),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"),
    )
