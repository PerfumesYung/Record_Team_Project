// 공통 API 요청: 인증 담당자가 저장한 access_token을 Authorization 헤더로 보냅니다.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function errorText(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || '입력값을 확인해 주세요.').join('\n');
  return '요청을 처리하지 못했습니다.';
}

export async function apiRequest(path, { method = 'GET', token, body, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers, signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('서버에 연결할 수 없습니다. FastAPI 실행 상태와 API 주소를 확인해 주세요.');
  }

  if (response.status === 204) return null;
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('nakwon-auth-changed'));
      throw new Error('로그인이 만료되었거나 인증이 필요합니다. 다시 로그인해 주세요.');
    }
    throw new Error(errorText(data?.detail) || `HTTP ${response.status}`);
  }
  return data;
}

export function formatPrice(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`;
}

export function formatDate(value) {
  if (!value) return '-';
  // 서버가 시간대 없는 UTC DATETIME을 반환하는 경우 UTC로 해석합니다.
  const text = String(value);
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(text) ? text : `${text}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? text : new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}

export const STATUS_LABEL = {
  RECEIVED: '접수 완료', PROCESSING: '처리 중', COMPLETED: '처리 완료',
};
