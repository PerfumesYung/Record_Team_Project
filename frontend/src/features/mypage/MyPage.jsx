import { Link, Navigate } from 'react-router-dom';
import './MyPage.css';
import MyReviews from '../reviews/MyReviews';


  export default function MyPage({ showReviews = false, currentUser, authLoading, authError,}) {
    // 로그인 정보를 확인하는 동안 잠깐 기다립니다.
    if (authLoading) {
      return (
        <main className="my-page">
          <p>로그인 정보를 확인하고 있어요.</p>
        </main>
      );
    }

    // 서버 연결이나 토큰 확인에 실패했을 때 안내
    if (authError) {
      return (
        <main className="my-page">
          <p role="alert">{authError}</p>
          <Link to="/login">로그인 화면으로 이동 →</Link>
        </main>
      );
    }

    // 확인이 끝나고 로그인정보를 못 읽으면 다시 로그인 페이지로 반환
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

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
            <Link to="/mypage" className={!showReviews ? 'my-page__nav-current' : undefined} aria-current={!showReviews ? 'page' : undefined}>계정 정보 <span aria-hidden="true">→</span></Link>
            <Link to="/orders">주문 내역 <span aria-hidden="true">→</span></Link>
            <Link to="/wishlist">찜한 음반 <span aria-hidden="true">→</span></Link>
            <Link to="/mypage/reviews" className={showReviews ? 'my-page__nav-current' : undefined} aria-current={showReviews ? 'page' : undefined}>내가 쓴 리뷰 <span aria-hidden="true">→</span></Link>
          </nav>
        </aside>

        {showReviews ? (
          <section className="my-page__content" aria-labelledby="my-reviews-title">
            <h2 id="my-reviews-title">내가 쓴 리뷰</h2>
            <p className="my-page__hint">작성한 리뷰를 한곳에서 확인할 수 있어요.</p>
            {/* 실제로 작성한 리뷰 목록 */}
            <MyReviews isAuthenticated={Boolean(currentUser)} />
          </section>
        ) : (
        <section className="my-page__content" aria-labelledby="account-title">
          <div className="my-page__stats" aria-label="내 활동">
            <Link to="/orders"> 주문 내역 <span aria-hidden="true">→</span> </Link>
            <Link to="/wishlist"> 찜한 음반 <span aria-hidden="true">→</span> </Link>
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
