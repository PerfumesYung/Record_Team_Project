import { useEffect, useState } from 'react';
import { getAccessToken } from '../auth/api';

import './AdminOrdersPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
export default function AdminReviewsPage() {
const [reviews, setReviews] = useState([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(true);
const [savingId, setSavingId] = useState(null);
const [error, setError] = useState('');

const size = 12;

    useEffect(() => {
        let active = true;

        async function loadReviews() {
        setLoading(true);
        setError('');

        try {
            const token = getAccessToken();

            if (!token) {
            throw new Error('관리자 로그인 후 이용해 주세요.');
            }

            const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            });

            const response = await fetch(
            `${API_BASE}/api/admin/reviews?${params.toString()}`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            },
            );

            if (response.status === 401) {
            throw new Error('로그인이 만료됐어요. 다시 로그인해 주세요.');
            }

            if (response.status === 403) {
            throw new Error('관리자만 리뷰를 관리할 수 있어요.');
            }

            if (!response.ok) {
            throw new Error('리뷰 목록을 불러오지 못했어요.');
            }

            const data = await response.json();

            if (active) {
            setReviews(data.items);
            setTotal(data.total);
            }
        } catch (err) {
            if (active) setError(err.message);
        } finally {
            if (active) setLoading(false);
        }
        }

        loadReviews();

        // 화면을 벗어났을 때 오래된 요청이 상태를 바꾸지 않도록 합니다.
        return () => {
        active = false;
        };
    }, [page]);

    async function changeVisibility(review) {
        const token = getAccessToken();

        if (!token) {
        setError('관리자 로그인 후 이용해 주세요.');
        return;
        }

        // 현재 공개 상태라면 숨김으로, 숨김이라면 공개로 변경합니다.
        const nextHidden = !Boolean(review.hidden);

        setSavingId(review.id);
        setError('');

        try {
        const response = await fetch(
            `${API_BASE}/api/admin/reviews/${review.id}/visibility`,
            {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hidden: nextHidden }),
            },
        );

        if (response.status === 401) {
            throw new Error('로그인이 만료됐어요. 다시 로그인해 주세요.');
        }

        if (response.status === 403) {
            throw new Error('관리자만 리뷰 상태를 변경할 수 있어요.');
        }

        if (!response.ok) {
            throw new Error('리뷰 상태를 변경하지 못했어요.');
        }

        const updated = await response.json();

        // 변경한 리뷰만 화면에서 새 상태로 바꿉니다.
        setReviews((current) =>
            current.map((item) =>
            item.id === updated.id
                ? { ...item, hidden: updated.hidden }
                : item
            )
        );
        } catch (err) {
        setError(err.message);
        } finally {
        setSavingId(null);
        }
    }

const totalPages = Math.max(1, Math.ceil(total / size));

return (
        <section className="admin-orders">
        <div className="admin-orders__heading">
            <p className="admin-orders__label">REVIEW MANAGEMENT</p>
            <h2>리뷰 관리</h2>
            <p>작성된 리뷰를 확인하고 공개 상태를 변경합니다.</p>
        </div>

        <div className="admin-orders__notice">
            총 {total}건
        </div>

        {loading && <p>리뷰를 불러오고 있어요.</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
            <p>등록된 리뷰가 없어요.</p>
        )}

        {!loading && reviews.length > 0 && (
            <div className="admin-orders__table-wrap">
            <table className="admin-orders__table">
                <thead>
                <tr>
                    <th>번호</th>
                    <th>음반</th>
                    <th>작성자</th>
                    <th>별점</th>
                    <th>내용</th>
                    <th>공개 상태</th>
                    <th>관리</th>
                </tr>
                </thead>

                <tbody>
                {reviews.map((review) => (
                    <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.album_title}</td>
                    <td>{review.username}</td>
                    <td>{review.rating}점</td>
                    <td>{review.content}</td>
                    <td>{review.hidden ? '숨김' : '공개'}</td>
                    <td>
                        <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => changeVisibility(review)}
                        >
                        {savingId === review.id
                            ? '변경 중...'
                            : review.hidden
                            ? '다시 공개'
                            : '숨기기'}
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        <div className="admin-orders__pagination">
            <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
            >
            이전
            </button>

            <span>{page} / {totalPages}</span>

            <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(page + 1)}
            >
            다음
            </button>
        </div>
        </section>
    );
    }