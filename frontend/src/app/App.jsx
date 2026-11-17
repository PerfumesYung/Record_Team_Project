import { Link, Route, Routes } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../features/cart/commerce.css';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/orders/CheckoutPage';
import OrderCompletePage from '../features/orders/OrderCompletePage';
import OrdersPage from '../features/orders/OrderPage';
import OrderDetailPage from '../features/orders/OrderDetailPage';



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

export default function App() {
  return <>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders/new" element={<CheckoutPage />} />
      <Route path="/orders/complete/:orderId" element={<OrderCompletePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    </Routes>
    <Footer />
  </>;
}
