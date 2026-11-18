// 관리자 음반 API (API 명세 v0.3): #22 목록, #23 등록, #24 수정
import { adminRequest } from './request.js';

// GET /api/admin/albums
// 응답: { items: [{ id, title, artist, price, genre, format, image_url, stock, hidden }], total, page, size }
export function fetchAdminAlbums({ page = 1, size = 12 } = {}, signal) {
  return adminRequest(`/api/admin/albums?page=${page}&size=${size}`, { signal });
}

// POST /api/admin/albums (성공하면 만들어진 음반을 돌려줍니다)
export function createAdminAlbum(data) {
  return adminRequest('/api/admin/albums', { method: 'POST', body: data });
}

// PATCH /api/admin/albums/{id} (보낸 항목만 바뀝니다)
export function updateAdminAlbum(albumId, data) {
  return adminRequest(`/api/admin/albums/${albumId}`, { method: 'PATCH', body: data });
}

// 수정 화면용: 음반 1개를 조회하는 API는 확인된 것이 없어서, 목록을 넘겨 가며 해당 id를 찾습니다.
// (목록 화면에서 '수정'을 눌러 들어오면 이미 받은 값을 쓰므로 이 함수는 주소로 바로 들어올 때만 쓰입니다.)
export async function findAdminAlbum(albumId, signal) {
  const size = 50; // 서버가 허용하는 최대값
  for (let page = 1; page <= 40; page += 1) {
    const result = await fetchAdminAlbums({ page, size }, signal);
    const found = result.items.find((item) => item.id === albumId);
    if (found) return found;
    if (page * size >= result.total) break;
  }
  return null;
}