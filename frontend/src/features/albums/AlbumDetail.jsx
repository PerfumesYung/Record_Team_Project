import '../../styles/design-tokens.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AddToCartButton from '../cart/AddToCartButton';
import Reviews from '../reviews/Reviews';


// .env에 설정한 FastAPI 주소를 사용
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function AlbumDetail({ currentUser }) {
  const { albumId } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/api/albums/${albumId}`);
        if (!response.ok) {
          throw new Error('음반 정보를 찾을 수 없습니다.');
        }
        const data = await response.json();
        setAlbum(data);
      } catch (err) {
        console.error('음반 상세 조회 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumDetail();
    }
  }, [albumId]);

  if (loading) {
    return (
      <div className="bg-(--color-background) text-(--color-text-muted) min-h-screen p-6 text-center py-20">
        음반 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="bg-(--color-background) text-(--color-text) min-h-screen p-6 text-center py-20">
        <p className="text-(--color-text-muted) mb-4">{error || '존재하지 않는 음반입니다.'}</p>
        <button
          type="button"
          onClick={() => navigate('/albums')}
          className="px-4 py-2 rounded-lg text-sm bg-(--color-surface) border border-(--color-border) cursor-pointer"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-(--color-background) text-(--color-text) min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/albums')}
          className="text-sm text-(--color-text-muted) hover:text-(--color-text) mb-6 cursor-pointer"
        >
          ← 음반 목록으로 돌아가기
        </button>

        {/* 상단: 음반 커버 및 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-(--color-surface) border border-(--color-border) p-6 rounded-xl">
          <div className="aspect-square w-full bg-(--color-background) rounded-lg overflow-hidden">
            <img
              src={album.image_url || '/images/albums/placeholder.svg'}
              alt={`${album.title} - ${album.artist}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/albums/placeholder.svg';
              }}
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-heading text-xs px-2.5 py-1 rounded bg-(--color-background) border border-(--color-border) text-(--color-text)">
                  {album.format}
                </span>
                <span className="font-heading text-xs px-2.5 py-1 rounded bg-(--color-background) border border-(--color-border) text-(--color-text-muted)">
                  {album.genre}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-bold text-(--color-text)">{album.title}</h1>
              <p className="text-lg text-(--color-text-muted) mt-1">{album.artist}</p>

              <p className="font-heading text-2xl font-bold mt-6" style={{ color: 'var(--color-accent)' }}>
                {Number(album.price).toLocaleString()}원
              </p>

              {/* 재고 상태 안내 */}
              <div className="mt-6 pt-6 border-t border-(--color-border) text-sm">
                <span className="text-(--color-text-muted) mr-3">재고 상태</span>
                {album.stock > 0 ? (
                  <span className="text-(--color-text) font-medium">구매 가능 (잔여 {album.stock}개)</span>
                ) : (
                  <span className="font-bold" style={{ color: 'var(--color-accent)' }}>품절</span>
                )}
              </div>
            </div>

            {/* 장바구니 버튼 */}
            <div className="mt-8 pt-6 border-t border-(--color-border)">
              <AddToCartButton albumId={album.id} stock={album.stock}/>
            </div>
          </div>
        </div>

        {/* 음반 리뷰 */}
        <div className="mt-8 bg-(--color-surface) border border-(--color-border) p-6 rounded-xl">
          <Reviews albumId={album.id} isAuthenticated={Boolean(currentUser)} />
        </div>
      </div>
    </div>
  );
}

export default AlbumDetail;
