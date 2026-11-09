export default function ProfileIcon({ size = 28, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="32" fill="#30302e" />
      <circle cx="32" cy="24" r="10" fill="#bcbcc0" />
      <path d="M13 52c2-10 9-15 19-15s17 5 19 15" fill="#bcbcc0" />
    </svg>
  );
}
