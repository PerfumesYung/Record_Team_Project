import { apiRequest } from '../../lib/apiClient';

export function getCart(token, signal) {
  return apiRequest('/api/cart/items', { token, signal });
}
export function addCartItem(token, albumId, quantity = 1) {
  return apiRequest('/api/cart/items', { method: 'POST', token, body: { album_id: albumId, quantity } });
}
export function updateCartItem(token, cartItemId, quantity) {
  return apiRequest(`/api/cart/items/${cartItemId}`, { method: 'PATCH', token, body: { quantity } });
}
export function deleteCartItem(token, cartItemId) {
  return apiRequest(`/api/cart/items/${cartItemId}`, { method: 'DELETE', token });
}
