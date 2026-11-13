// 마이페이지용: 내가 쓴 리뷰 목록 (음반 이름 링크 포함)
import { useEffect, useState } from 'react'
import { getMyReviews } from '../../utils/api'
import ReviewItem from './ReviewItem'

export default function MyReviews({ isAuthenticated }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true); setError('')
    try { setReviews(await getMyReviews()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (isAuthenticated) refresh(); else setLoading(false) }, [isAuthenticated])

  if (!isAuthenticated) return <p>로그인 후 이용할 수 있습니다.</p>

  return <section aria-labelledby="my-reviews-heading">
    <h2 id="my-reviews-heading">내 리뷰</h2>
    {error && <p role="alert">{error}</p>}
    {loading ? <p>리뷰를 불러오는 중입니다.</p> : reviews.length === 0
      ? <p>작성한 리뷰가 없습니다.</p>
      : reviews.map((review) => <ReviewItem key={review.id} review={review} showAlbum onChanged={refresh} />)}
  </section>
}
