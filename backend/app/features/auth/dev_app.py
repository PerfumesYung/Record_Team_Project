"""회원·인증 API를 따로 확인하는 개발용 앱."""

from fastapi import FastAPI

from app.features.auth.router import router


app = FastAPI(title="낙원레코드 회원·인증 테스트")

app.include_router(router)