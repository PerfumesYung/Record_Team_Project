# Mac 설치·실행 안내

이 문서는 **macOS의 VS Code 터미널 또는 터미널 앱(zsh)** 기준입니다. 프로젝트는 현재 개발 시작용 기본 틀이며, 로그인·음반·주문 기능은 아직 구현하지 않았습니다.

## 1. 필요한 프로그램 확인

Git, Node.js, Python, MySQL Server와 MySQL Workbench를 설치합니다. Node.js는 **20.19 이상인 20버전, 22.13 이상인 22버전 또는 24 이상**, Python은 **3.10 이상**, MySQL은 **8.0.16 이상**이 필요합니다.

터미널에서 다음을 확인합니다.

```bash
git --version
node --version
npm --version
python3 --version
```

명령을 찾지 못하면 설치 상태를 확인한 뒤 터미널을 다시 열어 주세요. MySQL Server가 실행 중이어야 합니다. Workbench는 서버에 접속해 SQL을 실행하는 도구입니다.

## 2. 프로젝트 내려받기

프로젝트를 저장할 폴더로 이동한 뒤 실행합니다. 이미 내려받았다면 다시 clone하지 말고 기존 프로젝트를 엽니다.

```bash
git clone https://github.com/PerfumesYung/Record_Team_Project.git
cd Record_Team_Project
```

팀 작업 전 최신 `main`을 확인하고 본인 작업 브랜치를 만듭니다. 브랜치 이름과 협업 방식은 팀에서 정한 기준을 따릅니다.

## 3. 각자의 MySQL DB 준비

1. MySQL Server를 켜고 Workbench에서 **본인의 로컬 MySQL**에 접속합니다.
2. 저장소의 `database/01_테이블_생성.sql`을 열어 전체 실행합니다.
3. `database/02_음반_목업데이터.sql`을 열어 전체 실행합니다.
4. 아래 명령으로 생성된 테이블을 확인합니다.

```sql
USE nakwon_records;
SHOW TABLES;
```

새 DB 초기 생성용이므로 같은 이름의 DB나 테이블이 이미 있다면 먼저 확인합니다. 목업 SQL은 **빈 albums 테이블에 한 번만** 실행합니다. 팀원별 DB는 서로 자동 동기화되지 않습니다. 자세한 내용은 [DB 안내](../database/README.md)를 참고하세요.

## 4. 백엔드 준비와 실행

VS Code에서 프로젝트 최상위 폴더를 열고 **새 터미널**에서 입력합니다.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

`backend/.env`가 아직 없을 때만 예시를 복사합니다. 이미 있다면 덮어쓰지 말고 파일을 열어 확인하세요.

```bash
cp -n .env.example .env
```

생성된 `backend/.env`에서 `USERNAME`과 `PASSWORD`를 본인 MySQL 계정 정보로 바꾸고 `SECRET_KEY`도 본인만 사용하는 긴 임의의 값으로 바꿉니다. 실제 `.env`는 공유하거나 Git에 올리지 않습니다. 비밀번호에 `@`, `:`, `/`, `#` 등 URL에서 특별한 의미가 있는 문자가 있다면 URL 인코딩이 필요합니다.

```bash
python -m uvicorn main:app --reload
```

- Swagger: http://127.0.0.1:8000/docs
- 서버 실행 확인: http://127.0.0.1:8000/api/health

서버 확인 주소는 서버 실행만 확인하고 **실제 DB 연결은 확인하지 않습니다.** MySQL 접속과 SQL 실행은 Workbench에서 별도로 확인합니다. 현재 기본 틀에는 앱에서 DB 연결을 확인하는 경로가 없으므로 앱과 DB의 연결 여부는 별도 점검이 필요합니다. 서버 종료는 해당 터미널에서 `Ctrl + C`입니다.

## 5. 프론트엔드 준비와 실행

백엔드 터미널을 켜 둔 채 **프로젝트 최상위 폴더에서 새 터미널**을 엽니다.

```bash
cd frontend
npm ci
npm run dev
```

터미널에 표시되는 주소(기본 http://127.0.0.1:5173)를 엽니다. 현재는 임시 시작 화면만 나옵니다. 코드 검사는 별도 터미널에서 `frontend` 폴더로 이동해 `npm run lint`를 실행합니다.

프론트에서 API 주소 설정이 필요한 기능을 연결할 때는 `frontend` 폴더에서 `cp -n .env.example .env`로 복사할 수 있습니다. 이미 `.env`가 있다면 덮어쓰지 마세요. 설정을 바꾸면 프론트 개발 서버를 다시 시작합니다.

## 6. 자주 헷갈리는 부분

- `ModuleNotFoundError`: `backend` 폴더에서 가상환경을 활성화하고 `python -m pip install -r requirements.txt`를 실행했는지 확인합니다.
- MySQL 접속 오류: 서버가 실행 중인지, `.env`의 계정·비밀번호·DB 이름이 맞는지 확인합니다. 실제 비밀번호는 채팅에 붙여 넣지 않습니다.
- `npm`을 찾지 못함: Node.js 설치 후 터미널을 다시 열고 `node --version`, `npm --version`을 확인합니다.
- 업무 API는 아직 구현 전이므로 Swagger에는 서버 확인 경로만 표시됩니다.
