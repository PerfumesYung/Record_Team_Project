import { useEffect, useState } from 'react';

const TOKEN_KEY = 'accessToken';
export function readToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function saveToken(value) {
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('nakwon-auth-changed'));
}
export function useAuthToken() {
  const [token, setToken] = useState(readToken);
  useEffect(() => {
    const update = () => setToken(readToken());
    window.addEventListener('nakwon-auth-changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('nakwon-auth-changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return token;
}
