// Streak harian: bertambah 1 tiap hari (WIB) murid membuka Sintesa, kembali ke 1 bila melewatkan sehari.
import { queryOne } from './db.js';
import { wibDate } from './streakRules.js';

export * from './streakRules.js';

// Mencatat kunjungan hari ini (sekali per hari, aman dipanggil berulang/bersamaan) lalu mengembalikan streak.
export async function visitStreak(userId, now = new Date()) {
  const today = wibDate(now);
  const upd = await queryOne(
    `UPDATE users SET
       streak_count = CASE WHEN streak_last = $2::date - 1 THEN streak_count + 1 ELSE 1 END,
       streak_best  = GREATEST(streak_best, CASE WHEN streak_last = $2::date - 1 THEN streak_count + 1 ELSE 1 END),
       streak_last  = $2::date
     WHERE id = $1 AND streak_last IS DISTINCT FROM $2::date
     RETURNING streak_count, streak_best`,
    [userId, today]
  );
  const row = upd || await queryOne('SELECT streak_count, streak_best FROM users WHERE id = $1', [userId]);
  return { count: row?.streak_count ?? 0, best: row?.streak_best ?? 0 };
}
