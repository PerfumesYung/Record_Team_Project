"""회원가입·로그인·내 정보 API."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.features.auth.schemas import (
    CurrentUserRead,
    TokenResponse,
    UserCreate,
    UserRead,
)
from app.features.auth.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.user import User


router = APIRouter(prefix="/api", tags=["회원·인증"])


@router.post(
    "/users",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    data: UserCreate,
    db: Session = Depends(get_db),
):
    """회원가입."""

    # 이름 앞뒤의 불필요한 공백 제거
    username = data.username.strip()

    if len(username) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="사용자 이름은 공백을 제외하고 2자 이상이어야 합니다.",
        )

    email = str(data.email)

    # 이미 가입된 이메일인지 확인
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 사용 중인 이메일입니다.",
        )

    # 비밀번호 원문 대신 해시를 저장
    new_user = User(
        email=email,
        username=username,
        password_hash=hash_password(data.password),
        role="MEMBER",
    )

    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        # 동시에 같은 이메일로 가입한 경우도 중복 처리
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 사용 중인 이메일입니다.",
            )

        # 이메일 중복 외의 DB 오류는 그대로 확인
        raise

    db.refresh(new_user)

    return new_user


@router.post(
    "/auth/token",
    response_model=TokenResponse,
)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """이메일과 비밀번호를 확인하고 JWT를 발급."""

    # OAuth2 form에서는 username 항목에 이메일을 입력
    user = db.query(User).filter(User.email == form.username).first()

    if user is None or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id)

    return TokenResponse(access_token=access_token)


@router.get(
    "/users/me",
    response_model=CurrentUserRead,
)
def read_my_info(
    current_user: User = Depends(get_current_user),
):
    """토큰에 해당하는 현재 로그인 사용자 정보."""

    return CurrentUserRead(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_admin=current_user.role == "ADMIN",
    )