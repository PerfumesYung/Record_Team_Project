// 프론트 개발 서버에서 FastAPI로 요청할 때 사용할 주소입니다.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'accessToken';

// 로그인에 성공하면 서버가 보내준 access_token을 저장.
export async function login(email, password) {
  const form = new URLSearchParams();

  form.append('username', email);
  form.append('password', password);

  const response = await fetch(`${API_BASE}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  if (!response.ok) {
    throw new Error('이메일 또는 비밀번호를 확인해 주세요.');
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('로그인 응답에 토큰이 없습니다.');
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

// 다른 API 요청에서 같은 이름으로 토큰을 가져옵니다.
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 로그인한 사용자의 정보를 가져옵니다.
export async function getCurrentUser() {

  const token = getAccessToken();

  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(`${API_BASE}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    throw new Error('로그인이 만료되었거나 유효하지 않습니다.');
  }

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오지 못했습니다.');
  }

  return response.json();
}

// 로그아웃할 하면 토큰 삭제
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}


// 회원가입 정보를 서버에 보냄
export async function signup(username, email, password) {
  const response = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  });

  // 요청 실패시 서버에게 보내줌
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    if (typeof data.detail === 'string') {
      throw new Error(data.detail);
    }

    throw new Error('회원가입에 실패했습니다.');
  }

  return response.json();
}