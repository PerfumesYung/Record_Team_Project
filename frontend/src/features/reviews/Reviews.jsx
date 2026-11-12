import { useEffect, useState } from 'react'
import { createAlbumReview, deleteReview, getAlbumReviews, updateReview } from '../../utils/api'
import StarRating from '../../components/ui/icons/StarRating'

const emptyForm = {rating: 5, content: ''}

export default function Reviews({ albumId, isAuthenticated }) {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)
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
    setEditForm({ rating: review.rating, content: review.content })
  }

  async function saveEdit(event) {
    event.preventDefault()
    if (!editForm.content.trim()) { setError('리뷰 내용을 입력해 주세요.'); return }
    setSubmitting(true); setError('')
    try {
      await updateReview(editingId, editForm)
      setEditingId(null); await refresh()
    } catch (e) {setError(e.message)}
    finally {setSubmitting(false)}
  }

  function cancelEdit() { setEditingId(null); setError('') }

  async function submit(event) {
    event.preventDefault()
    if (!isAuthenticated) {setError('로그인 후 이용할 수 있습니다.'); return}
    if (!form.content.trim()) { setError('리뷰 내용을 입력해 주세요.'); return }

    setSubmitting(true); setError('')
    try {
      await createAlbumReview(albumId, form)
      setForm(emptyForm); await refresh()
    } catch (e) {setError(e.message)}
  }

  async function remove(reviewId) {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await deleteReview(reviewId)
      if (reviewId === editingId) setEditingId(null)
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

      <button disabled={submitting} type="submit">저장</button>
      {editingId && <button type="button" onClick={() => {setEditingId(null); setForm(emptyForm);}}>취소</button>}
    </form>}

    {error && <p role="alert">{error}</p>}
    {loading ? <p>리뷰를 불러오는 중입니다.</p> : reviews.length === 0
      ? <p>등록된 리뷰가 없습니다.</p>
      : reviews.map((review) => <article key={review.id}>
        {editingId === review.id ? (
          <form onSubmit={saveEdit}>
            <StarRating value={editForm.rating} onChange={(rating) => setEditForm({ ...editForm, rating })} />
            <label>내용
              <textarea required minLength={1} maxLength={1000} value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
            </label>
            <button disabled={submitting} type="submit">수정 완료</button>
            <button type="button" onClick={cancelEdit}>취소</button>
          </form>
        ) : (
          <>
          <p>
              <span role="img" aria-label={`${review.rating}점`}>
              {[1, 2, 3, 4, 5].map((score) => (
                <span key={score} aria-hidden="true"
                  className={score <= review.rating ? 'star-rating__star is-selected' : 'star-rating__star'}>★</span>
              ))}
            </span>
            {' '}- 작성자 {review.username}
          </p>
          <p>{review.content}</p>
          <small>작성 {new Date(review.created_at).toLocaleString()}</small>
          {review.is_mine && <div><button onClick={() => edit(review)}>수정</button>
            <button onClick={() => remove(review.id)}>삭제</button></div>}
          </>
        )}
      </article>)}
  </section>;
}
