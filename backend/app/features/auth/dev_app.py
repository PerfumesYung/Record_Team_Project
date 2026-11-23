"""관리자 주문 API를 별도로 확인하는 테스트 앱."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.admin.orders_router import router as orders_router
from app.features.auth.router import router as auth_router


app = FastAPI(title="관리자 주문 API 테스트")

# 로컬 React 화면에서 테스트 서버로 요청할 수 있도록 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 회원가입·로그인 테스트용
app.include_router(auth_router)

# 관리자 API 앞에 /api/admin을 한 번만 붙입니다.
app.include_router(orders_router, prefix="/api/admin")
