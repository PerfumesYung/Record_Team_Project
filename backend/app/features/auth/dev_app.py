"""관리자 주문 API를 별도로 확인하는 테스트 앱."""

from fastapi import FastAPI

from app.features.admin.orders_router import router as orders_router
from app.features.auth.router import router as auth_router


app = FastAPI(title="관리자 주문 API 테스트")

# 회원가입·로그인 테스트용
app.include_router(auth_router)

# 관리자 API 앞에 /api/admin을 한 번만 붙입니다.
app.include_router(orders_router, prefix="/api/admin")