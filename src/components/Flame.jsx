// Ikon api streak. Warna mengikuti tingkatan (abu < 10 hari, oranye 10, ungu 30, biru 50).
import { streakTier } from '@/lib/streakRules.js';

const SHADES = {
  abu: ['#c2c8d2', '#9aa3b2', '#e7eaf0'],
  oranye: ['#ffb347', '#f97316', '#fff0cf'],
  ungu: ['#c4a8ff', '#8b5cf6', '#f1e9ff'],
  biru: ['#7cc4ff', '#2f7be8', '#e6f3ff'],
};

export default function Flame({ count = 0, size = 28, className = '' }) {
  const t = streakTier(count);
  const [a, b, c] = SHADES[t.id];
  const gid = `fl-${t.id}-${size}`;
  return (
    <svg className={`flame ${className}`} width={size} height={size * 1.2} viewBox="0 0 48 58" role="img" aria-label={`Streak ${t.count}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={b} />
          <stop offset="1" stopColor={a} />
        </linearGradient>
      </defs>
      <path d="M25 2c1 9 10 14 14 24 4 10-1 21-9 26-3 2-6 3-6 3s-3-1-6-3C9 47 5 36 10 27c2-4 5-6 6-11 3 3 4 6 5 9 3-6 3-14 4-23z" fill={`url(#${gid})`} />
      <path d="M24 29c1 5 8 8 8 16 0 6-4 10-8 10s-8-4-8-10c0-5 3-7 5-10 1 2 2 3 3 4 1-3 0-6 0-10z" fill={c} opacity=".92" />
    </svg>
  );
}
