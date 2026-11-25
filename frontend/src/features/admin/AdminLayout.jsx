import { Link, Navigate, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout({
    currentUser,
    authLoading,
    authError,
}) {
    // 로그인 정보를 확인하는 동안 관리자 화면을 보여주지 않음
    if (authLoading) {
        return <p>로그인 정보를 확인하고 있어요.</p>;
    }

    // 서버 연결 문제 등으로 로그인 정보를 확인하지 못한 경우
    if (authError) {
        return (
            <main className="admin-layout">
                <p role="alert">{authError}</p>
                <Link to="/login">로그인 화면으로 이동 →</Link>
            </main>
        );
    }

    // 로그인하지 않았다면 로그인 화면으로 이동
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 일반 회원이라면 관리자 화면 대신 홈으로 이동
    if (!currentUser.is_admin) {
        return <Navigate to="/" replace />;
    }
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
                <Link to="/admin/albums">음반 관리</Link>
                <Link to="/admin/orders">주문 관리</Link>
                <Link to="/admin/reviews">리뷰 관리</Link>
                <Link to="/admin/recommendations">추천 관리</Link>
            </nav>

            {/* 주소에 맞는 관리자 화면이 들어오는 자리 */}
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    </main>
    );
}