import { Route, Routes } from 'react-router-dom';

// 공통 헤더, 푸터 컴포넌트
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// 관리자 화면 관련 컴포넌트
import AdminLayout from '../features/admin/AdminLayout';
import AdminHomePage from '../features/admin/AdminHomePage';
import AdminOrdersPage from '../features/admin/AdminOrdersPage';
import AdminReviewsPage from '../features/admin/AdminReviewsPage';

function HomePage() {
  return (
    <main className="starter min-h-screen">
      <p className="starter-label">TEAM PROJECT · LP &amp; CD</p>
      <h1 className="font-heading">NAKWON RECORDS</h1>
      <p>낙원레코드 프로젝트가 시작됐어요.</p>
      <p className="starter-note">이 화면은 각 기능을 개발하면서 교체할 기본 화면입니다.</p>
    </main>
  );
}

//화면 준비되면 라우터 추가
export default function App() {
  return (
    <>
      <Header />
        <Routes>
          {/* 기존 홈 화면 */}
          <Route path="/" element={<HomePage />} />

          {/* 관리자 공통 틀 */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* /admin */}
            <Route index element={<AdminHomePage />} />

            {/* /admin/orders */}
            <Route path="orders" element={<AdminOrdersPage />} />

            {/* /admin/reviews */}
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
        </Routes>
      <Footer />
    </>
  );
}
