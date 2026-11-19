import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '../../lib/useAuthToken';
import { addCartItem } from './api';

export default function AddToCartButton({ albumId, stock = 0, quantity = 1 }) {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleClick() {
    if (!token) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    setBusy(true); setMessage('');
    try {
      await addCartItem(token, albumId, quantity);
      setMessage('장바구니에 담았습니다.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <div className="commerce-add-item">
    <button type="button" className="commerce-primary" disabled={busy || stock < 1} onClick={handleClick}>
      {stock < 1 ? '품절' : busy ? '담는 중...' : '장바구니에 담기 ↗'}
    </button>
    {message && <span role="status">{message}</span>}
  </div>;
}
