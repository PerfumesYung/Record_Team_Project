// 취향 추천 화면 (프론트: features/recommendations), 화면 주소: /recommendations
// - 좋아하는 아티스트와 장르를 고르면 GET /api/recommendations 로 추천 음반을 받아 보여줍니다.
// - 취향 저장 API는 없어서, 고른 값은 이 화면 안에서만 사용합니다. (새로고침하면 초기화)
// - 공통 헤더·푸터는 팀의 레이아웃이 담당하므로 여기서는 본문만 만듭니다.
import { useEffect, useState } from 'react';
import { fetchRecommendations } from './api.js';
import RecommendationCard from './RecommendationCard.jsx';

// 한 번에 보여줄 추천 개수. 디자인은 3장이며, API는 1~20까지 받을 수 있습니다.
const RESULT_LIMIT = 3;

// API 명세의 장르 선택지 (추가할 때는 서버 기준과 함께 바꿔야 합니다)
const GENRES = ['Jazz', 'Pop', 'Rock', 'Indie', 'R&B', 'Classical'];

const EMPTY_PREFERENCE = { artist: '', genre: '' };

const INPUT_CLASS =
  'mt-2 w-full border border-[color:var(--color-border)] bg-[var(--color-background)] px-4 py-4 text-sm ' +
  'text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]';

export default function RecommendationsPage() {
  const [form, setForm] = useState(EMPTY_PREFERENCE); // 입력창에 적고 있는 값
  const [submitted, setSubmitted] = useState(EMPTY_PREFERENCE); // '추천 보기'를 눌러 확정된 값
  const [outcome, setOutcome] = useState(null); // 서버 응답: { for: 확정된 값, data 또는 error }

  // 확정된 값이 바뀔 때마다 추천을 새로 받아옵니다. 이전 요청은 취소해서 응답이 뒤섞이지 않게 합니다.
  useEffect(() => {
    const controller = new AbortController();
    fetchRecommendations({ ...submitted, limit: RESULT_LIMIT }, controller.signal)
      .then((data) => setOutcome({ for: submitted, data }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setOutcome({ for: submitted, error: error.message });
      });
    return () => controller.abort();
  }, [submitted]);

  // 새 조건으로 받아오는 동안에는 직전 결과를 흐리게 남겨 두어, 화면이 깜빡이지 않게 합니다.
  const isLoading = outcome === null || outcome.for !== submitted;
  const data = outcome?.data ?? null;
  const errorMessage = outcome?.error ?? null;
  const statusText = isLoading ? '추천 음반을 고르는 중이에요...' : (errorMessage ?? data?.message);

  function handleSubmit(event) {
    event.preventDefault();
    // 새 객체를 만들어야 같은 조건으로 다시 눌러도 새로 조회합니다.
    setSubmitted({ artist: form.artist.trim(), genre: form.genre });
  }

  function handleReset() {
    setForm(EMPTY_PREFERENCE);
    setSubmitted({ ...EMPTY_PREFERENCE });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 text-[color:var(--color-text)]">
      <header className="border-b border-[color:var(--color-border)] pb-8">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-text-muted)]">
          NAKWON RECORDS / OUR COLLECTION
        </p>
        <h1 className="font-heading mt-4 text-4xl font-bold md:text-6xl">
          A little closer to your taste.
        </h1>
        <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
          좋아하는 음악에서 아직 만나지 못한 한 장으로.
        </p>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
        {/* 취향 입력 */}
        <form onSubmit={handleSubmit} className="self-start bg-[var(--color-surface)] p-8">
          <p className="text-xs tracking-[0.2em] text-[color:var(--color-text-muted)]">
            PERSONAL SELECTION / 01
          </p>
          <h2 className="font-heading mt-4 text-4xl font-bold leading-tight">
            Tell us
            <br />
            your sound.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[color:var(--color-text-muted)]">
            좋아하는 아티스트 또는 장르를 선택하면 관련 음반을 골라 보여드려요.
          </p>

          <label className="mt-8 block text-xs font-semibold" htmlFor="preferred-artist">
            선호 아티스트
            <input
              id="preferred-artist"
              type="text"
              maxLength={100}
              value={form.artist}
              onChange={(event) => setForm({ ...form, artist: event.target.value })}
              placeholder="예: June Park"
              className={`${INPUT_CLASS} font-normal`}
            />
          </label>

          <label className="mt-6 block text-xs font-semibold" htmlFor="preferred-genre">
            선호 장르
            <select
              id="preferred-genre"
              value={form.genre}
              onChange={(event) => setForm({ ...form, genre: event.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">전체 장르</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-8 w-full bg-[var(--color-accent)] px-5 py-4 text-sm font-bold text-[color:var(--color-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)]"
          >
            추천 보기 →
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 text-xs font-semibold underline-offset-4 hover:underline"
          >
            취향 초기화 ↺
          </button>

          <p className="mt-6 border-t border-[color:var(--color-border)] pt-6 text-sm leading-6 text-[color:var(--color-text-muted)]">
            규칙 기반 체험입니다.
            <br />
            외부 음악 서비스는 연결하지 않았습니다.
          </p>
        </form>

        {/* 추천 결과 */}
        <section aria-labelledby="recommendation-result" aria-busy={isLoading}>
          <h2
            id="recommendation-result"
            className="text-xs tracking-[0.1em] text-[color:var(--color-text-muted)]"
          >
            SELECTED RECORDS / {data ? data.items.length : '-'}
          </h2>

          {/* 안내 문구는 스크린 리더에도 알려지도록 role="status" 를 씁니다. */}
          <p
            role="status"
            className={`mt-6 text-sm ${
              !isLoading && data?.is_fallback
                ? 'text-[color:var(--color-accent)]'
                : 'text-[color:var(--color-text-muted)]'
            }`}
          >
            {statusText}
          </p>

          {data && data.items.length > 0 && (
            <ul
              className={`mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isLoading ? 'opacity-50' : ''}`}
            >
              {data.items.map((album) => (
                <RecommendationCard key={album.album_id} album={album} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
