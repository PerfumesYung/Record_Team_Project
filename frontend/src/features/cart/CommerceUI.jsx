import { Link } from "react-router-dom";
import { formatPrice } from "../../lib/apiClient";

export function PageHeading({ eyebrow, title, description, extra }) {
  return (
    <div className="commerce-heading">
      <div>
        <p className="commerce-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="commerce-lead">{description}</p>
      </div>
      {extra}
    </div>
  );
}
export function SectionCaption({ index, title, note }) {
  return (
    <div className="commerce-section-caption">
      <span className="commerce-section-index">{index}</span>
      <div>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
    </div>
  );
}
export function Summary({
  items,
  total,
  action,
  disabled,
  busy,
  label = "주문 합계",
  footer,
}) {
  const totalCount = items.reduce((n, item) => n + item.quantity, 0);
  return (
    <aside className="commerce-summary">
      <p className="commerce-card-kicker">ORDER SUMMARY</p>
      <h2>주문 요약</h2>
      <div className="commerce-summary-divider" />
      <div className="commerce-summary-row">
        <span>상품 수량</span>
        <strong>{totalCount}개</strong>
      </div>
      <div className="commerce-summary-row">
        <span>상품 금액</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      <div className="commerce-summary-row">
        <span>배송비</span>
        <strong>해당 없음</strong>
      </div>
      <div className="commerce-summary-divider" />
      <div className="commerce-summary-total">
        <span>{label}</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      {action && (
        <button
          type="button"
          className="commerce-primary commerce-wide"
          onClick={action}
          disabled={disabled || busy}
        >
          {busy ? "처리 중..." : "다음 단계로"}{" "}
          <span aria-hidden="true">↗</span>
        </button>
      )}
      {footer}
    </aside>
  );
}
export function Message({ children, type = "error", onRetry }) {
  return (
    <div
      className={`commerce-message commerce-message--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span>{children}</span>
      {onRetry && (
        <button onClick={onRetry} type="button">
          다시 시도
        </button>
      )}
    </div>
  );
}
export function Loading({ text = "정보를 불러오고 있습니다..." }) {
  return (
    <div className="commerce-state" role="status">
      <div className="commerce-loader" />
      <p>{text}</p>
    </div>
  );
}
export function EmptyState({
  title,
  text,
  button = "음반 둘러보기",
  to = "/",
}) {
  return (
    <div className="commerce-state commerce-state--empty">
      <div className="commerce-empty-vinyl" aria-hidden="true">
        <span />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="commerce-secondary" to={to}>
        {button} <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
export function Cover({ album, className = "" }) {
  return (
    <img
      className={`commerce-cover ${className}`}
      src={album?.image_url || "/images/albums/placeholder.svg"}
      alt={`${album?.title || "음반"} 표지`}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith("/images/albums/placeholder.svg"))
          e.currentTarget.src = "/images/albums/placeholder.svg";
      }}
    />
  );
}
export function Status({ status }) {
  return (
    <span
      className={`commerce-status commerce-status--${String(status).toLowerCase()}`}
    >
      {{ RECEIVED: "접수 완료", PROCESSING: "처리 중", COMPLETED: "처리 완료" }[
        status
      ] || status}
    </span>
  );
}
