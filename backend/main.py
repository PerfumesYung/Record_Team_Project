"""낙원레코드 API 시작점."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.features.auth.router import router as auth_router
from app.features.cart.router import router as cart_router
from app.features.orders.router import router as orders_router

app = FastAPI(title="낙원레코드 API")

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


@app.get("/api/health", tags=["서버 확인"])
def health_check():
    return {"status": "ok"}
