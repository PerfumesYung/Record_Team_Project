"""낙원레코드 API 시작점."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 일반 사용자 기능 라우터
from app.features.auth.router import router as auth_router
from app.features.cart.router import router as cart_router
from app.features.orders.router import router as orders_router

# 관리자 기능 라우터
from app.features.admin.orders_router import router as admin_orders_router
from app.features.admin.albums_router import router as admin_albums_router
from app.features.admin.recommendations_router import router as admin_recommendations_router


app = FastAPI(title="낙원레코드 API")

# React 개발 서버에서 API를 호출할 수 있도록 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 일반 사용자 API 연결
app.include_router(auth_router)
app.include_router(cart_router)
app.include_router(orders_router)

# 관리자 API 연결
app.include_router(admin_orders_router, prefix="/api/admin")
app.include_router(admin_albums_router, prefix="/api/admin")
app.include_router(admin_recommendations_router, prefix="/api/admin")


@app.get("/api/health", tags=["서버 확인"])
def health_check():
    return {"status": "ok"}