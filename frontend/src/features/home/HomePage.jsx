import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './HomePage.css';

// 다른 음반 화면과 같은 백엔드 주소를 사용합니다.
const API_BASE =
import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function HomePage() {
const [albums, setAlbums] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
        // 화면을 벗어난 뒤에는 상태를 바꾸지 않도록 확인합니다.
    let active = true;

    async function loadAlbums() {
        try {
            const response = await fetch(
                `${API_BASE}/api/albums?page=1&size=4&sort=latest`
            );

            if (!response.ok) {
                throw new Error('음반을 불러오지 못했어요.');
            }

        const data = await response.json();

            if (active) {
                setAlbums(Array.isArray(data.items) ? data.items : []);
            }
        } catch {
            if (active) {
                setError('음반을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

        loadAlbums();

        return () => {
            active = false;
        };
    }, []);

    return (
        <main className="home-page">
        {/* 홈 화면 상단 */}
        <section className="home-hero">
            <div className="home-hero__copy">
            <p className="home-eyebrow">FOR THE LOVE OF PHYSICAL MUSIC</p>

            <h1 className="home-hero__title">
                YOUR NEXT
                <br />
                <span>RECORD.</span>
            </h1>

            <p className="home-hero__description">
                스트리밍 너머, 손에 남는 음악.
                <br />
                당신의 취향을 채워 줄 LP와 CD를 만나보세요.
            </p>

            <a className="home-button" href="#collection">
                컬렉션 둘러보기 ↗
            </a>

            <p className="home-hero__stamp">DIG DEEP. KEEP IT REAL.</p>
            </div>

            {/* 시안의 앨범 재킷과 LP를 표현하는 장식 */}
            <div className="home-hero__art" aria-hidden="true">
            <p className="home-art__label">ON THE TURNTABLE</p>

            <div className="home-art__record">
                <div className="home-art__record-label" />
            </div>

            <div className="home-art__sleeve">
                <span>EVENING<br />WALK.</span>
                <small>JUNE PARK / STEREO</small>
            </div>

            <p className="home-art__caption">
                Evening Walk <span>· June Park</span>
            </p>
            </div>
        </section>

        <div className="home-strip">
            <span>ANALOG SOUL, DIGITAL EASE.</span>
            <span>LP RECORDS · COMPACT DISCS · NEW FAVORITES</span>
        </div>

        {/* 실제 DB에서 가져온 음반 */}
        <section className="home-collection" id="collection">
            <div className="home-collection__heading">
            <div>
                <p className="home-eyebrow">NAKWON RECORDS / COLLECTION</p>
                <h2 className="font-heading">THE COLLECTION</h2>
            </div>

            <Link to="/albums" className="home-collection__more"> 전체 음반 보기 ↗ </Link>
            </div>

            {loading && <p className="home-message">음반을 불러오고 있어요.</p>}

            {!loading && error && (
            <p className="home-message" role="alert">{error}</p>
            )}

            {!loading && !error && albums.length === 0 && (
            <p className="home-message">등록된 음반이 아직 없어요.</p>
            )}

            {!loading && !error && albums.length > 0 && (
            <div className="home-albums">
                {albums.map((album) => (
                <Link key={album.id} to={`/albums/${album.id}`} className="home-album">
                    <img
                    src={album.image_url || '/images/albums/placeholder.svg'}
                    alt={`${album.title} 음반 표지`}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/images/albums/placeholder.svg';
                    }}
                    />

                    <p className="home-album__format"> {album.format} / {album.genre}</p>
                    <h3>{album.title}</h3>
                    <p className="home-album__artist">{album.artist}</p>
                    <p className="home-album__price"> {Number(album.price).toLocaleString('ko-KR')}원 </p>
                </Link>
                ))}
            </div>
            )}
        </section>
        </main>
    );
}