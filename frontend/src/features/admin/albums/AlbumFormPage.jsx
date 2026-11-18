// 관리자 음반 등록·수정 폼
//  - 등록: /admin/albums/new  (API #23)
//  - 수정: /admin/albums/:id/edit  (API #24)
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createAdminAlbum, findAdminAlbum, updateAdminAlbum } from './api.js';

const GENRES = ['Jazz', 'Pop', 'Rock', 'Indie', 'R&B', 'Classical'];
const FORMATS = ['LP', 'CD'];
const MAX_UNSIGNED = 4294967295; // DB 숫자 최대값
const EMPTY_FORM = {
  title: '',
  artist: '',
  price: '',
  stock: '',
  format: 'LP',
  genre: 'Jazz',
  hidden: 'false',
  image_url: '',
};

const inputClass =
  'mt-2 w-full border border-[color:var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-text)]';

// 서버에서 받은 음반 → 폼 입력값 (입력칸은 모두 문자열로 다룹니다)
function toForm(album) {
  return {
    title: album.title,
    artist: album.artist,
    price: String(album.price),
    stock: String(album.stock),
    format: album.format,
    genre: album.genre,
    hidden: album.hidden ? 'true' : 'false',
    image_url: album.image_url ?? '',
  };
}

// 서버 규칙과 같은 기준으로 먼저 검사합니다.
// 통과하면 { data: 서버에 보낼 값 }, 아니면 { error: 오류 문장 }을 돌려줍니다.
function validate(form) {
  const title = form.title.trim();
  const artist = form.artist.trim();
  const imageUrl = form.image_url.trim();
  if (!title || title.length > 120) return { error: '음반명은 1~120자로 입력해 주세요.' };
  if (!artist || artist.length > 100) return { error: '아티스트는 1~100자로 입력해 주세요.' };
  for (const [key, label] of [['price', '가격'], ['stock', '재고']]) {
    const text = form[key].trim();
    if (!/^\d+$/.test(text) || Number(text) > MAX_UNSIGNED) {
      return { error: `${label} 값은 0 이상의 정수로 입력해 주세요.` };
    }
  }
  if (imageUrl.length > 2048) return { error: '이미지 경로는 2048자 이하로 입력해 주세요.' };
  return {
    data: {
      title,
      artist,
      price: Number(form.price),
      stock: Number(form.stock),
      format: form.format,
      genre: form.genre,
      hidden: form.hidden === 'true',
      image_url: imageUrl === '' ? null : imageUrl, // 비우면 이미지 없음(null)
    },
  };
}

export default function AlbumFormPage() {
  const { id } = useParams(); // 수정 주소에만 id가 있습니다
  const albumId = id ? Number(id) : null;
  const isEdit = albumId !== null;
  const validId = Number.isInteger(albumId) && albumId >= 1;
  const navigate = useNavigate();
  const location = useLocation();
  const passedAlbum = location.state?.album; // 목록의 '수정' 버튼이 넘겨 준 음반

  const [form, setForm] = useState(() =>
    isEdit && passedAlbum?.id === albumId ? toForm(passedAlbum) : EMPTY_FORM,
  );
  const [fetchedState, setLoadState] = useState(
    isEdit && passedAlbum?.id !== albumId ? 'loading' : 'ready',
  );
  // 주소의 번호가 올바르지 않으면 서버에 묻지 않고 바로 '없음'으로 보여줍니다.
  const loadState = isEdit && !validId ? 'missing' : fetchedState;
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // 목록에서 넘어오지 않고 주소로 바로 들어온 수정 화면은 서버에서 음반 정보를 찾아옵니다.
  useEffect(() => {
    if (!isEdit || passedAlbum?.id === albumId) return undefined;
    if (!validId) return undefined;
    const controller = new AbortController();
    findAdminAlbum(albumId, controller.signal)
      .then((album) => {
        if (!album) {
          setLoadState('missing');
          return;
        }
        setForm(toForm(album));
        setLoadState('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoadState('error');
      });
    return () => controller.abort();
  }, [isEdit, albumId, passedAlbum, validId]);

  function change(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return; // 두 번 눌러도 한 번만 보냅니다
    const result = validate(form);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (isEdit) await updateAdminAlbum(albumId, result.data);
      else await createAdminAlbum(result.data);
      navigate('/admin/albums'); // 저장되면 목록으로 이동
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const heading = isEdit ? '음반 수정' : '새 음반 등록';

  if (loadState === 'loading') {
    return <p className="text-sm text-[color:var(--color-text-muted)]">불러오는 중이에요…</p>;
  }
  if (loadState === 'missing' || loadState === 'error') {
    return (
      <section className="text-[color:var(--color-text)]">
        <h2 className="font-heading text-3xl font-bold">{heading}</h2>
        <p role="alert" className="mt-6 text-sm">
          {loadState === 'missing' ? '음반을 찾을 수 없어요.' : error}
        </p>
        <Link to="/admin/albums" className="mt-4 inline-block text-sm underline">
          목록으로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="text-[color:var(--color-text)]">
      <h2 className="font-heading text-3xl font-bold">{heading}</h2>
      <form onSubmit={submit} className="mt-6 max-w-3xl bg-[var(--color-surface)] p-8" noValidate>
        <label className="block text-xs font-bold">
          음반명
          <input name="title" value={form.title} onChange={change} maxLength={120} className={inputClass} />
        </label>
        <label className="mt-6 block text-xs font-bold">
          아티스트
          <input name="artist" value={form.artist} onChange={change} maxLength={100} className={inputClass} />
        </label>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block text-xs font-bold">
            가격
            <input name="price" value={form.price} onChange={change} inputMode="numeric" className={inputClass} />
          </label>
          <label className="block text-xs font-bold">
            재고
            <input name="stock" value={form.stock} onChange={change} inputMode="numeric" className={inputClass} />
          </label>
          <label className="block text-xs font-bold">
            매체
            <select name="format" value={form.format} onChange={change} className={inputClass}>
              {FORMATS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold">
            장르
            <select name="genre" value={form.genre} onChange={change} className={inputClass}>
              {GENRES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-6 block text-xs font-bold">
          공개 상태
          <select name="hidden" value={form.hidden} onChange={change} className={inputClass}>
            <option value="false">공개</option>
            <option value="true">비공개</option>
          </select>
        </label>
        <label className="mt-6 block text-xs font-bold">
          대표 이미지 경로 또는 URL
          <input
            name="image_url"
            value={form.image_url}
            onChange={change}
            placeholder="/images/albums/파일명"
            className={inputClass}
          />
        </label>
        <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
          대표 이미지 한 장의 경로 또는 URL을 사용합니다. 파일 업로드는 기본 범위에 포함하지 않습니다.
        </p>

        {error && (
          <p role="alert" className="mt-6 text-sm text-[color:var(--color-accent)]">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-[color:var(--color-background)] disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
          <Link
            to="/admin/albums"
            className="border border-[color:var(--color-border)] px-6 py-3 text-sm"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}