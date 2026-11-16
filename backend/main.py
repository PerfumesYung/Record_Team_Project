"""낙원레코드 API 시작점. 각 기능 라우터는 구현 후 등록합니다."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.features.cart.router import router as cart_router
from app.features.orders.router import router as orders_router

app = FastAPI(title="낙원레코드 API")

# 로컬 React 개발 서버가 API를 호출할 수 있도록 허용합니다.
app.include_router(cart_router)
app.include_router(orders_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["서버 확인"])
def health_check():
    """서버가 실행 중인지 확인합니다. DB 연결 검사는 아닙니다."""
    return {"status": "ok"}

from app.features.cart.auth import current_user_id

# 로그인 기능 완성 전 임시 테스트
def test_user_id():
    return 1

app.dependency_overrides[current_user_id] = test_user_id
