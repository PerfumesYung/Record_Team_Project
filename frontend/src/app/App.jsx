import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  getAccessToken,
  getCurrentUser,
  logout,
} from '../features/auth/api';

// 공통 헤더, 푸터 컴포넌트
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// 관리자 화면 관련 컴포넌트
import AdminLayout from '../features/admin/AdminLayout';
import AdminHomePage from '../features/admin/AdminHomePage';
import AdminOrdersPage from '../features/admin/AdminOrdersPage';
import AdminReviewsPage from '../features/admin/AdminReviewsPage';
import MyPage from '../features/mypage/MyPage';
import AuthPage from '../features/auth/AuthPage';
import AdminOrderDetailPage from '../features/admin/AdminOrderDetailPage';
import AdminAlbumsPage from '../features/admin/albums/AdminAlbumsPage';
import AlbumFormPage from '../features/admin/albums/AlbumFormPage';
import AdminRecommendationsPage from '../features/admin/recommendations/AdminRecommendationsPage';



function HomePage() {
  return (
    <main className="starter min-h-screen">
      <p className="starter-label">TEAM PROJECT · LP &amp; CD</p>
      <h1 className="font-heading">NAKWON RECORDS</h1>
      <p>낙원레코드 프로젝트가 시작됐어요.</p>
      <p className="starter-note">홈·음반 목록은 해당 기능 담당자가 완성하면 이 페이지와 교체합니다.</p>
      <p><Link className="commerce-primary" to="/cart">장바구니 보기 ↗</Link></p>
    </main>
  );
}

//화면 준비되면 라우터 추가
export default function App() {
  // 로그인한 사용자 정보 저장
  const [currentUser, setCurrentUser] = useState(null);

  // 로그인 정보 확인 로딩
  const [authLoading, setAuthLoading] = useState(true);

  // 오류 메시지 표시
  const [authError, setAuthError] = useState('');

  // 토큰으로 로그인 한 사용자 가져오기
  async function loadCurrentUser() {
    const user = await getCurrentUser();

    setCurrentUser(user);
    setAuthError('');
  }

  // 새로고침했을 때 저장된 토큰으로 로그인 정보를 불러오기
  useEffect(() => {
    async function restoreLogin() {
      // 저장된 토큰이 없으면 로그인 확인 끝냄
      if (!getAccessToken()) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setAuthError('');
      } catch {
        // 서버가 없거나 토큰이 없으면 오류 메시지
        setCurrentUser(null);
        setAuthError('로그인 정보를 확인하지 못했어요. 서버 상태나 로그인을 확인해 주세요.');
      } finally {
        setAuthLoading(false);
      }
    }

    restoreLogin();
  }, []);

  // 로그아웃하면 토큰과 화면의 사용자 정보를 삭제
  function handleLogout() {
    logout();
    setCurrentUser(null);
    setAuthError('');
  }
  return (
    <>
      <Header currentUser={currentUser} onLogout={handleLogout} />
        <Routes>
          {/* 기존 홈 화면 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage key="login" onLogin={loadCurrentUser} />} />
          <Route path="/signup" element={<AuthPage key="signup" signup />} />

          <Route path="/mypage" element={ <MyPage currentUser={currentUser} authLoading={authLoading} authError={authError} />}/>
          <Route path="/mypage/reviews" element={ <MyPage showReviews currentUser={currentUser} authLoading={authLoading} authError={authError} /> }/>

          {/* 관리자 공통 틀 */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* 관리자 메인 화면: /admin */}
            <Route index element={<AdminHomePage />} />

            {/* 관리자 주문 목록: /admin/orders */}
            <Route path="orders" element={<AdminOrdersPage />} /> 
            {/* 관리자 주문 상세: /admin/orders/주문번호 */}
            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />

            {/* 관리자 리뷰 관리: /admin/reviews */}
            <Route path="reviews" element={<AdminReviewsPage />} />

            {/* 관리자 음반 목록: /admin/albums */}
            <Route path="albums" element={<AdminAlbumsPage />} />

            {/* 관리자 음반 등록: /admin/albums/new */}
            <Route path="albums/new" element={<AlbumFormPage />} />

            {/* 관리자 음반 수정: /admin/albums/음반번호/edit */}
            <Route path="albums/:id/edit" element={<AlbumFormPage />} />

            {/* 관리자 추천 설정: /admin/recommendations */}
            <Route path="recommendations" element={<AdminRecommendationsPage />} />
          </Route>
        </Routes>
      <Footer />
    </>
  );
}
