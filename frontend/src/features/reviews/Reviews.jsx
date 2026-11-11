import { useEffect, useState } from 'react'
import { createAlbumReview, deleteReview, getAlbumReviews, updateReview } from '../../utils/api'
import StarRating from '../../components/ui/icons/StarRating'

const emptyForm = {rating: 5, content: ''}

export default function Reviews({ albumId, isAuthenticated }) {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const result = await getAlbumReviews(albumId)
      setReviews(result.items ?? result)
    } catch (e) {setError(e.message)}
    finally {setLoading(false)}
  }

  useEffect(() => {refresh()}, [albumId, isAuthenticated])

  function edit(review) {
    setEditingId(review.id)
    setForm({ rating: review.rating, content: review.content })
  }

  async function submit(event) {
    event.preventDefault()
    if (!isAuthenticated) {setError('로그인 후 이용할 수 있습니다.'); return}
    if (!form.content.trim()) { setError('리뷰 내용을 입력해 주세요.'); return }

    setSubmitting(true); setError('')
    try {
      if (editingId) await updateReview(editingId, form)
      else await createAlbumReview(albumId, form)
      setEditingId(null); setForm(emptyForm); await refresh()
    } catch (e) {setError(e.message)}
    finally {setSubmitting(false)}
  }

  async function remove(reviewId) {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await deleteReview(reviewId)
      if (reviewId === editingId) { setEditingId(null); setForm(emptyForm) }
      await refresh()
    }
    catch (e) {setError(e.message)}
  }

  return <section aria-labelledby="reviews-heading">
    <h2 id="reviews-heading">리뷰</h2>
    {isAuthenticated && <form onSubmit={submit}>
      <StarRating value={form.rating} onChange={(rating) => setForm({...form, rating})} />
      <label>내용
        <textarea required minLength={1} maxLength={1000} value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>

      <button disabled={submitting} type="submit">{editingId ? '수정' : '저장'}</button>
      {editingId && <button type="button" onClick={() => {setEditingId(null); setForm(emptyForm);}}>취소</button>}
    </form>}

    {error && <p role="alert">{error}</p>}
    {loading ? <p>리뷰를 불러오는 중입니다.</p> : reviews.length === 0
      ? <p>등록된 리뷰가 없습니다.</p>
      : reviews.map((review) => <article key={review.id}>
        <p>{review.rating}점 - 작성자 {review.username}</p>
        <p>{review.content}</p>
        <small>작성 {new Date(review.created_at).toLocaleString()}</small>
        {review.is_mine && <div><button onClick={() => edit(review)}>수정</button>
          <button onClick={() => remove(review.id)}>삭제</button></div>}
      </article>)} 
  </section>;
}
