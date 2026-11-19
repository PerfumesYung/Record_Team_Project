"""낙원레코드 API 시작점."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.features.auth.router import router as auth_router
from app.features.cart.router import router as cart_router
from app.features.orders.router import router as orders_router


#인증 라우터 등록
from app.features.auth.router import router as auth_router
from app.features.admin.orders_router import router as admin_orders_router

app = FastAPI(title="낙원레코드 API")

<<<<<<< HEAD
# 로컬 React 개발 서버가 API를 호출할 수 있도록 허용합니다.
=======
>>>>>>> 270cdeb (백엔드 수정 및 프론트엔드 추가)
app.include_router(auth_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_orders_router, prefix="/api/admin")


@app.get("/api/health", tags=["서버 확인"])
def health_check():
    return {"status": "ok"}
