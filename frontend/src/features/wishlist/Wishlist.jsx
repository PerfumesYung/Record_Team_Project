import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWishlist, removeWishlist } from '../../utils/api'
import HeartIcon from '../../components/ui/icons/HeartIcon'

export default function Wishlist({ isAuthenticated }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true); setError('')
    try {
      const result = await getWishlist()
      setAlbums((result.items ?? result).filter((album) => !album.hidden))
    } catch (e) {setError(e.message)}
    finally {setLoading(false)}
  }

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    getWishlist()
      .then((result) => {
        if (active) {
          setAlbums((result.items ?? result).filter((album) => !album.hidden))
          setError('')
        }
      })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isAuthenticated])

  async function unWish(albumId) {
    try {await removeWishlist(albumId); setAlbums((items) => items.filter((a) => a.id !== albumId))}
    catch (e) {setError(e.message);}
  }

  return <main className="mx-auto min-h-[50vh] w-full max-w-6xl px-5 py-12 text-[color:var(--color-text)] md:px-8 md:py-16">
    <header className="border-b border-[color:var(--color-border)] pb-8">
      <p className="font-heading text-xs tracking-[0.18em] text-[color:var(--color-text-muted)]">MY COLLECTION / WISHLIST</p>
      <h1 className="font-heading mt-4 text-4xl font-bold md:text-5xl">찜한 음반</h1>
      <p className="mt-4 text-base leading-relaxed text-[color:var(--color-text-muted)]">마음에 담아둔 음반을 다시 만나보세요.</p>
    </header>

    {!isAuthenticated ? (
      <div className="mt-10 border border-[color:var(--color-border)] bg-[var(--color-surface)] p-8">
        <p className="text-base">로그인 후 찜한 음반을 확인할 수 있어요.</p>
        <Link className="mt-5 inline-flex text-sm text-[color:var(--color-accent)] underline underline-offset-4" to="/login">로그인하기 →</Link>
      </div>
    ) : loading ? (
      <p className="mt-10 text-base text-[color:var(--color-text-muted)]" role="status">찜한 음반을 불러오고 있어요.</p>
    ) : error ? (
      <div className="mt-10" role="alert">
        <p className="text-base text-[color:var(--color-text)]">{error}</p>
        <button type="button" className="mt-4 text-sm underline underline-offset-4" onClick={refresh}>다시 시도</button>
      </div>
    ) : albums.length === 0 ? (
      <div className="mt-10 border border-[color:var(--color-border)] bg-[var(--color-surface)] p-8 md:p-10">
        <h2 className="text-xl font-semibold">아직 찜한 음반이 없어요.</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-muted)]">마음에 드는 음반을 찾아 나만의 목록을 만들어보세요.</p>
        <Link className="mt-6 inline-flex border border-[color:var(--color-border)] px-5 py-3 text-sm hover:border-[color:var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]" to="/albums">음반 둘러보기 →</Link>
      </div>
    ) : <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => <li key={album.id} className="border border-[color:var(--color-border)] bg-[var(--color-surface)] p-5">
        <Link className="block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]" to={`/albums/${album.id}`}>
          <img className="aspect-square w-full object-cover" src={album.image_url || '/images/albums/placeholder.svg'} alt={`${album.title} 커버`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/albums/placeholder.svg' }} />
          <h2 className="mt-5 text-lg font-semibold">{album.title}</h2>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{album.artist}</p>
          <p className="mt-3 text-sm font-semibold">{Number(album.price).toLocaleString('ko-KR')}원 {album.stock <= 0 && <span className="ml-2 text-[color:var(--color-text-muted)]">품절</span>}</p>
        </Link>
        <button type="button" className="mt-5 inline-flex items-center gap-2 text-sm text-[color:var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]" onClick={() => unWish(album.id)} aria-label={`${album.title} 찜 해제`}>
          <HeartIcon filled /> 찜 해제
        </button>
      </li>)}
    </ul>}
  </main>
}
