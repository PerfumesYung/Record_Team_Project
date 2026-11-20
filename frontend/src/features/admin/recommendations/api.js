// 관리자 추천 API (API 명세 v0.3): #30 목록, #31 저장
import { adminRequest } from '../albums/request.js';

// GET /api/admin/recommendations
// 응답: { items: [{ album_id, title, artist, genre, stock, hidden, enabled, reason }], total, page, size }
export function fetchAdminRecommendations({ page = 1, size = 12 } = {}, signal) {
  return adminRequest(`/api/admin/recommendations?page=${page}&size=${size}`, { signal });
}

// PUT /api/admin/recommendations/{album_id}
// 응답: { album_id, enabled, reason }
export function saveAdminRecommendation(albumId, { enabled, reason }) {
  return adminRequest(`/api/admin/recommendations/${albumId}`, {
    method: 'PUT',
    body: { enabled, reason },
  });
}