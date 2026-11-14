// Aturan level dan badge. Murni perhitungan, tanpa akses database.

export const LEVELS = [
  { level: 1, name: 'Penjelajah Baru', min: 0, icon: '🌱' },
  { level: 2, name: 'Petualang Sintesa', min: 500, icon: '🚀' },
  { level: 3, name: 'Master Sintesa', min: 2000, icon: '👑' },
];

export const MISSION_XP = 100;
export const TOTAL_MISSIONS = 6;

export function getLevel(xp) {
  const safe = Math.max(0, Math.floor(Number(xp) || 0));
  let current = LEVELS[0];
  for (const l of LEVELS) if (safe >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > current.min) || null;
  const progress = next
    ? Math.min(100, Math.round(((safe - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { ...current, xp: safe, next, remaining: next ? next.min - safe : 0, progress, isMax: !next };
}

export const BADGES = [
  { id: 'langkah-pertama', name: 'Langkah Pertama', icon: '👣', hint: 'Selesaikan 1 misi AR', test: (s) => s.missions >= 1 },
  { id: 'penjelajah-3d', name: 'Penjelajah 3D', icon: '🧊', hint: 'Selesaikan 3 misi AR', test: (s) => s.missions >= 3 },
  { id: 'master-materi', name: 'Master Materi', icon: '🎓', hint: 'Selesaikan semua misi AR', test: (s) => s.missions >= TOTAL_MISSIONS },
  { id: 'pengumpul-tugas', name: 'Pengumpul Tugas', icon: '📥', hint: 'Kumpulkan 1 tugas', test: (s) => s.tasks >= 1 },
  { id: 'pejuang-tugas', name: 'Pejuang Tugas', icon: '🗂️', hint: 'Kumpulkan 3 tugas', test: (s) => s.tasks >= 3 },
  { id: 'bintang-ar', name: 'Bintang AR', icon: '⭐', hint: 'Kumpulkan 500 XP', test: (s) => s.xp >= 500 },
];

// stats: { xp, missions, tasks }
export function computeBadges(stats) {
  return BADGES.map(({ id, name, icon, hint, test }) => ({ id, name, icon, hint, earned: test(stats) }));
}

export const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';
export const initial = (name) => (String(name || '?').trim()[0] || '?').toUpperCase();
