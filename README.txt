낙원레코드 실제 앨범 60종 확장 (LP 30 / CD 30)

1. setup_60_covers.py, albums60.json을 프로젝트 루트(middle, frontend와 database가 있는 폴더)에 복사.
2. PowerShell에서 프로젝트 루트로 이동 후:
   python -m pip install Pillow
   python setup_60_covers.py
3. 스크립트는 MusicBrainz 공식 발매판의 제목, 아티스트, 매체를 확인하고 Cover Art Archive 표지를 다운로드해 최대 500px WebP로 저장합니다. 해당 발매판에 표지가 없다면 같은 release group의 표지를 시도합니다. 60종 모두 성공할 때만 database/05_albums_60_local.sql이 생성됩니다.
4. MySQL Workbench에서 database/05_albums_60_local.sql을 열고 전체 실행. 기존 18종과 일치하는 상품은 ID, 가격, 재고, 주문, 리뷰, 찜, 장바구니, 기존 추천 설정을 유지합니다. 동일 상품을 중복 추가하지 않으며 누락된 상품만 추가합니다. 60종의 image_url을 로컬 경로로 수정하고 모두 공개(hidden=0)로 설정합니다. 품절 재고는 유지됩니다.
5. 신규 DB는 01_테이블_생성.sql 실행 뒤 기존 02_음반_목업데이터.sql 대신 생성된 05_albums_60_local.sql 실행. 팀 공유 시 기존 02 파일을 이 SQL로 교체하고 frontend/public/images/albums/mb60_*.webp 파일도 커밋하세요.
6. 현재 DB에 가상 음반 또는 추가 상품이 있으면 삭제하지 않기 때문에 전체 공개 음반 수는 60개보다 많을 수 있습니다. 기존 실제 18종만 있는 DB 또는 빈 DB에서 정확히 60종입니다. DB 백업 후 실행하세요.
7. 다운로드 실패 시 기존 성공 파일과 database/musicbrainz_60_sources.json 캐시를 재사용합니다. 실패 목록을 확인한 후 재실행. 검색 실패는 albums60.json의 search_titles 또는 search_artist를 MusicBrainz 실제 발매 표기에 맞게 조정하세요. 기존 SQL 파일은 재실행 시작 시 제거됩니다. 실패 시 새 SQL은 생성되지 않습니다.

가격과 재고는 테스트용이며 장르 분류는 사이트 기준입니다. Classical에는 현대 클래식도 포함됩니다. 외부 서버에 접속하지 못하는 환경에서 제작하였으므로 60개 발매판과 이미지 실물 다운로드는 사용자 PC에서 실행 시 검증됩니다. 커버 사용 권리는 별도 확인 필요. MusicBrainz 요청은 1.2초 간격 이상으로 제한합니다.
