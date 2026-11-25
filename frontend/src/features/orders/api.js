import { apiRequest } from '../../lib/apiClient';

export function createOrder(token, items, clearCart = true) {
  return apiRequest('/api/orders', {
    method: 'POST',
    token,
    body: {
      items,
      clear_cart: clearCart,
    },
  });
}
export function getOrders(token, page = 1, signal) {
  return apiRequest(`/api/orders?page=${page}&size=12`, { token, signal });
}
export function getOrder(token, orderId, signal) {
  return apiRequest(`/api/orders/${orderId}`, { token, signal });
}

export function deleteOrder(token, orderId) {
  return apiRequest(`/api/orders/${orderId}`, { method: 'DELETE', token });
}
