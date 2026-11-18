// LP·CD 입문 안내 화면 (프론트: features/guide)
// - 고정 콘텐츠라서 API 없이 이 파일 안의 글로만 구성합니다.
// - 공통 헤더·푸터는 팀의 레이아웃이 담당하므로 여기서는 본문만 만듭니다.
// - 화면 주소(라우터)가 팀에서 정해지면 아래 GUIDE_LINKS의 주소만 바꿔 주세요.

const GUIDE_LINKS = {
  lp: '/albums?format=LP', // LP만 보는 음반 목록 (음반 목록 담당자와 주소 확인 필요)
  cd: '/albums?format=CD', // CD만 보는 음반 목록 (음반 목록 담당자와 주소 확인 필요)
  recommendations: '/recommendations', // 취향 추천 화면 (팀 확정)
};

const FIRST_STEPS = [
  '좋아하는 음악 찾기',
  '재생 기기 확인',
  '매체·가격·재고 확인',
  '장바구니 담기',
];

// 장식용 LP 그림 (스크린 리더는 읽지 않도록 aria-hidden)
function LpIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-28 w-28 text-[color:var(--color-text-muted)]"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="60" cy="60" r="16" fill="var(--color-text)" opacity="0.85" />
      <circle cx="60" cy="60" r="3" fill="var(--color-background)" />
    </svg>
  );
}

// 장식용 CD 그림
function DiscIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
      <defs>
        <radialGradient id="guide-disc-shine" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8E8E4" />
          <stop offset="60%" stopColor="#B9BBB5" />
          <stop offset="100%" stopColor="#8C8E88" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#guide-disc-shine)" />
      <circle cx="60" cy="60" r="12" fill="var(--color-background)" />
    </svg>
  );
}

const MEDIA_GUIDES = [
  {
    key: 'lp',
    label: '01 / LONG PLAY',
    title: 'LP records.',
    description:
      '큰 표지와 함께 천천히 감상하는 음반입니다. 턴테이블과 소리를 출력할 장비가 필요하며, 내장 기능에 따라 추가 기기가 달라집니다. 직사광선을 피하고 세워 보관하세요.',
    linkLabel: 'LP 둘러보기',
    href: GUIDE_LINKS.lp,
    Icon: LpIcon,
  },
  {
    key: 'cd',
    label: '02 / COMPACT DISC',
    title: 'Compact discs.',
    description:
      '비교적 간편하게 수집하고 보관할 수 있습니다. CD 재생을 지원하는 기기나 드라이브가 필요합니다. 휴대전화나 드라이브 없는 컴퓨터에서는 바로 재생할 수 없습니다.',
    linkLabel: 'CD 둘러보기',
    href: GUIDE_LINKS.cd,
    Icon: DiscIcon,
  },
];

// 버튼처럼 보이는 링크 공통 모양 (색은 공통 디자인 변수 사용)
const LINK_BUTTON_CLASS =
  'inline-flex items-center gap-2 border border-[color:var(--color-border)] px-5 py-3 text-sm ' +
  'text-[color:var(--color-text)] hover:bg-[var(--color-surface-hover)] ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-[var(--color-accent)]';

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 text-[color:var(--color-text)]">
      <header className="border-b border-[color:var(--color-border)] pb-8">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-text-muted)]">
          NAKWON RECORDS / OUR COLLECTION
        </p>
        <h1 className="font-heading mt-4 text-4xl font-bold md:text-6xl">
          Your first physical record.
        </h1>
        <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
          처음 만나는 LP와 CD, 나에게 맞는 한 장을 고르는 방법.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2" aria-label="LP와 CD 소개">
        {MEDIA_GUIDES.map(({ key, label, title, description, linkLabel, href, Icon }) => (
          <article key={key} className="bg-[var(--color-surface)] p-8">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-text-muted)]">{label}</p>
            <h2 className="font-heading mt-4 text-3xl font-bold md:text-4xl">{title}</h2>
            <div className="mt-8">
              <Icon />
            </div>
            <p className="mt-8 text-sm leading-7 text-[color:var(--color-text-muted)]">
              {description}
            </p>
            <a href={href} className={`${LINK_BUTTON_CLASS} mt-8`}>
              {linkLabel} <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </section>

      <section
        className="mt-6 border border-[color:var(--color-border)] p-8"
        aria-labelledby="guide-first-steps"
      >
        <h2 id="guide-first-steps" className="text-lg font-bold">
          첫 선택 순서
        </h2>
        <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {FIRST_STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              {step}
              {index < FIRST_STEPS.length - 1 && (
                <span aria-hidden="true" className="text-[color:var(--color-text-muted)]">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
          매체는 LP·CD 같은 음반 형태, 장르는 음악의 분류, 재고는 주문할 수 있는 남은 수량입니다.
        </p>
        <a href={GUIDE_LINKS.recommendations} className={`${LINK_BUTTON_CLASS} mt-6`}>
          취향으로 찾아보기 <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
