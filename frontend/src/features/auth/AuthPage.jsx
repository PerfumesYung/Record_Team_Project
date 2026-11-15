import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup as signupUser } from './api';
import './AuthPage.css';

export default function AuthPage({ signup = false, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 화면에 표시할 오류 메시지
  const [error, setError] = useState('');

  // 요청 중에 버튼을 여러 번 누르지 못하게 합니다.
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    // 버튼을 눌렀을 때 페이지가 새로고침되는 것을 막습니다.
    event.preventDefault();

    setError('');

    // 폼에 입력된 값을 가져옵니다.
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      setLoading(true);

      if (signup) {
        // 회원가입 화면에서만 이름과 비밀번호 확인 값을 가져옵니다.
        const username = String(formData.get('username') || '').trim();

        const confirmPassword = String(
          formData.get('confirmPassword') || '',
        );

        if (username.length < 2) {
          setError('이름은 공백을 제외하고 2자 이상 입력해 주세요.');
          return;
        }

        if (password !== confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }

        // 회원가입 성공 후 로그인 화면으로 이동합니다.
        await signupUser(username, email, password);

        navigate('/login', {
          state: {
            message: '회원가입이 완료됐어요. 로그인해 주세요.',
          },
        });
      } else {
        // 로그인에 성공하면 api.js에서 토큰을 저장합니다.
        await login(email, password);


        await onLogin();
        
        // 로그인 성공 후 홈 화면으로 이동합니다.
        navigate('/');
      }
    } catch (err) {
      // 서버 오류나 연결 실패를 화면에 표시합니다.
      setError(err.message || '요청을 처리하지 못했습니다.');
    } finally {
      // 성공·실패와 관계없이 요청 중 상태를 해제합니다.
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page__art" aria-label="낙원레코드 소개">

        <p className="auth-page__eyebrow">WELCOME TO NAKWON</p>

        <h1>Your music.<br />Your place.</h1>

        <p className="auth-page__intro">음악이 머무는 나만의 작은 낙원.</p>

          <div className="auth-page__record" aria-hidden="true"> </div>
      </section>

      <section className="auth-page__content" aria-labelledby="auth-title">

        <p className="auth-page__eyebrow">YOUR NEXT FAVORITE RECORD</p>
        <h2 id="auth-title">{signup ? '회원가입' : '다시 만나 반갑습니다'}</h2>
        <p className="auth-page__description">
          {signup ? '낙원레코드와 함께 나만의 음악을 만나보세요.' : '로그인하고 좋아하는 음반을 다시 만나보세요.'}
        </p>
        {!signup && location.state?.message && (
          <p className="auth-page__success" role="status">{location.state.message}</p>
        )}

        <form className="auth-page__form" onSubmit={handleSubmit}>

          {signup && (
            <label htmlFor="auth-username">이름
              <input id="auth-username" name="username" type="text" autoComplete="nickname" minLength={2} maxLength={50} placeholder="이름을 입력해 주세요" required />
            </label>
          )}

          <label htmlFor="auth-email">이메일
            <input id="auth-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="name@example.com" required />
          </label>

          <label htmlFor="auth-password">비밀번호
            <input id="auth-password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} maxLength={64} placeholder={signup ? '8~64자로 입력해 주세요' : '비밀번호를 입력해 주세요'} required />
          </label>

          {signup && (
            <label htmlFor="auth-confirm">비밀번호 확인
              <input id="auth-confirm" name="confirmPassword" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요" required />
            </label>
          )}

          {error && <p className="auth-page__error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? '처리 중...' : signup ? '회원가입' : '로그인'}
            <span aria-hidden="true">→</span>
          </button>

        </form>

        <p className="auth-page__switch">

          {signup ? '이미 회원이신가요?' : '처음 방문하셨나요?'}{' '}
          <Link to={signup ? '/login' : '/signup'}>{signup ? '로그인' : '회원가입'} →</Link>

        </p>
      </section>
    </main>
  );
}
