import { Link, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    return (
        <main className="admin-layout">
            {/* 관리자 화면 제목 */}
        <header className="admin-heading">
            <p className="admin-label">STORE BACK OFFICE</p>
            <h1>관리자 공간</h1>
            <p className="admin-description">
            음반과 주문, 리뷰를 관리하는 공간입니다.
            </p>
        </header>

        <div className="admin-body">
            {/* 관리자 공통 메뉴 */}
            <nav className="admin-menu" aria-label="관리자 메뉴">
                <Link to="/admin">관리 개요</Link>
                <Link to="/admin/orders">주문 관리</Link>
                <Link to="/admin/reviews">리뷰 관리</Link>
            </nav>

            {/* 주소에 맞는 관리자 화면이 들어오는 자리 */}
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    </main>
    );
}