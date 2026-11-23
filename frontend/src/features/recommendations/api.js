// 추천 API 호출 (GET /api/recommendations)
// 서버 주소는 frontend/.env 의 VITE_API_BASE_URL 로 바꿀 수 있고, 없으면 로컬 FastAPI 기본 주소를 씁니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// FastAPI 오류의 detail은 문자열일 수도, 배열일 수도 있어서 둘 다 문장으로 바꿉니다. (API 명세 5장)
function readErrorMessage(body) {
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item?.msg).filter(Boolean).join(' / ') || '입력값을 확인해 주세요.';
  }
  return '추천 음반을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
}

// artist, genre는 비어 있으면 서버에 보내지 않습니다.
export async function fetchRecommendations({ artist, genre, limit }, signal) {
  const params = new URLSearchParams();
  if (artist) params.set('artist', artist);
  if (genre) params.set('genre', genre);
  if (limit) params.set('limit', String(limit));

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/recommendations?${params.toString()}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error; // 화면을 떠나거나 새 요청을 보낸 경우
    throw new Error('서버에 연결하지 못했어요. 백엔드 서버가 실행 중인지 확인해 주세요.');
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // 본문이 JSON이 아니면 기본 문구를 씁니다.
    }
    throw new Error(readErrorMessage(body));
  }
  return response.json();
}
