"""관리자 음반·추천 API만 따로 실행해 보는 '테스트 전용' 서버입니다. (공통 main.py는 수정하지 않습니다.)

실행 (backend 폴더에서, 가상환경이 켜진 터미널):
    python -m uvicorn app.features.admin.dev_admin_app:app --reload --port 8001
    (추천 테스트 서버를 켜 둔 상태라면 먼저 Ctrl+C로 끄거나 --port 8002 처럼 다른 번호를 쓰세요.)

확인: http://127.0.0.1:8001/docs  (주소는 통합 후와 같은 /api/admin/... 입니다)

주의 — 관리자 검사 (재영 담당 app.features.auth.security.get_current_admin):
  * 그 파일이 이미 있으면 진짜 관리자 검사를 그대로 사용합니다. (로그인한 관리자 토큰이 필요)
  * 아직 없으면 '검사 없이 통과하는 가짜 함수'로 대신합니다. 이때는 터미널에 [경고]가 나오며,
    이 가짜 함수는 이 테스트 파일 안에서만 동작합니다. 공통 파일에는 들어가지 않습니다.
  * 이 파일은 실제 서비스(통합 main.py)에서 쓰지 않습니다.
"""
import sys
import types

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_AUTH_MODULE = "app.features.auth.security"

try:
    from app.features.auth.security import get_current_admin  # noqa: F401
    print("[안내] 실제 get_current_admin을 사용합니다. 관리자 토큰이 필요합니다.")
except ModuleNotFoundError as error:
    if error.name != _AUTH_MODULE:
        raise  # security.py 안에서 다른 패키지가 없는 경우는 숨기지 않습니다.
    fake_security = types.ModuleType(_AUTH_MODULE)

    def get_current_admin():
        """테스트 전용 가짜 함수: 아무 검사 없이 통과합니다."""
        return None

    fake_security.get_current_admin = get_current_admin
    sys.modules[_AUTH_MODULE] = fake_security
    print("[경고] app.features.auth.security가 아직 없어 관리자 검사 없이 실행합니다. (테스트 전용)")

# 위 처리가 끝난 뒤에 불러와야 합니다.
from app.features.admin.albums_router import router as albums_router  # noqa: E402
from app.features.admin.recommendations_router import router as recommendations_router  # noqa: E402

app = FastAPI(title="관리자 음반·추천 API 테스트")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 통합 main.py에서도 /api/admin 을 한 번만 붙이는 방식과 같습니다.
app.include_router(albums_router, prefix="/api/admin")
app.include_router(recommendations_router, prefix="/api/admin")
