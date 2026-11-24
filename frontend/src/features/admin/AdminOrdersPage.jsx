import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../auth/api';

import './AdminOrdersPage.css';

    // 프론트에서 백엔드로 요청할 주소
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

    // 백엔드에 저장된 주문 상태 프론트에 보이는 단어로 변경
function getStatusText(status) {
    if (status === 'RECEIVED') {
        return '접수 완료';
    }

    if (status === 'PROCESSING') {
        return '주문 처리 중';
    }

    if (status === 'COMPLETED') {
        return '처리 완료';
    }

    return '상태 확인 필요';
    }

    // 주문 시간 -> 화면에서 보이기 쉽게 변경
function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ko-KR');
    }

export default function AdminOrdersPage() {
        
    // 서버에서 받아온 주문 목록
    const [orders, setOrders] = useState([]);

    // 전체 주문 개수
    const [total, setTotal] = useState(0);

    // 사용자가 선택한 주문 상태
    const [status, setStatus] = useState('');

    // 현재 보고 있는 페이지
    const [page, setPage] = useState(1);

    // 한번에 표시할 주문목록 개수
    const size = 12;

    // 데이터를 불러오는 중인지 로딩화면
    const [loading, setLoading] = useState(true);

    // 문제가 생겼을 때 화면에 보여줄 메시지
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadOrders() {
        setLoading(true);
        setError('');

        try {
            // 로그인할 때 저장한 토큰을 가져오기
            const token = getAccessToken();

            if (!token) {
            throw new Error('로그인한 관리자만 주문을 확인할 수 있어요.');
            }

            // 페이지와 한 페이지당 개수를 쿼리 만들기
            const params = new URLSearchParams({
                page: String(page),
                size: String(size),
            });

            // 상태가 선택된 경우에만 status 선택 가능
            if (status) {
                params.set('status', status);
            }

            const response = await fetch(
                `${API_BASE}/api/admin/orders?${params.toString()}`,
                {
                headers: {
                Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.status === 401) {
                throw new Error('로그인이 만료되었어요. 다시 로그인해 주세요.');
            }

            if (response.status === 403) {
                throw new Error('관리자만 주문 목록을 확인할 수 있어요.');
            }

            if (!response.ok) {
                throw new Error('주문 목록을 불러오지 못했어요.');
            }

            const data = await response.json();

            // 이전 요청이 늦게 끝나더라도 현재 화면을 덮어쓰지 않게 합니다.
            if (active) {
                setOrders(data.items);
                setTotal(data.total);
            }
        } catch (err) {
            if (active) {
                setOrders([]);
                setTotal(0);
                setError(err.message || '주문 목록을 불러오는 중 오류가 발생했어요.');
            }
        } finally {
                if (active) {
                setLoading(false);
                }
            }
        }

        loadOrders();

        return () => {
            active = false;
        };
    }, [status, page]);

    // 상태 변경 시 첫화면으로 이동
    function handleStatusChange(event) {
        setStatus(event.target.value);
        setPage(1);
    }

    // 전체 주문 수 기준으로 계산
    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
        <section className="admin-orders">
        <div className="admin-orders__heading">
            <div>
            <p className="admin-orders__label">ORDER MANAGEMENT</p>
            <h2>주문 관리</h2>
            <p>접수된 주문과 진행 상태를 확인합니다.</p>
            </div>
        </div>

        <div className="admin-orders__notice">
            <label htmlFor="order-status">주문 상태 </label>

            <select
            id="order-status"
            value={status}
            onChange={handleStatusChange}
            >
            <option value="">전체</option>
            <option value="RECEIVED">접수 완료</option>
            <option value="PROCESSING">주문 처리 중</option>
            <option value="COMPLETED">처리 완료</option>
            </select>

            <p>총 {total}건</p>
        </div>

        {loading && <p>주문 목록을 불러오고 있어요.</p>}

        {!loading && error && <p role="alert">{error}</p>}

        {!loading && !error && orders.length === 0 && (<p>조회된 주문이 없어요.</p> )}

        {!loading && !error && orders.length > 0 && (
            <>
            <div className="admin-orders__table-wrap">
                <table className="admin-orders__table">
                <thead>
                    <tr>
                    <th scope="col">주문 번호</th>
                    <th scope="col">주문자 번호</th>
                    <th scope="col">주문일</th>
                    <th scope="col">주문 금액</th>
                    <th scope="col">주문 상태</th>
                    <th scope="col">상세</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                    <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user_id}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{Number(order.total_amount).toLocaleString()}원</td>
                        <td>{getStatusText(order.status)}</td>
                        <td>
                        <Link className="admin-order-detail__link" to={`/admin/orders/${order.id}`}> 상세 보기 </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <div className="admin-orders__pagination">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}> 이전 </button>

                <span> {page} / {totalPages} </span>

                <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} > 다음 </button>
            </div>
            </>
        )}
        </section>
    );
}
