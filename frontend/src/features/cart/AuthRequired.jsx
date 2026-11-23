import { Link } from 'react-router-dom';
import { PageHeading } from './CommerceUI';

export default function AuthRequired({ title = '나의 컬렉션' }) {
  return (
    <main className="commerce-page">
      <PageHeading
        eyebrow="MEMBERS ONLY"
        title={title}
        description="로그인 후 내 장바구니와 주문 내역을 확인할 수 있습니다."
      />

      <div className="commerce-auth-gate">
        <div className="commerce-auth-icon" aria-hidden="true">↗</div>

        <h2>음악이 쌓이는 공간</h2>
        <p>로그인하면 담아둔 LP와 CD, 주문 기록을 이어서 볼 수 있습니다.</p>
        <br />
        <Link to="/login" className="commerce-primary">
          로그인하기
        </Link>
        <br />
        <Link to="/" className="commerce-text-link">
          홈으로 돌아가기 ↗
        </Link>
      </div>
    </main>
  );
}