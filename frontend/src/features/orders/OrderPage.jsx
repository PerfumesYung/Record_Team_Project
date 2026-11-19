import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDate, formatPrice } from '../../lib/apiClient';
import { useAuthToken } from '../../lib/useAuthToken';
import AuthRequired from '../cart/AuthRequired';
import { EmptyState, Loading, Message, PageHeading, SectionCaption, Status } from '../cart/CommerceUI';
import { getOrders } from './api';

export default function OrdersPage() {
  const token = useAuthToken();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getOrders(token, page, controller.signal)
      .then((result) => { if (!controller.signal.aborted) { setData(result); setError(''); } })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, page, retry]);

  if (!token) return <AuthRequired title="내 주문 내역" />;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;
  return <main className="commerce-page">
    <PageHeading eyebrow="MY ACCOUNT / ORDER HISTORY" title="내 주문 내역" description="주문한 LP와 CD의 접수 일시, 금액, 진행 상태를 확인해 보세요."
      extra={<div className="commerce-heading-count"><strong>{data?.total || 0}</strong><span>TOTAL ORDERS</span></div>}/>
    {params.get('deleted') === '1' && <Message type="success">주문이 취소되었습니다.</Message>}
    {error && <Message onRetry={() => { setLoading(true); setRetry((n) => n + 1); }}>{error}</Message>}
    {loading && !data ? <Loading/> : !data ? null : data.items.length === 0 ? <EmptyState title="아직 주문 내역이 없습니다" text="마음에 드는 음반을 찾아 나만의 컬렉션을 완성해 보세요."/> : <>
      <SectionCaption index="01" title="최근 주문" note={`총 ${data.total}건 · 최신 주문부터 표시됩니다.`}/>
      <div className="commerce-history-list">{data.items.map((order) => <article className="commerce-history" key={order.id}>
        <div className="commerce-history-head"><div><span>{formatDate(order.created_at)}</span><h2>ORDER <span>#{order.id}</span></h2></div><Status status={order.status}/></div>
        <div className="commerce-history-body"><div><p>낙원레코드 주문 #{order.id}</p><small>상품 상세는 주문 상세 화면에서 확인할 수 있습니다.</small></div><strong>{formatPrice(order.total_amount)}</strong></div>
        <Link to={`/orders/${order.id}`} className="commerce-history-detail">주문 상세 보기 <span aria-hidden="true">↗</span></Link>
      </article>)}</div>
      <nav className="commerce-pagination" aria-label="주문 페이지"><button type="button" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>← 이전</button><span>{page} <small>/</small> {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setParams({ page: String(page + 1) })}>다음 →</button></nav>
    </>}
  </main>;
}
