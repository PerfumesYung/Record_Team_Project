import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteReview, updateReview } from '../../utils/api'
import ReviewForm from './ReviewForm'

export default function ReviewItem({ review, showAlbum = false, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  async function save(form) {
    await updateReview(review.id, form)
    setEditing(false)
    await onChanged()
  }

  async function remove() {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return
    try { await deleteReview(review.id); await onChanged() }
    catch (e) { setError(e.message) }
  }

  if (editing) {
    return <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <ReviewForm initial={{ rating: review.rating, content: review.content }}
        submitLabel="수정 완료" onSubmit={save} onCancel={() => setEditing(false)} />
    </article>
  }

  return <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
    {showAlbum && <p className="mb-2 text-sm font-semibold"><Link to={`/albums/${review.album_id}`} className="hover:text-(--color-accent)">{review.album_title}</Link></p>}
    <div className="flex items-center gap-3">
      <span role="img" aria-label={`${review.rating}점`} className="star-rating--display">
        {[1, 2, 3, 4, 5].map((score) => (
          <span key={score} aria-hidden="true"
            className={score <= review.rating ? 'star-rating__star is-selected' : 'star-rating__star'}>★</span>
        ))}
      </span>
      <span className="text-sm text-(--color-text-muted)">{review.username}</span>
    </div>
    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{review.content}</p>
    <small className="mt-3 block text-xs text-(--color-text-muted)">작성 {new Date(review.created_at).toLocaleString()}</small>
    {review.is_mine && <div className="mt-4 flex gap-2">
      <button type="button" onClick={() => setEditing(true)}
        className="rounded-md border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text) transition hover:bg-(--color-surface-hover)">수정</button>
      <button type="button" onClick={remove}
        className="rounded-md px-3 py-1.5 text-xs text-(--color-text-muted) transition hover:text-(--color-accent)">삭제</button>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-(--color-accent)">{error}</p>}
  </article>
}
