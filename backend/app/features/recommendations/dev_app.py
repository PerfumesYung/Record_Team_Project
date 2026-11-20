"""추천 API만 따로 실행해 보는 테스트용 서버입니다. (공통 main.py는 수정하지 않습니다.)

실행 (backend 폴더에서, 가상환경이 켜진 터미널):
    python -m uvicorn app.features.recommendations.dev_app:app --reload --port 8001

확인:
    Swagger 화면: http://127.0.0.1:8001/docs
    화면(React)과 함께 테스트하려면 frontend/.env 에 아래 한 줄을 적고 npm run dev를 다시 시작하세요.
    VITE_API_BASE_URL=http://127.0.0.1:8001

통합할 때는 공통 main.py에 라우터가 연결되므로 이 파일은 쓰지 않습니다.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.recommendations.router import router

app = FastAPI(title="추천 API 테스트")

# main.py와 같은 설정: 로컬 React 개발 서버가 호출할 수 있게 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
