# 낙원레코드 팀 프로젝트

LP·CD 입문자를 위한 음반 쇼핑몰입니다. 이 저장소는 React(JavaScript + ESLint) 화면과 FastAPI 서버, MySQL 초기 SQL을 포함한 개발 시작용 기본 틀입니다. 로그인·음반·주문 등 기능은 각 담당자가 구현합니다.

## 폴더

- `frontend/`: React 화면과 공통 색상·폰트·이미지
- `backend/`: FastAPI 서버, 공통 설정과 DB 연결
- `database/`: MySQL 테이블과 음반 목업 데이터
- `docs/`: 공통 디자인 자료 사용 안내

## 1. 처음 준비할 것

Git, Node.js 20.19 이상(20버전) 또는 22.13 이상(22버전), 또는 24 이상, Python 3.10 이상, MySQL 8.0.16 이상을 준비합니다. 설치된 버전은 `node --version`, `python3 --version`으로 확인할 수 있습니다.

```bash
git clone https://github.com/PerfumesYung/Record_Team_Project.git
cd Record_Team_Project
```

## 2. MySQL 준비

MySQL 서버를 켠 후 Workbench 등에서 `database/01_테이블_생성.sql`을 먼저 실행하고, 이어서 `database/02_음반_목업데이터.sql`을 실행합니다. 새 DB에 각각 한 번만 실행하며 이미 같은 이름의 DB가 있다면 먼저 확인합니다. 자세한 내용은 [DB 실행 안내](database/README.md)를 참고하세요. 실제 비밀번호와 `.env` 파일은 Git에 올리지 않습니다.

## 3. 서버 실행

새 터미널에서 프로젝트 폴더를 연 후 실행합니다. 아래는 macOS 기준이며 Windows에서는 가상환경 활성화 명령이 다릅니다.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

`backend/.env`의 `DATABASE_URL`에 본인 MySQL 계정·비밀번호를 입력합니다. URL에 `@`, `:`, `/`, `#` 등 특수문자가 포함된 비밀번호는 URL 인코딩이 필요합니다. `SECRET_KEY`는 로그인 구현 전 각자 안전한 임의의 긴 값으로 바꿉니다. 예시 값은 사용하지 마세요.

```bash
uvicorn main:app --reload
```

- Swagger 문서: http://127.0.0.1:8000/docs
- 서버 확인: http://127.0.0.1:8000/api/health

서버 확인 경로는 서버 실행만 확인하며 DB 연결 여부를 검사하지 않습니다. 현재는 공통 DB 연결 코드만 준비했고 테이블 자동 생성과 업무 API는 구현하지 않았습니다.

Windows PowerShell은 `python -m venv .venv`, `.venv\\Scripts\\Activate.ps1`, `Copy-Item .env.example .env`를 사용합니다.

## 4. 화면 실행

서버 터미널은 켜 둔 채로 새 터미널을 열고 실행합니다.

```bash
cd frontend
npm install
npm run dev
```

터미널에 표시된 주소(기본 http://127.0.0.1:5173)를 브라우저에서 엽니다. JavaScript 코드 점검은 `frontend` 폴더에서 `npm run lint`를 실행합니다. 현재는 시작 화면만 표시됩니다. API 연결 시 `frontend/.env.example`을 `.env`로 복사해 서버 주소를 사용할 수 있습니다. 환경 설정을 바꾼 뒤에는 개발 서버를 다시 시작하세요.

## 5. 팀 작업

최신 `main`을 받은 뒤 담당 기능 브랜치를 만들고, 본인 기능 폴더에서 작업합니다. 공통 설정·DB 모델·실행 파일을 바꿀 때는 관련 담당자와 먼저 공유합니다. 공통 색상과 글꼴은 [디자인 소스 안내](docs/공통_디자인_소스_안내.md)를 참고하세요. `.env`, 가상환경과 `node_modules`는 커밋하지 않습니다.
