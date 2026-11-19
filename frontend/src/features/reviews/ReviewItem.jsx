// 리뷰 하나 표시 + 인라인 수정 + 삭제 (앨범 상세·마이페이지 공통)
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
    return <article>
      <ReviewForm initial={{ rating: review.rating, content: review.content }}
        submitLabel="수정 완료" onSubmit={save} onCancel={() => setEditing(false)} />
    </article>
  }

  return <article>
    {showAlbum && <p><Link to={`/albums/${review.album_id}`}>{review.album_title}</Link></p>}
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
    {review.is_mine && <div>
      <button type="button" onClick={() => setEditing(true)}>수정</button>
      <button type="button" onClick={remove}>삭제</button>
    </div>}
    {error && <p role="alert">{error}</p>}
  </article>
}
