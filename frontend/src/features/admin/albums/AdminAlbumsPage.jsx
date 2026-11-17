// 관리자 음반 목록 (주소: /admin/albums) - API #22
// 공통 관리자 틀(AdminLayout) 안에 들어가는 본문만 만듭니다.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminAlbums } from './api.js';

const PAGE_SIZE = 12;

const won = (value) => `${Number(value).toLocaleString('ko-KR')}원`;

export default function AdminAlbumsPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminAlbums({ page, size: PAGE_SIZE }, controller.signal)
      .then((data) => setState({ status: 'done', data, error: '' }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', data: null, error: error.message });
      });
    return () => controller.abort();
  }, [page]);

  const items = state.data?.items ?? [];
  const total = state.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="text-[color:var(--color-text)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-heading text-3xl font-bold">음반 관리</h2>
        <Link
          to="/admin/albums/new"
          className="bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-[color:var(--color-background)]"
        >
          새 음반 등록
        </Link>
      </div>
      <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
        수정 내용은 사용자 화면에도 바로 반영됩니다.
      </p>

      {state.status === 'error' && (
        <p role="alert" className="mt-6 border border-[color:var(--color-border)] p-4 text-sm">
          {state.error}
        </p>
      )}
      {state.status === 'loading' && (
        <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">불러오는 중이에요…</p>
      )}

      {state.status === 'done' && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="px-3 py-4 font-bold">음반</th>
                  <th className="px-3 py-4 font-bold">가격·재고</th>
                  <th className="px-3 py-4 font-bold">공개 상태</th>
                  <th className="px-3 py-4 font-bold">작업</th>
                </tr>
              </thead>
              <tbody>
                {items.map((album) => (
                  <tr key={album.id} className="border-b border-[color:var(--color-border)]">
                    <td className="px-3 py-4">
                      <p>{album.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        {album.artist} · {album.format}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <p>{won(album.price)}</p>
                      <p className="mt-1">{album.stock}개</p>
                    </td>
                    <td className="px-3 py-4">{album.hidden ? '비공개' : '공개'}</td>
                    <td className="px-3 py-4">
                      <Link
                        to={`/admin/albums/${album.id}/edit`}
                        state={{ album }}
                        className="inline-block border border-[color:var(--color-border)] px-4 py-3 text-sm hover:bg-[var(--color-surface-hover)]"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">등록된 음반이 없어요.</p>
          )}

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

      <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">
        주문 기록과 연결된 상품은 삭제 정책을 합의해야 합니다. 시안은 삭제 대신 비공개로 처리합니다.
      </p>
    </section>
  );
}