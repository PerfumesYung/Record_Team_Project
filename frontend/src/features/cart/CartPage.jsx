import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../lib/apiClient';
import { useAuthToken } from '../../lib/useAuthToken';
import { addCartItem, deleteCartItem, getCart, updateCartItem } from './api';
import AuthRequired from './AuthRequired';
import { Cover, EmptyState, Loading, Message, PageHeading, SectionCaption, Summary } from './CommerceUI';

export default function CartPage() {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [retry, setRetry] = useState(0);
  const [albumIdInput, setAlbumIdInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getCart(token, controller.signal)
      .then((data) => { if (!controller.signal.aborted) { setCart(data); setError(''); } })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, retry]);

  async function change(cartItemId, quantity) {
    if (busyId !== null || quantity < 1) return;
    setBusyId(cartItemId); setError('');
    try {
      await updateCartItem(token, cartItemId, quantity);
      setCart(await getCart(token));
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  }

  async function remove(cartItemId, title) {
    if (!window.confirm(`'${title}' 음반을 장바구니에서 삭제하시겠습니까?`)) return;
    setBusyId(cartItemId); setError('');
    try {
      await deleteCartItem(token, cartItemId);
      setCart(await getCart(token));
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  }

  async function addForTest(event) {
    event.preventDefault();
    const albumId = Number(albumIdInput);
    if (!Number.isInteger(albumId) || albumId <= 0) { setError('음반 ID는 1 이상의 정수여야 합니다.'); return; }
    setAdding(true); setError('');
    try {
      await addCartItem(token, albumId, 1);
      setCart(await getCart(token));
      setAlbumIdInput('');
    } catch (err) { setError(err.message); }
    finally { setAdding(false); }
  }

  if (!token) return <AuthRequired title="장바구니" />;
  const lines = cart?.items || [];
  const unavailable = lines.some((item) => item.album.stock < item.quantity || item.album.stock < 1);
  const totalCount = lines.reduce((sum, item) => sum + item.quantity, 0);
  return <main className="commerce-page">
    <PageHeading eyebrow="YOUR COLLECTION / 01" title="장바구니" description="소장하고 싶은 음악을 모았습니다. 주문 전 음반과 수량을 확인해 주세요."
      extra={<div className="commerce-heading-count"><strong>{totalCount}</strong><span>ITEMS IN CART</span></div>} />
    <div className="commerce-progress" aria-label="주문 단계"><span className="is-current">01 장바구니</span><i/><span>02 주문서</span><i/><span>03 주문 완료</span></div>
    {error && <Message onRetry={() => { setLoading(true); setRetry((value) => value + 1); }}>{error}</Message>}
    {loading && !cart ? <Loading/> : !cart ? null : lines.length === 0 ? <EmptyState title="장바구니가 비어 있습니다" text="마음에 드는 LP와 CD를 담아 나만의 컬렉션을 시작해 보세요."/> : <div className="commerce-layout">
      <div className="commerce-primary-column">
        <SectionCaption index="01" title="선택한 음반" note="수량 변경 시 현재 재고와 가격을 다시 확인합니다." />
        <div className="commerce-lines">{lines.map((item) => {
          const { album, quantity, subtotal, unit_price, id } = item;
          const soldOut = album.stock < quantity || album.stock < 1;
          const busy = busyId !== null;
          return <article className="commerce-line" key={id}>
            <Cover album={album}/>
            <div className="commerce-line-main">
              <div className="commerce-line-title-row"><span className="commerce-format">{album.format || 'RECORD'}</span><button className="commerce-remove" type="button" disabled={busy} onClick={() => remove(id, album.title)} aria-label={`${album.title} 삭제`}>✕ <span>삭제</span></button></div>
              <h2>{album.title}</h2><p className="commerce-artist">{album.artist}</p>
              <p className="commerce-unit-price">{formatPrice(unit_price)} <span>/ 1장</span></p>
              {soldOut && <p className="commerce-stock-warning">현재 구매 불가 · 재고 {album.stock}개</p>}
              <div className="commerce-line-bottom">
                <div className="commerce-quantity" role="group" aria-label={`${album.title} 수량`}>
                  <button type="button" aria-label="수량 줄이기" disabled={busy || quantity <= 1} onClick={() => change(id, quantity - 1)}>−</button>
                  <span aria-live="polite">{quantity}</span>
                  <button type="button" aria-label="수량 늘리기" disabled={busy || quantity >= album.stock} onClick={() => change(id, quantity + 1)}>+</button>
                </div>
                <strong className="commerce-line-total">{formatPrice(subtotal)}</strong>
              </div>
            </div>
          </article>;
        })}</div>
        <Link className="commerce-back-link" to="/">← 쇼핑 계속하기</Link>
      </div>
      <Summary items={lines} total={cart.total_amount} label="결제 예정 금액" action={() => navigate('/orders/new')} disabled={unavailable || busyId !== null}
        footer={unavailable ? <Message type="warning">일부 음반의 재고가 부족합니다. 수량을 조정해 주세요.</Message> : <p className="commerce-summary-extra">주문서에서 마지막으로 내용을 확인합니다.</p>}/>
    </div>}
    {import.meta.env.DEV && <form className="commerce-dev-tools" onSubmit={addForTest}>
      <div><span className="commerce-card-kicker"></span><h3>테스트용 장바구니 담기</h3></div>
      <label>음반 ID <input type="number" min="1" step="1" placeholder="예: 1" value={albumIdInput} onChange={(e) => setAlbumIdInput(e.target.value)} /></label>
      <button type="submit" className="commerce-secondary" disabled={adding}>{adding ? '담는 중...' : '1개 담기'}</button>
    </form>}
  </main>;
}
