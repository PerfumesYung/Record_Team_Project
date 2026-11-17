import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/apiClient';
import { saveToken } from '../../lib/useAuthToken';
import { Message, PageHeading } from './CommerceUI';

// 로그인 테스트
export default function AuthRequired({ title = '나의 컬렉션' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error(typeof data.detail === 'string' ? data.detail : '이메일과 비밀번호를 확인해 주세요.');
      await apiRequest('/api/users/me', { token: data.access_token });
      saveToken(data.access_token);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return <main className="commerce-page">
    <PageHeading eyebrow="MEMBERS ONLY" title={title} description="로그인 후 내 장바구니와 주문 내역을 확인할 수 있습니다." />
    <div className="commerce-auth-gate">
      <div className="commerce-auth-icon" aria-hidden="true">↗</div>
      <h2>음악이 쌓이는 공간</h2>
      <p>로그인하면 담아둔 LP와 CD, 주문 기록을 이어서 볼 수 있습니다.</p>
      {import.meta.env.DEV ? <form onSubmit={handleLogin} className="commerce-dev-login">
        <span>로그인 테스트</span>
        <label>이메일 <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" /></label>
        <label>비밀번호 <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <Message>{error}</Message>}
        <button type="submit" className="commerce-primary" disabled={busy}>{busy ? '로그인 확인 중...' : '테스트 로그인'}</button>

      </form> : <p>로그인 테스트</p>}
      <Link to="/" className="commerce-text-link">홈으로 돌아가기 ↗</Link>
    </div>
  </main>;
}
