import { Link, Navigate } from 'react-router-dom';
import './MyPage.css';
import MyReviews from '../reviews/MyReviews';
import Wishlist from '../wishlist/Wishlist'; // [추가] 위시리스트 컴포넌트

export default function MyPage({
  showReviews = false,
  showWishlist = false, // [추가]
  currentUser,
  authLoading,
  authError,
}) {
  if (authLoading) {
    return (
      <main className="my-page">
        <p>로그인 정보를 확인하고 있어요.</p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="my-page">
        <p role="alert">{authError}</p>
        <Link to="/login">로그인 화면으로 이동 →</Link>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAccountTab = !showReviews && !showWishlist;

  return (
    <main className="my-page">
      <header className="my-page__heading">
        <p>MY ACCOUNT / 내 계정</p>
        <h1>My record room.</h1>
        <span>음악을 모으고, 나만의 취향을 쌓아가는 공간.</span>
      </header>

      <div className="my-page__layout">
        <aside className="my-page__sidebar" aria-label="마이페이지 메뉴">
          <p className="my-page__user">{currentUser.username}님</p>
          <p className="my-page__hint">{currentUser.email}</p>
          <nav className="my-page__nav" aria-label="내 계정 메뉴">
            <Link
              to="/mypage"
              className={isAccountTab ? 'my-page__nav-current' : undefined}
              aria-current={isAccountTab ? 'page' : undefined}
            >
              계정 정보 <span aria-hidden="true">→</span>
            </Link>
            <Link to="/orders">
              주문 내역 <span aria-hidden="true">→</span>
            </Link>
            {/* [수정] 마이페이지 내 찜한 음반 경로로 연결 */}
            <Link
              to="/mypage/wishlist"
              className={showWishlist ? 'my-page__nav-current' : undefined}
              aria-current={showWishlist ? 'page' : undefined}
            >
              찜한 음반 <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/mypage/reviews"
              className={showReviews ? 'my-page__nav-current' : undefined}
              aria-current={showReviews ? 'page' : undefined}
            >
              내가 쓴 리뷰 <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </aside>

        {/* [수정] 탭에 따라 리뷰 / 찜한 음반 / 계정 정보 렌더링 */}
        {showReviews ? (
          <section className="my-page__content" aria-labelledby="my-reviews-title">
            <h2 id="my-reviews-title">내가 쓴 리뷰</h2>
            <p className="my-page__hint">작성한 리뷰를 한곳에서 확인할 수 있어요.</p>
            <MyReviews isAuthenticated={Boolean(currentUser)} />
          </section>
        ) : showWishlist ? (
          <section className="my-page__content" aria-labelledby="my-wishlist-title">
            <Wishlist isAuthenticated={Boolean(currentUser)} />
          </section>
        ) : (
          <section className="my-page__content" aria-labelledby="account-title">
            <div className="my-page__stats" aria-label="내 활동">
              <Link to="/orders"> 주문 내역 <span aria-hidden="true">→</span> </Link>
              <Link to="/mypage/wishlist"> 찜한 음반 <span aria-hidden="true">→</span> </Link>
            </div>

            <h2 id="account-title">계정 정보</h2>
            <form className="my-page__form" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="account-name">이름</label>
              <input id="account-name" type="text" value={currentUser.username} readOnly />

              <label htmlFor="account-email">이메일</label>
              <input id="account-email" type="email" value={currentUser.email} readOnly />
              <button type="submit" disabled>변경사항 저장 <span aria-hidden="true">→</span></button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
