import { Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  getAccessToken,
  getCurrentUser,
  logout,
} from '../features/auth/api';


//메인화면 컴포넌트
import HomePage from '../features/home/HomePage';

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


// 장바구니와 주문 화면
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/orders/CheckoutPage';
import OrderCompletePage from '../features/orders/OrderCompletePage';
import OrdersPage from '../features/orders/OrderPage';
import OrderDetailPage from '../features/orders/OrderDetailPage';

// 장바구니와 주문 화면 공통 스타일
import '../features/cart/commerce.css';

// 일반 사용자 음반 화면
import AlbumList from '../features/albums/AlbumList';
import AlbumDetail from '../features/albums/AlbumDetail';

// 취향 추천 화면
import RecommendationsPage from '../features/recommendations/RecommendationsPage';

// 찜한 음반과 LP·CD 입문 안내 화면
import GuidePage from '../features/guide/GuidePage';  


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
          <Route path="/" element={<HomePage currentUser={currentUser} authLoading={authLoading} />} />
          <Route path="/login" element={<AuthPage key="login" onLogin={loadCurrentUser} />} />
          <Route path="/signup" element={<AuthPage key="signup" signup />} />

          <Route path="/mypage" element={ <MyPage currentUser={currentUser} authLoading={authLoading} authError={authError} />}/>
          <Route path="/mypage/reviews" element={ <MyPage showReviews currentUser={currentUser} authLoading={authLoading} authError={authError} /> }/>

          {/* [추가] 마이페이지 내 찜한 음반 라우트 */}
          <Route path="/mypage/wishlist" element={<MyPage showWishlist currentUser={currentUser} authLoading={authLoading} authError={authError} />}/>

          {/* 취향 추천 */}
          <Route path="/recommendations" element={<RecommendationsPage />} />

          {/* 관리자 공통 틀 */}
          <Route path="/admin" element={
              <AdminLayout currentUser={currentUser} authLoading={authLoading} authError={authError} />
            }>
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
            {/* 장바구니 */}
            <Route path="/cart" element={<CartPage />} />

            {/* 주문서 */}
            <Route path="/orders/new" element={<CheckoutPage />} />

            {/* 주문 완료 */}
            <Route path="/orders/complete/:orderId" element={<OrderCompletePage />}/>

            {/* 내 주문 목록 */}
            <Route path="/orders" element={<OrdersPage />} />

            {/* 내 주문 상세 */}
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />

            {/* 음반 목록 */}
            <Route path="/albums" element={<AlbumList />} />

            {/* 음반 상세 */}
            <Route path="/albums/:albumId" element={<AlbumDetail currentUser={currentUser} />} />

            {/* 예전 찜 목록 주소는 마이페이지 찜 목록으로 이동 */}
            <Route path="/wishlist" element={<Navigate to="/mypage/wishlist" replace />} />

            {/* LP·CD 입문 안내 */}
            <Route path="/guide" element={<GuidePage />} />
        </Routes>
      <Footer />
    </>
  );
}
