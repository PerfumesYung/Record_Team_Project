import React from 'react';

// [API 명세 v0.3 반영] 시작 장르 목록 확정 기준
const GENRES = ['전체', 'Jazz', 'Pop', 'Rock', 'Indie', 'R&B', 'Classical'];

function GenreFilter({ currentGenre, onSelectGenre }) {
  return (
    <div className="flex flex-wrap gap-3 my-4">
      {GENRES.map((genre) => {
        const isSelected = currentGenre === genre || (genre === '전체' && !currentGenre);

        return (
          <button
            key={genre}
            type="button"
            onClick={() => onSelectGenre(genre === '전체' ? '' : genre)}
            className="font-heading px-4 py-2 rounded-full text-sm border transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
              borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
              color: 'var(--color-text)',
              fontWeight: isSelected ? '700' : '400',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}

export default GenreFilter;
