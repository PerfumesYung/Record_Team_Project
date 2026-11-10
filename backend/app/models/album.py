"""음반 테이블의 공통 SQLAlchemy 모델."""
from datetime import datetime

from sqlalchemy import CheckConstraint, Index, String, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, INTEGER, TINYINT, VARCHAR
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Album(Base):
    __tablename__ = "albums"
    __table_args__ = (
        Index("idx_albums_public_format_genre", "hidden", "format", "genre", "id"),
        CheckConstraint("CHAR_LENGTH(TRIM(title)) >= 1", name="ck_albums_title"),
        CheckConstraint("CHAR_LENGTH(TRIM(artist)) >= 1", name="ck_albums_artist"),
        CheckConstraint("CHAR_LENGTH(TRIM(genre)) >= 1", name="ck_albums_genre"),
        CheckConstraint("format IN ('LP', 'CD')", name="ck_albums_format"),
        CheckConstraint("hidden IN (0, 1)", name="ck_albums_hidden"),
    )

    id: Mapped[int] = mapped_column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    artist: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[int] = mapped_column(INTEGER(unsigned=True), nullable=False)
    genre: Mapped[str] = mapped_column(String(50), nullable=False)
    format: Mapped[str] = mapped_column(VARCHAR(2, charset="ascii", collation="ascii_bin"), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    stock: Mapped[int] = mapped_column(INTEGER(unsigned=True), nullable=False, server_default=text("0"))
    hidden: Mapped[int] = mapped_column(TINYINT(unsigned=True), nullable=False, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)"))
    updated_at: Mapped[datetime] = mapped_column(DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"))
