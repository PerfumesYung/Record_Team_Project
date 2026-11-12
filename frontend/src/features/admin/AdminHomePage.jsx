import { Link } from 'react-router-dom';

export default function AdminHomePage() {
    return (
        <section>
        <h2>관리 기능 한눈에 보기</h2>

        <div className="admin-card-grid">
            <article className="admin-card">
                <h3>주문 관리</h3>
                <p>주문 목록과 주문 상태를 확인합니다.</p>

                <Link to="/admin/orders"> 관리하기 → </Link>
            </article>

            <article className="admin-card">
                <h3>리뷰 관리</h3>
                <p>등록된 리뷰와 공개 상태를 관리합니다.</p>
                
            <Link to="/admin/reviews"> 관리하기 → </Link>
                </article>
            </div>
        </section>
    );
}