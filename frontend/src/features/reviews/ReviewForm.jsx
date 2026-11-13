// 리뷰 작성 & 수정에 함께 쓰는 입력 폼
import { useState } from 'react'
import StarRating from '../../components/ui/icons/StarRating'

const emptyForm = { rating: 5, content: '' }

export default function ReviewForm({ initial = emptyForm, submitLabel = '저장', onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.content.trim()) { setError('리뷰 내용을 입력해 주세요.'); return }
    setSubmitting(true); setError('')
    try {
      await onSubmit(form)
      setForm(initial)
    } catch (e) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  return <form onSubmit={handleSubmit}>
    <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
    <label>내용
      <textarea required minLength={1} maxLength={1000} value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })} />
    </label>
    <button disabled={submitting} type="submit">{submitLabel}</button>
    {onCancel && <button type="button" onClick={onCancel}>취소</button>}
    {error && <p role="alert">{error}</p>}
  </form>
}
