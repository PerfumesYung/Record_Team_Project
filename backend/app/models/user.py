"""users 테이블을 다루는 공통 모델."""
from sqlalchemy import CheckConstraint, Column, String, text
from sqlalchemy.dialects.mysql import BIGINT, DATETIME, VARCHAR
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "CHAR_LENGTH(TRIM(email)) >= 1",
            name="ck_users_email",
        ),
        CheckConstraint(
            "CHAR_LENGTH(TRIM(username)) >= 2",
            name="ck_users_username",
        ),
        CheckConstraint(
            "CHAR_LENGTH(password_hash) >= 1",
            name="ck_users_password_hash",
        ),
        CheckConstraint(
            "role IN ('MEMBER', 'ADMIN')",
            name="ck_users_role",
        ),
    )

    # 사용자 번호
    id = Column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )

    # 로그인에 사용할 이메일
    email = Column(
        String(254),
        nullable=False,
        unique=True,
    )

    # 화면에 표시할 이름
    username = Column(
        String(50),
        nullable=False,
    )

    # 비밀번호 원문이 아닌 해시값
    password_hash = Column(
        String(255),
        nullable=False,
    )

    # 일반 회원 MEMBER / 관리자 ADMIN
    role = Column(
        VARCHAR(10, charset="ascii", collation="ascii_bin"),
        nullable=False,
        server_default=text("'MEMBER'"),
    )

    created_at = Column(
        DATETIME(fsp=6),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP(6)"),
    )

    updated_at = Column(
        DATETIME(fsp=6),
        nullable=False,
        server_default=text(
            "CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)"
        ),
    )