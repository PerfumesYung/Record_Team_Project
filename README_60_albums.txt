낙원레코드 실제 앨범 60종 통합 설치 (기존 59개 표지 포함)

1. 압축을 프로젝트 루트(C:\middle)에 풀고 기존 파일을 덮어씁니다.
2. PowerShell에서 cd C:\middle
   python -m pip install Pillow
   python setup_60_covers.py
3. Local covers: 60/60 확인 후 MySQL Workbench에서 database/05_albums_60_local.sql 전체 실행.

56번 In a Time Lapse는 같은 앨범의 CD 표지를 사용하되 상품 포맷은 LP 유지.
MusicBrainz의 앞면 표지 주소를 직접 시도하며 기존 59개는 검증된 캐시를 재사용.
다운로드 실패 시 SQL은 생성되지만 56번은 외부 URL로 임시 표시됩니다.
다시 실행하면 누락 이미지 다운로드를 재시도합니다. SQL도 다시 적용하세요.
--sql-only는 다운로드를 건너뛰므로 최초 설치에는 사용하지 마세요.
기존 회원, 주문, 리뷰, 가격, 재고 및 ID 유지. 60종 외 모든 상품(관리자 추가 상품 포함)은 비공개.
DB 백업 후 SQL 적용. 실제 MySQL 실행은 사용자 환경에서 확인.
