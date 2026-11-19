// 추천 결과 카드 한 장 (음반 정보 + 추천 이유)
// 공통 음반 카드(components/ui)가 생기면 그 카드로 바꾸고 추천 이유만 아래에 붙이면 됩니다.
// 주의: 추천 응답은 음반 번호가 album_id 입니다. (공통 음반 카드는 id)
import { Link } from 'react-router-dom';

const PLACEHOLDER_COVER = '/images/albums/placeholder.svg';

function formatPrice(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

export default function RecommendationCard({ album }) {
  const inStock = album.stock > 0;

  return (
    <li className="flex flex-col">
      <Link to={`/albums/${album.album_id}`} className="flex h-full flex-col text-inherit no-underline" >
        <div className="bg-[var(--color-surface)] p-4">
          <p className="text-[10px] tracking-[0.15em] text-[color:var(--color-text-muted)]">
            {album.format} / {album.genre}
          </p>
          <img
            src={album.image_url || PLACEHOLDER_COVER}
            alt={`${album.title} 표지`}
            className="mt-4 aspect-square w-full object-cover"
            onError={(event) => {
              // 이미지가 깨졌을 때 대체 표지로 바꿉니다. (대체 표지도 실패하면 더 시도하지 않습니다.)
              if (!event.currentTarget.src.endsWith(PLACEHOLDER_COVER)) {
                event.currentTarget.src = PLACEHOLDER_COVER;
              }
            }}
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">{album.title}</h3>
        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{album.artist}</p>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm font-semibold">{formatPrice(album.price)}</span>
          <span className="text-[10px] tracking-[0.1em] text-[color:var(--color-text-muted)]">
            {inStock ? 'IN STOCK' : 'SOLD OUT'}
          </span>
        </div>

        <p className="mt-3 border-t border-[color:var(--color-border)] pt-3 text-xs leading-5 text-[color:var(--color-text-muted)]">
          {album.reason}
        </p>
      </Link>
    </li>
  );
}
