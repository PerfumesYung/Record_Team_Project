const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? '요청을 처리하지 못했습니다.')
  }

  return response.status === 204 ? null : response.json()
}

export const getAlbumReviews = (albumId) => request(`/api/albums/${albumId}/reviews`)

export const createAlbumReview = (albumId, data) => request(`/api/albums/${albumId}/reviews`, {
  method: 'POST',
  body: JSON.stringify(data),
})

export const updateReview = (reviewId, data) => request(`/api/reviews/${reviewId}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
})

export const deleteReview = (reviewId) => request(`/api/reviews/${reviewId}`, {method: 'DELETE'});
