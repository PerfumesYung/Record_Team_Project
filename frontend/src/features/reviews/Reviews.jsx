// 앨범 상세 페이지용: 그 음반의 리뷰 목록 + 작성 폼
import { useEffect, useState } from 'react'
import { createAlbumReview, getAlbumReviews } from '../../utils/api'
import ReviewForm from './ReviewForm'
import ReviewItem from './ReviewItem'

export default function Reviews({ albumId, isAuthenticated }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true); setError('')
    try {
      const result = await getAlbumReviews(albumId)
      setReviews(result.items ?? result)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [albumId, isAuthenticated])

  async function create(form) {
    await createAlbumReview(albumId, form)
    await refresh()
  }

  // 이미 이 음반에 리뷰를 쓴 사람에게는 작성 폼을 숨김 (중복 작성 409 방지)
  const hasMyReview = reviews.some((review) => review.is_mine)

  return <section aria-labelledby="reviews-heading">
    <h2 id="reviews-heading">리뷰</h2>
    {isAuthenticated && !loading && !hasMyReview && <ReviewForm onSubmit={create} />}
    {error && <p role="alert">{error}</p>}
    {loading ? <p>리뷰를 불러오는 중입니다.</p> : reviews.length === 0
    ? <p className="mt-6 text-sm text-[color:var(--color-text-muted)]"> 등록된 리뷰가 없습니다. </p>
      : (
        <div className="mt-8 space-y-6">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} onChanged={refresh} />
          ))}
        </div>
      )}
  </section>
}
