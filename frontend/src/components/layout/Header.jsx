import { Link } from 'react-router-dom';
import SearchIcon from '../ui/icons/SearchIcon';
import ProfileIcon from '../ui/icons/ProfileIcon';
import CartIcon from '../ui/icons/CartIcon';
import './Header.css';

export default function Header({ currentUser, onLogout }) {
  return (
    <header className="site-header">
      <p className="site-header__notice">NAKWON RECORDS — OBJECTS FOR YOUR EVERYDAY LISTENING</p>
      <div className="site-header__inner">
        <nav className="site-header__menu" aria-label="음반 메뉴">
          <Link to="/albums" className='hover:text-[var(--color-accent)]'>ALL RECORDS</Link>
          <Link to="/albums?format=LP" className='hover:text-[var(--color-accent)]'>LP</Link>
          <Link to="/albums?format=CD" className='hover:text-[var(--color-accent)]'>CD</Link>
          <Link to="/recommendations" className='hover:text-[var(--color-accent)]'>취향 추천</Link>
        </nav>

        <Link className="site-header__brand" to="/" aria-label="낙원레코드 홈">
          <span>낙원레코드</span>
          <small>NAKWON RECORDS</small>
        </Link>

        <nav className="site-header__actions" aria-label="사용자 메뉴">
          <Link to="/albums" className="site-header__account"><SearchIcon /><span className='hover:text-[var(--color-accent)]'>검색</span></Link>
          
          {currentUser ? (
              <>
                <Link className="site-header__account" to="/mypage">
                  <ProfileIcon size={26} />
                  <span className='hover:text-[var(--color-accent)]'>내 계정</span>
                </Link>
                <button type="button" onClick={onLogout} className="cursor-pointer hover:text-[var(--color-accent)]">
                  로그아웃
                </button>
                {currentUser.is_admin === true && ( <Link to="/admin" className="whitespace-nowrap text-[14px] text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]"> 관리자 페이지 </Link> )}
              </>
            ) : (
              <Link className="site-header__account" to="/login">
                <ProfileIcon size={26} />
                <span className='hover:text-[var(--color-accent)]'>로그인</span>
              </Link>
            )}
          <Link to="/cart" className="site-header__account"><CartIcon /><span className='hover:text-[var(--color-accent)]'>장바구니</span></Link>
        </nav>
      </div>
    </header>
  );
}
