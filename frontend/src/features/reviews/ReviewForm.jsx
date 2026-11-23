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

    return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {/* 별점 선택 */}
      <StarRating
        value={form.rating}
        onChange={(rating) => setForm({ ...form, rating })}
      />

      {/* 리뷰 내용 입력 */}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">
          리뷰 내용
        </span>

        <textarea
          required
          minLength={1}
          maxLength={1000}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="음반에 대한 감상을 작성해 주세요."
          className="h-36 w-full resize-none rounded-md border border-[#3A3D45] bg-[#0D0E10] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-[#8A8A93] focus:border-[#FF4E00] focus:outline-none"
        />
      </label>

      {/* 저장과 취소 버튼 */}
      <div className="flex flex-wrap gap-3">
        <button
          disabled={submitting}
          type="submit"
          className="rounded-md bg-[#FF4E00] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? '저장 중...' : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#3A3D45] px-5 py-3 text-sm text-white"
          >
            취소
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#FF4E00]">
          {error}
        </p>
      )}
    </form>
  )
}
