import bcrypt from 'bcryptjs';
import { query, queryOne } from './db.js';
import { getMission } from './missions.js';

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(body) {
  const name = String(body?.name || '').trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || '');

  if (name.length < 2 || name.length > 80) return { error: 'Nama harus 2–80 karakter' };
  if (!EMAIL_RE.test(email) || email.length > 120) return { error: 'Format email tidak valid' };
  if (password.length < 6) return { error: 'Password minimal 6 karakter' };
  if (password.length > 72) return { error: 'Password maksimal 72 karakter' };
  return { value: { name, email, password } };
}

export async function createUser({ name, email, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  try {
    return await queryOne(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hash, role]
    );
  } catch (err) {
    if (err.code === '23505') {
      const e = new Error('Email sudah terdaftar');
      e.code = 'EMAIL_TAKEN';
      throw e;
    }
    throw err;
  }
}

let dummyHash;

// Mengembalikan data user jika email & password cocok, selain itu null.
// Tetap menghitung bcrypt saat email tidak ditemukan supaya waktu respons tidak membocorkan email terdaftar.
export async function authenticate(emailInput, password) {
  const email = normalizeEmail(emailInput);
  const user = await queryOne(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  dummyHash ??= bcrypt.hashSync('sintesa-dummy', 10);
  const ok = await bcrypt.compare(String(password || ''), user ? user.password_hash : dummyHash);
  if (!user || !ok) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

// Peringkat semua murid berdasarkan total XP. Seri diurutkan dari yang lebih dulu bergabung.
export function leaderboard(limit = 100) {
  return query(
    `SELECT u.id, u.name,
            GREATEST(COALESCE(SUM(e.amount), 0), 0)::int AS xp
       FROM users u
       LEFT JOIN xp_events e ON e.user_id = u.id
      WHERE u.role = 'MURID'
      GROUP BY u.id
      ORDER BY xp DESC, u.created_at ASC
      LIMIT $1`,
    [limit]
  );
}

export async function studentStats(userId) {
  const row = await queryOne(
    `SELECT COALESCE(SUM(amount), 0)::int AS xp,
            COALESCE(SUM(amount) FILTER (WHERE kind = 'MISSION'), 0)::int AS mission_xp,
            COALESCE(SUM(amount) FILTER (WHERE kind IN ('TASK', 'REVISION')), 0)::int AS task_xp,
            COUNT(*) FILTER (WHERE kind = 'MISSION')::int AS missions,
            COUNT(*) FILTER (WHERE kind = 'TASK')::int AS tasks
       FROM xp_events WHERE user_id = $1`,
    [userId]
  );
  return { ...row, xp: Math.max(0, row.xp) };
}

// Riwayat perolehan XP terbaru beserta nama misi/tugas asalnya.
export async function xpHistory(userId, limit = 20) {
  const rows = await query(
    `SELECT e.kind, e.amount, e.ref_id, e.created_at,
            t.title AS task_title, cm.title AS custom_title
       FROM xp_events e
       LEFT JOIN tasks t ON e.kind IN ('TASK', 'REVISION') AND t.id::text = split_part(e.ref_id, ':', 1)
       LEFT JOIN custom_missions cm ON e.kind = 'MISSION' AND e.ref_id = 'c-' || cm.id::text
      WHERE e.user_id = $1
      ORDER BY e.created_at DESC, e.id DESC
      LIMIT $2`,
    [userId, limit]
  );
  return rows.map((r) => ({
    kind: r.kind,
    amount: r.amount,
    at: r.created_at,
    revision: r.kind === 'REVISION' ? Number(String(r.ref_id).split(':')[1]) || null : null,
    title: r.kind === 'MISSION' ? (getMission(r.ref_id)?.title || r.custom_title || r.ref_id) : (r.task_title || ''),
  }));
}

// Data lengkap untuk halaman profil.
export async function profileData(userId) {
  const u = await queryOne(
    `SELECT id, name, email, role, avatar_url, created_at, nis, bio, streak_count, streak_best FROM users WHERE id = $1`,
    [userId]
  );
  if (!u) return null;
  const [classes, work, lib] = await Promise.all([
    query(
      `SELECT c.id, c.name, c.code, g.name AS teacher_name, m.joined_at
         FROM class_members m JOIN classes c ON c.id = m.class_id JOIN users g ON g.id = c.teacher_id
        WHERE m.student_id = $1 ORDER BY m.joined_at DESC`,
      [userId]
    ),
    queryOne(
      `SELECT COUNT(*)::int AS submitted,
              COUNT(*) FILTER (WHERE status = 'GRADED')::int AS graded,
              ROUND(AVG(score) FILTER (WHERE status = 'GRADED'))::int AS avg_score
         FROM submissions WHERE student_id = $1`,
      [userId]
    ),
    queryOne('SELECT COUNT(*)::int AS n FROM library_files WHERE user_id = $1', [userId]),
  ]);
  return { ...u, classes, work, libraryCount: lib?.n ?? 0 };
}

export const MAX_BIO = 200;

export function validateProfile(body) {
  const name = String(body?.name ?? '').trim().replace(/\s+/g, ' ');
  const nis = String(body?.nis ?? '').trim();
  const bio = String(body?.bio ?? '').trim();
  if (name.length < 2 || name.length > 80) return { error: 'Nama harus 2–80 karakter' };
  if (nis && !/^[0-9A-Za-z./-]{3,20}$/.test(nis)) return { error: 'NIS hanya huruf/angka (3–20 karakter)' };
  if (bio.length > MAX_BIO) return { error: `Bio maksimal ${MAX_BIO} karakter` };
  return { value: { name, nis: nis || null, bio: bio || null } };
}
