// Streak harian: bertambah 1 tiap hari (WIB) murid membuka Sintesa, kembali ke 1 bila melewatkan sehari.

export const TIERS = [
  { min: 50, id: 'biru', color: '#2f7be8', soft: '#e3efff' },
  { min: 30, id: 'ungu', color: '#8b5cf6', soft: '#efe8ff' },
  { min: 10, id: 'oranye', color: '#f97316', soft: '#ffecdc' },
];
const NONE = { min: 0, id: 'abu', color: '#9aa3b2', soft: '#eef0f4' };

export function streakTier(count) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  const tier = TIERS.find((t) => n >= t.min) || NONE;
  const next = [...TIERS].reverse().find((t) => t.min > n) || null;
  return { ...tier, count: n, next, remaining: next ? next.min - n : 0 };
}

// Tanggal kalender WIB (YYYY-MM-DD) untuk sebuah waktu.
export function wibDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// Aturan murni (dipakai tes): dari streak terakhir ke streak hari ini.
export function nextStreak(count, last, today) {
  if (last === today) return count;
  const y = new Date(`${today}T00:00:00Z`);
  y.setUTCDate(y.getUTCDate() - 1);
  return last === y.toISOString().slice(0, 10) ? count + 1 : 1;
}
