// 관리자 API 공통 요청 도구
// 서버 주소는 frontend/.env 의 VITE_API_BASE_URL 로 바꿀 수 있고, 없으면 로컬 FastAPI 기본 주소를 씁니다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// 로그인 토큰 읽기
// 재영의 안내: 토큰은 localStorage의 'accessToken' 키에 저장됩니다.
// 나중에 재영의 features/auth/api.js 의 getAccessToken()이 올라오면 이 함수 한 곳만 바꾸면 됩니다.
function getToken() {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null; // 저장소를 쓸 수 없는 환경
  }
}

// FastAPI 오류의 detail은 문자열일 수도, 배열일 수도 있어서 둘 다 문장으로 바꿉니다.
function readErrorMessage(status, body) {
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const text = detail
      .map((item) => String(item?.msg ?? '').replace(/^Value error, /, ''))
      .filter(Boolean)
      .join(' / ');
    if (text) return text;
  }
  if (status === 401) return '로그인이 필요하거나 만료됐어요. 다시 로그인해 주세요.';
  if (status === 403) return '관리자만 사용할 수 있어요.';
  return '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

// path 예: '/api/admin/albums?page=1'
// 성공하면 JSON을 돌려주고, 실패하면 사용자에게 보여줄 문장이 담긴 Error를 던집니다.
export async function adminRequest(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error; // 화면을 떠난 경우
    throw new Error('서버에 연결하지 못했어요. 백엔드 서버가 실행 중인지 확인해 주세요.');
  }

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch {
      // 본문이 JSON이 아니면 기본 문구를 씁니다.
    }
    throw new Error(readErrorMessage(response.status, errorBody));
  }
  return response.json();
}