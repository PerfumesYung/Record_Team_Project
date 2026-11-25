import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDate, formatPrice } from "../../lib/apiClient";
import { useAuthToken } from "../../lib/useAuthToken";
import AuthRequired from "../cart/AuthRequired";
import {
  Cover,
  Loading,
  Message,
  PageHeading,
  SectionCaption,
  Status,
} from "../cart/CommerceUI";
import { deleteOrder, getOrder } from "./api";

export default function OrderDetailPage() {
  const token = useAuthToken();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getOrder(token, orderId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setOrder(result);
          setError("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, [token, orderId, retry]);
  async function handleDelete() {
    if (!window.confirm(`주문 #${order.id}을 취소하시겠습니까?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteOrder(token, order.id);
      navigate("/orders?deleted=1", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  if (!token) return <AuthRequired title="주문 상세" />;
  return (
    <main className="commerce-page">
      <PageHeading eyebrow="MY ACCOUNT / ORDER DETAIL" title="주문 상세" />
      <Link to="/orders" className="commerce-back-link commerce-detail-back">
        ← 전체 주문 내역
      </Link>
      {error && (
        <Message
          onRetry={() => {
            setError("");
            setRetry((n) => n + 1);
          }}
        >
          {error}
        </Message>
      )}
      {!order ? (
        !error && <Loading />
      ) : (
        <div className="commerce-layout">
          <div className="commerce-primary-column">
            <section className="commerce-detail-meta">
              <span className="commerce-card-kicker">ORDER INFORMATION</span>
              <div>
                <div>
                  <small>주문 번호</small>
                  <h2>#{order.id}</h2>
                </div>
                <Status status={order.status} />
              </div>
              <p>
                주문 접수일 <strong>{formatDate(order.created_at)}</strong>
              </p>
            </section>
            <SectionCaption title="주문 음반" />
            <div className="commerce-detail-items">
              {order.items.map((item) => (
                <div className="commerce-detail-item" key={item.album_id}>
                  <Link to={`/albums/${item.album_id}`}>
                    <Cover
                      album={{
                        title: item.title,
                        image_url: item.image_url,
                      }}
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/albums/${item.album_id}`}
                      className="commerce-detail-title-link"
                    >
                      <h3>{item.title}</h3>
                    </Link>

                    <p>
                      {formatPrice(item.unit_price)} × {item.quantity}개
                    </p>
                  </div>

                  <strong>
                    {formatPrice(item.unit_price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
            <section className="commerce-info-panel">
              <div className="commerce-info-mark">i</div>
              <div>
                <h3>주문 상태 안내</h3>
                <p>
                  접수 완료 → 주문 처리 중 → 처리 완료 순서로 변경됩니다. 접수 완료
                  상태에서만 주문 취소가 가능하며, 취소한 주문은 주문 내역에서
                  사라집니다.
                </p>
              </div>
            </section>
          </div>
          <aside className="commerce-summary">
            <p className="commerce-card-kicker">PAYMENT SUMMARY</p>
            <h2>주문 정보</h2>
            <div className="commerce-summary-divider" />
            <div className="commerce-summary-row">
              <span>주문 상품</span>
              <strong>
                {order.items.reduce((n, item) => n + item.quantity, 0)}개
              </strong>
            </div>
            <div className="commerce-summary-row">
              <span>배송비</span>
              <strong>해당 없음</strong>
            </div>
            <div className="commerce-summary-divider" />
            <div className="commerce-summary-total">
              <span>총 주문 금액</span>
              <strong>{formatPrice(order.total_amount)}</strong>
            </div>
            {order.status === "RECEIVED" ? (
              <button
                className="commerce-danger-button"
                type="button"
                disabled={busy}
                onClick={handleDelete}
              >
                {busy ? "취소 처리 중..." : "주문 취소"}
              </button>
            ) : (
              <p className="commerce-detail-disabled">
                주문 처리 중 또는 처리 완료된 주문은 취소할 수 없습니다.
              </p>
            )}
            <Link to="/orders" className="commerce-secondary commerce-wide">
              주문 목록으로
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
