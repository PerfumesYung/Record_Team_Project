"""추천 음반을 고르는 로직.

공통 DB 모델(app/models)이 아직 없어서 SQLAlchemy의 text()로 SQL을 직접 실행합니다.
모델이 생기면 find_candidates 함수 안쪽만 모델 조회로 바꾸면 됩니다.
"""
from typing import Callable, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

# 화면에 보여줄 안내 문구
MESSAGE_BOTH = "장르·아티스트 조건으로 고른 음반입니다."
MESSAGE_GENRE_ONLY = "선택한 장르로 고른 음반입니다."
MESSAGE_ARTIST_ONLY = "입력한 아티스트로 고른 음반입니다."
MESSAGE_DEFAULT = "조건 없이 추천 중인 음반을 보여드려요."
MESSAGE_FALLBACK_GENRE = "입력한 아티스트의 음반이 없어 같은 장르의 추천 음반을 보여드려요."
MESSAGE_FALLBACK_ALL = "조건에 맞는 음반이 없어 추천 중인 다른 음반을 보여드려요."
MESSAGE_NONE = "지금은 추천할 수 있는 음반이 없어요."

# 추천 후보: 공개(hidden=0) + 재고 있음(stock>0) + 관리자가 추천 노출(enabled=1)
CANDIDATE_SQL = """
SELECT a.id AS album_id, a.title, a.artist, a.price, a.genre,
       a.format, a.image_url, a.stock, ar.reason
FROM albums AS a
JOIN album_recommendations AS ar ON ar.album_id = a.id
WHERE a.hidden = 0 AND a.stock > 0 AND ar.enabled = 1
"""

LIKE_ESCAPE = "!"

# find(artist, genre, limit) -> 음반 목록. 테스트에서 가짜 조회 함수로 바꿀 수 있게 분리했습니다.
FindFunction = Callable[[Optional[str], Optional[str], int], List[Dict]]


def _like_pattern(word: str) -> str:
    """입력한 글자 안의 %, _ 가 검색 기호로 동작하지 않게 막고 '포함' 검색 형태로 만듭니다."""
    escaped = (
        word.replace(LIKE_ESCAPE, LIKE_ESCAPE * 2)
        .replace("%", LIKE_ESCAPE + "%")
        .replace("_", LIKE_ESCAPE + "_")
    )
    return f"%{escaped}%"


def find_candidates(
    db: Session, artist: Optional[str], genre: Optional[str], limit: int
) -> List[Dict]:
    """추천 후보 중 조건(아티스트 일부 검색, 장르 일치)에 맞는 음반을 최대 limit개 가져옵니다."""
    sql = CANDIDATE_SQL
    params: Dict = {"limit": limit}
    if genre:
        sql += " AND a.genre = :genre"
        params["genre"] = genre
    if artist:
        sql += f" AND a.artist LIKE :artist ESCAPE '{LIKE_ESCAPE}'"
        params["artist"] = _like_pattern(artist)
    sql += " ORDER BY a.id DESC LIMIT :limit"
    rows = db.execute(text(sql), params).mappings().all()
    return [dict(row) for row in rows]


def choose_recommendations(
    find: FindFunction, artist: Optional[str], genre: Optional[str], limit: int
) -> Tuple[List[Dict], bool, str]:
    """(음반 목록, 대체 목록 여부, 안내 문구)를 돌려줍니다.

    대체 목록 순서 (팀 확인 완료):
      1) 아티스트+장르가 모두 맞는 음반
      2) 없으면 장르만 맞는 음반   (둘 다 입력한 경우에만)
      3) 없으면 노출 중인 전체 후보
    """
    artist = (artist or "").strip()
    genre = (genre or "").strip()

    # 조건을 입력하지 않았으면 후보 목록과 기본 안내를 반환합니다.
    if not artist and not genre:
        items = find(None, None, limit)
        return (items, False, MESSAGE_DEFAULT) if items else ([], False, MESSAGE_NONE)

    # 1) 입력한 조건을 모두 적용
    items = find(artist or None, genre or None, limit)
    if items:
        if artist and genre:
            message = MESSAGE_BOTH
        elif genre:
            message = MESSAGE_GENRE_ONLY
        else:
            message = MESSAGE_ARTIST_ONLY
        return items, False, message

    # 2) 아티스트와 장르를 모두 입력했는데 결과가 없으면 장르만 적용
    if artist and genre:
        items = find(None, genre, limit)
        if items:
            return items, True, MESSAGE_FALLBACK_GENRE

    # 3) 그래도 없으면 노출 중인 전체 후보
    items = find(None, None, limit)
    if items:
        return items, True, MESSAGE_FALLBACK_ALL

    # 추천 후보가 아예 없는 경우
    return [], False, MESSAGE_NONE


def get_recommendations(
    db: Session, artist: Optional[str], genre: Optional[str], limit: int
) -> Dict:
    items, is_fallback, message = choose_recommendations(
        lambda a, g, n: find_candidates(db, a, g, n), artist, genre, limit
    )
    return {"items": items, "is_fallback": is_fallback, "message": message}
