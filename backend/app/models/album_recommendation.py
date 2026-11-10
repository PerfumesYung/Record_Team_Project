"""음반별 추천 노출 여부와 이유를 저장하는 공통 모델."""
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, String, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, TINYINT
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AlbumRecommendation(Base):
    __tablename__ = "album_recommendations"
    __table_args__ = (
        CheckConstraint("enabled IN (0, 1)", name="ck_rec_enabled"),
        CheckConstraint("enabled = 0 OR CHAR_LENGTH(TRIM(reason)) >= 1", name="ck_rec_reason"),
    )

    album_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("albums.id", name="fk_rec_album", ondelete="RESTRICT", onupdate="RESTRICT"),
        primary_key=True,
    )
    enabled: Mapped[int] = mapped_column(TINYINT(unsigned=True), nullable=False, server_default=text("0"))
    reason: Mapped[str] = mapped_column(String(160), nullable=False, server_default=text("''"))
    created_at: Mapped[datetime] = mapped_column(DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6)"))
    updated_at: Mapped[datetime] = mapped_column(DATETIME(fsp=6), nullable=False, server_default=text("CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"))
