import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAccessToken } from '../auth/api';
import './AdminOrdersPage.css';

    // 백엔드 서버 주소
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    // 서버의 주문 상태를 화면에 표시할 글자로 바꾸기
function getStatusText(status) {
    if (status === 'RECEIVED') {
        return '접수';
}

    if (status === 'PROCESSING') {
        return '처리 중';
    }

    if (status === 'COMPLETED') {
        return '완료';
    }

    return '상태 확인 필요';
    }

    // 주문 날짜를 읽기 쉬운 형태로 바꾸기
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

export default function AdminOrderDetailPage() {
    // 주소에서 주문 번호를 가져오기.
    const { orderId } = useParams();

    // 서버에서 받아온 주문 상세 정보
    const [order, setOrder] = useState(null);

    // 로딩 상태와 오류 메시지
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadOrderDetail() {
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            // 로그인할 때 저장한 토큰을 가져옵니다.
            const token = getAccessToken();

            if (!token) {
                throw new Error('로그인한 관리자만 주문을 확인할 수 있어요.');
            }

            // 주문 번호로 상세 정보를 요청합니다.
            const response = await fetch(
                `${API_BASE}/api/admin/orders/${orderId}`,
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
                throw new Error('관리자만 주문을 확인할 수 있어요.');
            }

            if (response.status === 404) {
                throw new Error('주문을 찾을 수 없어요.');
            }

            if (!response.ok) {
                throw new Error('주문 상세 정보를 불러오지 못했어요.');
            }

            const data = await response.json();

            if (active) {
                setOrder(data);
            }
        } catch (err) {
            if (active) {
                setError(
                    err.message || '주문 상세 정보를 불러오는 중 오류가 발생했어요.',
                );
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

        loadOrderDetail();

        return () => {
            active = false;
        };
    }, [orderId]);

    return (
        <section className="admin-orders">
        <div className="admin-orders__heading">
            <p className="admin-orders__label">ORDER DETAIL</p>
            <h2>주문 상세</h2>
            <p>선택한 주문의 정보와 음반 목록을 확인합니다.</p>
        </div>

        <Link className="admin-order-detail__back" to="/admin/orders">
            ← 주문 목록으로
        </Link>

        {loading && <p>주문 정보를 불러오고 있어요.</p>}

        {!loading && error && <p role="alert">{error}</p>}

        {!loading && !error && order && (
            <>
            <div className="admin-order-detail__summary">
                <p>
                <strong>주문 번호</strong> #{order.id}
                </p>

                <p>
                <strong>주문자 번호</strong> {order.user_id}
                </p>

                <p>
                <strong>주문일</strong> {formatDate(order.created_at)}
                </p>

                <p>
                <strong>주문 상태</strong> {getStatusText(order.status)}
                </p>

                <p>
                <strong>총 주문 금액</strong>{' '}
                {Number(order.total_amount).toLocaleString()}원
                </p>
            </div>

            <h3>주문한 음반</h3>

            {order.items.length === 0 ? (
                <p>주문한 음반 정보가 없어요.</p>
            ) : (
                <div className="admin-orders__table-wrap">
                <table className="admin-orders__table">
                    <thead>
                    <tr>
                        <th scope="col">음반명</th>
                        <th scope="col">주문 당시 가격</th>
                        <th scope="col">수량</th>
                        <th scope="col">합계</th>
                    </tr>
                    </thead>

                    <tbody>
                    {order.items.map((item, index) => (
                        <tr key={`${item.album_id}-${index}`}>
                        <td>{item.title}</td>
                        <td>
                            {Number(item.unit_price).toLocaleString()}원
                        </td>
                        <td>{item.quantity}개</td>
                        <td>
                            {(
                            Number(item.unit_price) * item.quantity
                            ).toLocaleString()}원
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </>
        )}
        </section>
    );
    }