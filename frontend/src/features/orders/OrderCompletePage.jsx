import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthToken } from '../../lib/useAuthToken';
import { formatDate, formatPrice } from '../../lib/apiClient';
import AuthRequired from '../cart/AuthRequired';
import { Loading, Message, PageHeading } from '../cart/CommerceUI';
import { getOrder } from './api';

export default function OrderCompletePage() {
  const token = useAuthToken();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getOrder(token, orderId, controller.signal).then(setOrder)
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [token, orderId]);
  if (!token) return <AuthRequired title="주문 완료" />;
  return <main className="commerce-page">
    <PageHeading eyebrow="CHECKOUT / 03" title="주문 완료"/>
    <div className="commerce-progress" aria-label="주문 단계"><span>01 장바구니</span><i /><span>02 주문서</span><i /><span className="is-current">03 주문 완료</span></div>
    {error ? <Message>{error}</Message> : !order ? <Loading text="주문 완료 정보를 확인하고 있습니다..." /> : <div className="commerce-complete">
      <div className="commerce-check-icon">✓</div>
      <p className="commerce-eyebrow">YOUR ORDER IS CONFIRMED</p>
      <h2>주문이 접수되었습니다.</h2>
      <p className="commerce-complete-lead">감사합니다</p>
      <div className="commerce-confirmed-table">
        <div><span>주문 번호</span><strong>#{order.id}</strong></div>
        <div><span>접수 일시</span><strong>{formatDate(order.created_at)}</strong></div>
        <div><span>주문 상품</span><strong>{order.items.length}종 · {order.items.reduce((n, x) => n + x.quantity, 0)}개</strong></div>
        <div><span>총 주문 금액</span><strong className="accent">{formatPrice(order.total_amount)}</strong></div>
      </div>
      <p className="commerce-complete-note">주문 내역에서 접수 상태와 상세 정보를 확인할 수 있습니다.</p>
      <div className="commerce-complete-actions"><Link className="commerce-primary" to={`/orders/${order.id}`}>주문 상세 보기 ↗</Link><Link className="commerce-secondary" to="/orders">주문 내역으로</Link></div>
    </div>}
  </main>;
}
