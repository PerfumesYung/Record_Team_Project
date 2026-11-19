import '../../styles/design-tokens.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenreFilter from './GenreFilter';

const FORMATS = [
  { label: '전체 포맷', value: '' },
  { label: 'LP', value: 'LP' },
  { label: 'CD', value: 'CD' },
];

const SORT_OPTIONS = [
  { label: '최신 등록순', value: 'latest' },
  { label: '낮은 가격순', value: 'price_asc' },
  { label: '높은 가격순', value: 'price_desc' },
  { label: '제목순', value: 'title' },
];

function AlbumList() {
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const size = 12;

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [sort, setSort] = useState('latest');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        // [API 명세 v0.3 일치] keyword, format, genre, sort, page, size 쿼리 파라미터 조립
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (selectedFormat) params.append('format', selectedFormat);
        if (selectedGenre) params.append('genre', selectedGenre);
        if (sort) params.append('sort', sort);
        params.append('page', String(page));
        params.append('size', String(size));

        const response = await fetch(`/api/albums?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        setAlbums(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (error) {
        console.error('음반 목록 조회 실패:', error);
        setAlbums([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [keyword, selectedFormat, selectedGenre, sort, page]);

  // 필터나 검색어, 정렬 기준이 바뀔 때는 항상 1페이지부터 다시 조회
  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  const handleSelectFormat = (format) => {
    setSelectedFormat(format);
    setPage(1);
  };

  const handleSelectSort = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim().slice(0, 100)); // 명세 기준 최대 100자 제한
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setKeyword('');
    setSelectedGenre('');
    setSelectedFormat('');
    setSort('latest');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="bg-(--color-background) text-(--color-text) min-h-screen p-6">
      <header className="mb-6 border-b border-(--color-border) pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">ALBUMS 음반 목록</h1>
          <p className="text-(--color-text-muted) text-sm mt-1">
            낙원레코드의 엄선된 LP와 CD 입문용 라인업을 만나보세요. (총 {total}장)
          </p>
        </div>

        {/* 검색 UI (keyword) */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            maxLength={100}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목 또는 아티스트 검색..."
            className="px-4 py-2 rounded-lg text-sm bg-(--color-surface) border border-(--color-border) text-(--color-text) focus:outline-none focus:border-(--color-accent) w-full md:w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-bold text-(--color-text) cursor-pointer shrink-0"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            검색
          </button>
          {(keyword || selectedGenre || selectedFormat || sort !== 'latest') && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg text-sm bg-(--color-surface) border border-(--color-border) text-(--color-text-muted) hover:text-(--color-text) cursor-pointer shrink-0"
            >
              초기화
            </button>
          )}
        </form>
      </header>

      {/* 포맷(LP/CD), 정렬 기준 및 장르 필터 영역 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {FORMATS.map((item) => {
              const isSelected = selectedFormat === item.value;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectFormat(item.value)}
                  className="font-heading px-3.5 py-1.5 rounded-md text-xs border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-text)' : 'var(--color-surface)',
                    borderColor: isSelected ? 'var(--color-text)' : 'var(--color-border)',
                    color: isSelected ? 'var(--color-background)' : 'var(--color-text-muted)',
                    fontWeight: isSelected ? '700' : '400',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* 정렬 UI (sort) */}
          <select
            value={sort}
            onChange={handleSelectSort}
            aria-label="음반 정렬 기준"
            className="font-heading px-3 py-1.5 rounded-md text-xs bg-(--color-surface) border border-(--color-border) text-(--color-text) focus:outline-none focus:border-(--color-accent) cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <GenreFilter currentGenre={selectedGenre} onSelectGenre={handleSelectGenre} />
      </div>

      {/* 로딩 및 음반 카드 그리드 */}
      {loading ? (
        <div className="text-center py-10 text-(--color-text-muted)">음반 데이터를 조율하고 있습니다...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {albums.length > 0 ? (
              albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => navigate(`/albums/${album.id}`)}
                  className="bg-(--color-surface) border border-(--color-border) p-4 rounded-lg transition-colors hover:bg-(--color-surface-hover) cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square w-full bg-(--color-background) rounded-md overflow-hidden mb-4 relative">
                      <img
                        src={album.image_url || '/images/albums/placeholder.svg'}
                        alt={`${album.title} - ${album.artist} 음반 표지`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/albums/placeholder.svg';
                        }}
                      />
                      {album.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-xs font-bold px-3 py-1 rounded bg-(--color-surface) border border-(--color-border) text-(--color-text-muted)">
                            품절
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-lg font-semibold truncate text-(--color-text)">{album.title}</h3>
                    <p className="text-(--color-text-muted) text-sm truncate mt-1">{album.artist}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-(--color-border) flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <span className="font-heading text-xs px-2 py-0.5 rounded bg-(--color-background) border border-(--color-border) text-(--color-text-muted)">
                        {album.format}
                      </span>
                      <span className="font-heading text-xs px-2 py-0.5 rounded bg-(--color-background) border border-(--color-border) text-(--color-text-muted)">
                        {album.genre}
                      </span>
                    </div>
                    <span className="font-heading text-sm font-bold text-(--color-text)">
                      {Number(album.price).toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 border border-dashed border-(--color-border) rounded-lg text-(--color-text-muted)">
                조건에 일치하는 음반이 없습니다.
              </div>
            )}
          </div>

          {/* 페이지네이션 버튼 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded border border-(--color-border) bg-(--color-surface) text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="font-heading text-sm px-3 text-(--color-text-muted)">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded border border-(--color-border) bg-(--color-surface) text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AlbumList;
