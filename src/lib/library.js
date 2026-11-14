import { query, queryOne, UUID_RE } from './db.js';
import { extOf } from './storage.js';

export const TYPES = {
  semua: null,
  dokumen: ['doc', 'docx', 'txt', 'md', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'json', 'sql', 'html', 'css', 'js', 'py', 'java', 'c', 'cpp', 'php'],
  gambar: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  pdf: ['pdf'],
  video: ['mp4', 'mp3'],
  arsip: ['zip', 'rar', '7z', 'glb', 'gltf'],
  lainnya: [],
};
const SORTS_F = { terbaru: 'f.created_at DESC', terlama: 'f.created_at ASC', nama: 'lower(f.name) ASC', ukuran: 'f.size DESC' };
const SORTS = { terbaru: 'created_at DESC', terlama: 'created_at ASC', nama: 'lower(name) ASC', ukuran: 'size DESC' };

export function typeOf(name) {
  const e = extOf(name);
  for (const [k, list] of Object.entries(TYPES)) if (list && list.includes(e)) return k;
  return 'lainnya';
}

export async function listLibrary(userId, { q = '', type = 'semua', sort = 'terbaru' } = {}) {
  const rows = await query(
    `SELECT * FROM library_files WHERE user_id = $1 AND ($2 = '' OR name ILIKE '%' || $2 || '%') ORDER BY ${SORTS[sort] || SORTS.terbaru}`,
    [userId, String(q).slice(0, 60).replace(/[%_\\]/g, '')]
  );
  const withType = rows.map((r) => ({ ...r, type: typeOf(r.name) }));
  return type && type !== 'semua' ? withType.filter((r) => r.type === type) : withType;
}

export const addLibraryFile = (userId, f, note = null) =>
  queryOne('INSERT INTO library_files (user_id, name, url, size, mime, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, f.name, f.url, f.size, f.mime, note]);

export async function libraryStats(userId) {
  const r = await queryOne(
    `SELECT (SELECT COUNT(*) FROM submission_files sf JOIN submissions s ON s.id = sf.submission_id WHERE s.student_id = $1)::int AS task_files`, [userId]);
  return r;
}

export async function deleteLibraryFile(userId, id) {
  if (!UUID_RE.test(String(id))) return null;
  return queryOne('DELETE FROM library_files WHERE id = $1 AND user_id = $2 RETURNING url', [id, userId]);
}

// Arsip siswa-siswa di kelas milik guru (hanya dibaca).
export async function studentArchives(teacherId, { q = '', type = 'semua', sort = 'terbaru' } = {}) {
  const rows = await query(
    `SELECT f.*, u.name AS owner_name FROM library_files f
       JOIN users u ON u.id = f.user_id
      WHERE f.user_id IN (SELECT m.student_id FROM class_members m JOIN classes c ON c.id = m.class_id WHERE c.teacher_id = $1)
        AND ($2 = '' OR f.name ILIKE '%' || $2 || '%') ORDER BY ${SORTS_F[sort] || SORTS_F.terbaru}`,
    [teacherId, String(q).slice(0, 60).replace(/[%_\\]/g, '')]
  );
  const withType = rows.map((r) => ({ ...r, type: typeOf(r.name) }));
  return type && type !== 'semua' ? withType.filter((r) => r.type === type) : withType;
}
