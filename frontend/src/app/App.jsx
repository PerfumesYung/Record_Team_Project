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
            {/* /admin */}
            <Route index element={<AdminHomePage />} />

            {/* /admin/orders */}
            <Route path="orders" element={<AdminOrdersPage />} /> 
            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />

            {/* /admin/reviews */}
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
        </Routes>
      <Footer />
    </>
  );
}
