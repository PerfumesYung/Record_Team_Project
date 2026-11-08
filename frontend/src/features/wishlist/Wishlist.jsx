import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeWishlist } from './api';

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

  useEffect(() => {if (isAuthenticated) refresh(); else setLoading(false);}, [isAuthenticated]);

  async function unWish(albumId) {
    try {await removeWishlist(albumId); setAlbums((items) => items.filter((a) => a.id !== albumId))}
    catch (e) {setError(e.message);}
  }

  if (!isAuthenticated) return <p>찜 목록은 로그인 후 이용할 수 있습니다.</p>;
  if (loading) return <p>Loading</p>;
  return <main>
    <h1>찜한 음반</h1>
    {error && <p role="alert">{error}</p>}
    {albums.length === 0 ? <p>찜한 음반이 없습니다.</p> : <ul>
      {albums.map((album) => <li key={album.id}>
        <Link to={`/albums/${album.id}`}>
          <img src={album.image_url || '/images/album-placeholder.png'} alt={`${album.title} 커버`} width="100" />
          <span>{album.title}</span><span>{album.artist}</span>
        </Link>
        {album.stock <= 0 && <span>품절</span>}
        <button onClick={() => unWish(album.id)}>찜 해제</button>
      </li>)}
    </ul>}
  </main>
}
