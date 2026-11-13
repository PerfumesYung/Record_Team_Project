import { Link } from 'react-router-dom';
import './MyPage.css';

export default function MyPage({ showReviews = false }) {
  return (
    <main className="my-page">
      <header className="my-page__heading">
        <p>MY ACCOUNT / 내 계정</p>
        <h1>My record room.</h1>
        <span>음악을 모으고, 나만의 취향을 쌓아가는 공간.</span>
      </header>

      <div className="my-page__layout">
        <aside className="my-page__sidebar" aria-label="마이페이지 메뉴">
          <p className="my-page__user">계정 정보</p>
          <p className="my-page__hint">로그인 정보 연결 예정</p>
          <nav className="my-page__nav" aria-label="내 계정 메뉴">
            <Link to="/mypage" className={!showReviews ? 'my-page__nav-current' : undefined} aria-current={!showReviews ? 'page' : undefined}>계정 정보 <span aria-hidden="true">→</span></Link>
            <button type="button" disabled>주문 내역 <span aria-hidden="true">→</span></button>
            <button type="button" disabled>찜한 음반 <span aria-hidden="true">→</span></button>
            <Link to="/mypage/reviews" className={showReviews ? 'my-page__nav-current' : undefined} aria-current={showReviews ? 'page' : undefined}>내가 쓴 리뷰 <span aria-hidden="true">→</span></Link>
          </nav>
        </aside>

        {showReviews ? (
          <section className="my-page__content" aria-labelledby="my-reviews-title">
            <h2 id="my-reviews-title">내가 쓴 리뷰</h2>
            <p className="my-page__hint">작성한 리뷰를 한곳에서 확인할 수 있어요.</p>
            <div className="my-page__reviews-placeholder">
              <p>리뷰 목록은 로그인 및 리뷰 기능을 연결한 후 확인할 수 있어요.</p>
            </div>
          </section>
        ) : (
        <section className="my-page__content" aria-labelledby="account-title">
          <div className="my-page__stats" aria-label="내 활동">
            <button type="button" disabled><strong>—</strong><span>MY ORDERS / 주문</span></button>
            <button type="button" disabled><strong>—</strong><span>WISH LIST / 찜</span></button>
          </div>

          <h2 id="account-title">계정 정보</h2>
          <form className="my-page__form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="account-name">이름</label>
            <input id="account-name" type="text" placeholder="로그인 후 표시됩니다" disabled />
            <label htmlFor="account-email">이메일</label>
            <input id="account-email" type="email" placeholder="로그인 후 표시됩니다" disabled />
            <button type="submit" disabled>변경사항 저장 <span aria-hidden="true">→</span></button>
          </form>
        </section>
        )}
      </div>
    </main>
  );
}
