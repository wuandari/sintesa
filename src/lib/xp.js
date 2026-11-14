// Aturan XP tugas (murni, tanpa database).
export const REVISION_PENALTY = 0.2; // tiap revisi memotong 20% dari poin tugas
export const MIN_KEEP = 0.2;         // sisa XP tugas tidak pernah di bawah 20% poin

// XP yang dimiliki murid dari satu tugas setelah `revisions` kali unggah ulang.
export function taskXp(points, revisions) {
  const p = Math.max(0, Math.floor(Number(points) || 0));
  const r = Math.max(0, Math.floor(Number(revisions) || 0));
  const floor = Math.round(p * MIN_KEEP);
  return Math.max(floor, Math.round(p - p * REVISION_PENALTY * r));
}

// Selisih XP (<= 0) yang dikenakan karena revisi ke-n (n >= 1).
export function revisionDelta(points, n) {
  return taskXp(points, n) - taskXp(points, n - 1);
}
