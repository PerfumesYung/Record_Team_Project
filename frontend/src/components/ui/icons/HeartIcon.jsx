export default function HeartIcon({ size = 20, className = '', filled = false }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  )
}