import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthToken } from "../../lib/useAuthToken";
import { formatPrice } from "../../lib/apiClient";
import { getCart } from "../cart/api";
import AuthRequired from "../cart/AuthRequired";
import {
  Cover,
  EmptyState,
  Loading,
  Message,
  PageHeading,
  SectionCaption,
  Summary,
} from "../cart/CommerceUI";
import { createOrder } from "./api";

export default function CheckoutPage() {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directAlbumId = searchParams.get("albumId");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadCheckout() {
      setLoading(true);
      setError("");
      setCart(null);

      try {
        if (directAlbumId !== null) {
          if (!/^[1-9]\d*$/.test(directAlbumId)) {
            throw new Error("올바른 음반 번호가 아니에요.");
          }

          const response = await fetch(
            `${API_BASE}/api/albums/${directAlbumId}`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error("주문할 음반을 불러오지 못했어요.");
          }

          const album = await response.json();
          const quantity = 1;

          const directOrder = {
            items: [
              {
                id: album.id,
                album_id: album.id,
                album,
                quantity,
                unit_price: album.price,
                subtotal: album.price * quantity,
              },
            ],
            total_amount: album.price * quantity,
          };

          if (!controller.signal.aborted) {
            setCart(directOrder);
          }
        } else {
          const result = await getCart(token, controller.signal);

          if (!controller.signal.aborted) {
            setCart(result);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "주문 정보를 불러오지 못했어요.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      controller.abort();
    };
  }, [token, retry, directAlbumId, API_BASE]);

  async function submitOrder() {
    if (busy || !cart?.items.length) return;
    setBusy(true);
    setError("");
    try {
      const items = cart.items.map((item) => ({
        album_id: item.album_id,
        quantity: item.quantity,
      }));

      const clearCart = directAlbumId === null;
      const result = await createOrder(token, items, clearCart);
      navigate(`/orders/complete/${result.id}`, { replace: true });
    } catch (err) {
      setError(err.message);

      if (directAlbumId === null) {
        try {
          setCart(await getCart(token));
        } catch {}
      }
    } finally {
      setBusy(false);
    }
  }

  if (!token) return <AuthRequired title="주문서" />;
  const items = cart?.items || [];
  const unavailable = items.some(
    (item) => item.album.stock < item.quantity || item.album.stock < 1,
  );
  return (
    <main className="commerce-page">
      <PageHeading
        eyebrow="CHECKOUT / 02"
        title="주문서"
        description="음반과 수량을 한 번 더 확인해 주세요. 주문 접수와 동시에 재고가 차감됩니다."
      />
      <div className="commerce-progress" aria-label="주문 단계">
        <span>01 장바구니</span>
        <i />
        <span className="is-current">02 주문서</span>
        <i />
        <span>03 주문 완료</span>
      </div>
      {error && (
        <Message
          onRetry={() => {
            setLoading(true);
            setRetry((value) => value + 1);
          }}
        >
          {error}
        </Message>
      )}
      {loading && !cart ? (
        <Loading />
      ) : !cart ? null : items.length === 0 ? (
        <EmptyState
          title="주문할 음반이 없습니다"
          text="장바구니에 음반을 담아 다시 방문해 주세요."
        />
      ) : (
        <div className="commerce-layout">
          <div className="commerce-primary-column">
            <SectionCaption title="주문 상품" />
            <div className="commerce-order-product-list">
              {items.map(({ id, album, quantity, subtotal, unit_price }) => (
                <article className="commerce-order-product" key={id}>
                  <Link to={`/albums/${album.id}`}>
                    <Cover album={album} />
                  </Link>
                  <div>
                    <span className="commerce-format">{album.format}</span>
                    <Link
                      to={`/albums/${album.id}`}
                      className="commerce-detail-title-link"
                    >
                      <h3>{album.title}</h3>
                    </Link>
                    <p>{album.artist}</p>
                    <small>
                      {formatPrice(unit_price)} × {quantity}개
                    </small>
                  </div>
                  <strong>{formatPrice(subtotal)}</strong>
                </article>
              ))}
            </div>
            <div className="commerce-info-panel">
              <div className="commerce-info-mark">i</div>
              <div>
                <h3>주문 전 확인</h3>
              </div>
            </div>
            <Link className="commerce-back-link" to="/cart">
              ← 장바구니로 돌아가기
            </Link>
          </div>
          <Summary
            items={items}
            total={cart.total_amount}
            label="총 주문 금액"
            busy={busy}
            disabled={unavailable}
            action={submitOrder}
            footer={
              <>
                {unavailable && (
                  <Message type="warning">
                    주문할 수 없는 상품이 있습니다. 수량을 수정해 주세요.
                  </Message>
                )}
              </>
            }
          />
        </div>
      )}
    </main>
  );
}
