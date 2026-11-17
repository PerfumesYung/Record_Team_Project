import { Link } from 'react-router-dom';
import SearchIcon from '../ui/icons/SearchIcon';
import ProfileIcon from '../ui/icons/ProfileIcon';
import CartIcon from '../ui/icons/CartIcon';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <p className="site-header__notice">NAKWON RECORDS — OBJECTS FOR YOUR EVERYDAY LISTENING</p>
      <div className="site-header__inner">
        <nav className="site-header__menu" aria-label="음반 메뉴">
          <button type="button" disabled>ALL RECORDS</button>
          <button type="button" disabled>LP</button>
          <button type="button" disabled>CD</button>
          <button type="button" disabled>취향 추천</button>
        </nav>

        <Link className="site-header__brand" to="/" aria-label="낙원레코드 홈">
          <span>낙원레코드</span>
          <small>NAKWON RECORDS</small>
        </Link>

        <nav className="site-header__actions" aria-label="사용자 메뉴">
          <button type="button" disabled><SearchIcon /> <span>검색</span></button>
          <button type="button" disabled><ProfileIcon size={26} /> <span>로그인</span></button>
          <Link to="/cart" className="site-header__action-link"><CartIcon /> <span>장바구니</span></Link>
        </nav>
      </div>
    </header>
  );
}
