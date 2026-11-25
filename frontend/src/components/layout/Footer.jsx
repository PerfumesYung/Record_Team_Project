import { Link } from 'react-router-dom';
import './Footer.css';

// 화면이 완성되면 각 메뉴에 주소를 연결합니다.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section className="site-footer__brand">
          <h2>낙원레코드.</h2>
          <p>좋아하는 음악을, 손에 남는 한 장으로.<br />LP와 CD로 시작하는 나만의 컬렉션.</p>
        </section>

        <nav className="site-footer__section" aria-label="음반 메뉴">
          <h3>RECORDS</h3>
          <Link to="/">홈</Link>
          <Link to="/albums">전체 음반</Link>
          <Link to="/recommendations">취향 추천</Link>
        </nav>

        <section className="site-footer__section">
          <h3>MY COLLECTION</h3>
          <Link to="/mypage">내 계정</Link>
          <Link to="/orders">주문 내역</Link>
          <Link to="/mypage/wishlist">찜한 음반</Link>
        </section>

        <section className="site-footer__section">
          <h3>LISTENING GUIDE</h3>
          <Link to="/guide">LP·CD 입문 안내</Link>
          <Link to="/cart">장바구니</Link>
        </section>
      </div>
      <div className="site-footer__bottom">© NAKWON RECORDS · TEAM PROJECT</div>
    </footer>
  );
}
