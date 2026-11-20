// 관리자 추천 관리 (주소: /admin/recommendations) - API #30, #31
// 음반마다 "추천 목록에 사용" 여부와 추천 이유를 정해 저장합니다.
import { useEffect, useState } from 'react';
import { fetchAdminRecommendations, saveAdminRecommendation } from './api.js';

const PAGE_SIZE = 12;
const REASON_MAX = 160; // 서버 기준 추천 이유 최대 글자 수

// 음반 한 장의 설정 카드. 저장 상태는 카드마다 따로 관리합니다.
function RecommendationRow({ item }) {
  const [enabled, setEnabled] = useState(item.enabled);
  const [reason, setReason] = useState(item.reason);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  async function save() {
    if (saving) return;
    const trimmed = reason.trim();
    // 서버 규칙: 노출을 켜면 추천 이유 1~160자 필수
    if (enabled && (trimmed.length < 1 || trimmed.length > REASON_MAX)) {
      setMessage({ type: 'error', text: `추천 이유를 1~${REASON_MAX}자로 입력해 주세요.` });
      return;
    }
    if (trimmed.length > REASON_MAX) {
      setMessage({ type: 'error', text: `추천 이유는 ${REASON_MAX}자 이하로 입력해 주세요.` });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const saved = await saveAdminRecommendation(item.album_id, { enabled, reason: trimmed });
      setEnabled(saved.enabled);
      setReason(saved.reason);
      setMessage({ type: 'ok', text: '저장했어요.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="bg-[var(--color-surface)] p-8">
      <h3 className="font-heading text-xl font-bold">
        {item.title}
        {item.hidden && (
          <span className="ml-3 border border-[color:var(--color-border)] px-2 py-1 align-middle text-xs font-normal text-[color:var(--color-text-muted)]">
            비공개
          </span>
        )}
      </h3>
      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
        {item.artist} · {item.genre}
      </p>
      <label className="mt-4 flex items-center gap-2 text-xs font-bold">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        추천 목록에 사용
      </label>
      <label className="mt-4 block text-xs font-bold">
        추천 이유
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={REASON_MAX + 40}
          className="mt-2 w-full border border-[color:var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)]"
        />
      </label>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="border border-[color:var(--color-border)] px-5 py-3 text-sm hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
        >
          {saving ? '저장 중…' : '설정 저장'}
        </button>
        {message.text && (
          <span
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`text-sm ${message.type === 'error' ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-muted)]'}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </li>
  );
}

export default function AdminRecommendationsPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminRecommendations({ page, size: PAGE_SIZE }, controller.signal)
      .then((data) => setState({ status: 'done', data, error: '' }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', data: null, error: error.message });
      });
    return () => controller.abort();
  }, [page]);

  const items = state.data?.items ?? [];
  const lastPage = Math.max(1, Math.ceil((state.data?.total ?? 0) / PAGE_SIZE));

  return (
    <section className="text-[color:var(--color-text)]">
      <h2 className="font-heading text-3xl font-bold">추천 노출 관리</h2>
      <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
        추천에 사용할 음반과 이유를 정하세요. 사용자 추천 화면에도 반영됩니다.
      </p>

      {state.status === 'loading' && (
        <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">불러오는 중이에요…</p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="mt-6 border border-[color:var(--color-border)] p-4 text-sm">
          {state.error}
        </p>
      )}
      {state.status === 'done' && (
        <>
          {items.length === 0 && (
            <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">등록된 음반이 없어요.</p>
          )}
          {/* key에 페이지를 넣어, 페이지를 넘기면 카드 입력값이 새로 시작되게 합니다. */}
          <ul className="mt-6 grid max-w-3xl gap-6" key={page}>
            {items.map((item) => (
              <RecommendationRow key={item.album_id} item={item} />
            ))}
          </ul>
          {lastPage > 1 && (
            <div className="mt-6 flex items-center gap-4 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="border border-[color:var(--color-border)] px-4 py-2 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[color:var(--color-text-muted)]">
                {page} / {lastPage}
              </span>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
                className="border border-[color:var(--color-border)] px-4 py-2 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}