# 낙원레코드 팀 프로젝트

LP·CD 입문자를 위한 음반 쇼핑몰입니다. 이 저장소에는 React(JavaScript + ESLint + Tailwind CSS), FastAPI, MySQL 개발을 시작하기 위한 기본 틀이 있습니다. 로그인·음반·주문 기능은 각 담당자가 구현합니다.

## 운영체제별 실행 안내

1. **Windows 사용자:** [Windows 설치·실행 안내](docs/실행안내_Windows.md) — VS Code 터미널에서 PowerShell 사용
2. **Mac 사용자:** [Mac 설치·실행 안내](docs/실행안내_Mac.md) — VS Code 터미널 또는 터미널 앱 사용

처음 설치부터 로컬 DB 생성, 백엔드·프론트 실행까지 각 문서에 순서대로 적혀 있습니다. 팀원마다 자신의 컴퓨터에 MySQL을 준비합니다.

## 주요 폴더와 문서

- `frontend/`: React 화면, 공통 색상·폰트·이미지
- `backend/`: FastAPI 서버, 공통 설정과 DB 연결
- `database/`: [DB 생성 및 목업 실행 안내](database/README.md)
- [공통 디자인 소스 안내](docs/공통_디자인_소스_안내.md)
- [팀원별 AI 개발 프롬프트](docs/팀원별_AI_개발_프롬프트.md)

`.env`, 가상환경과 `node_modules`에는 개인 설정이나 설치 파일이 들어가므로 Git에 올리지 않습니다. 공유용 예시는 `.env.example`을 사용합니다.
