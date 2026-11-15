"""낙원레코드 API 시작점. 각 기능 라우터는 구현 후 등록합니다."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


#인증 라우터 등록
from app.features.auth.router import router as auth_router
from app.features.admin.orders_router import router as admin_orders_router

app = FastAPI(title="낙원레코드 API")

# 로컬 React 개발 서버가 API를 호출할 수 있도록 허용합니다.
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
    """서버가 실행 중인지 확인합니다. DB 연결 검사는 아닙니다."""
    return {"status": "ok"}
