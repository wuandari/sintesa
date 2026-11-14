import { randomInt } from 'node:crypto';
import { query, queryOne, UUID_RE } from './db.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa huruf/angka yang mirip (0 O 1 I)
const CODE_PREFIX = 'KELAS-';

export function generateCode() {
  let s = '';
  for (let i = 0; i < 5; i += 1) s += CODE_CHARS[randomInt(CODE_CHARS.length)];
  return CODE_PREFIX + s;
}

export function normalizeCode(input) {
  const raw = String(input || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!raw) return '';
  return raw.startsWith(CODE_PREFIX) ? raw : CODE_PREFIX + raw;
}

export function validateClass(body) {
  const name = String(body?.name || '').trim().replace(/\s+/g, ' ');
  const description = String(body?.description || '').trim();
  if (name.length < 2 || name.length > 80) return { error: 'Nama kelas harus 2–80 karakter' };
  if (description.length > 300) return { error: 'Deskripsi maksimal 300 karakter' };
  return { value: { name, description: description || null } };
}

export async function createClass(teacherId, { name, description }) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await queryOne(
        `INSERT INTO classes (name, description, code, teacher_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, generateCode(), teacherId]
      );
    } catch (err) {
      if (err.code !== '23505') throw err; // 23505 = kode bentrok, coba kode lain
    }
  }
  throw new Error('Gagal membuat kode kelas unik, coba lagi');
}

export async function joinClass(studentId, codeInput) {
  const code = normalizeCode(codeInput);
  if (!code) return { error: 'Masukkan kode kelas', status: 400 };
  const cls = await queryOne('SELECT id, name, code FROM classes WHERE code = $1', [code]);
  if (!cls) return { error: 'Kode kelas tidak ditemukan', status: 404 };
  const inserted = await queryOne(
    `INSERT INTO class_members (class_id, student_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING RETURNING class_id`,
    [cls.id, studentId]
  );
  return { class: cls, already: !inserted };
}

export function classesForTeacher(teacherId) {
  return query(
    `SELECT c.id, c.name, c.description, c.code, c.created_at,
            (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id)::int AS student_count,
            (SELECT COUNT(*) FROM class_missions cm WHERE cm.class_id = c.id)::int AS mission_count
       FROM classes c WHERE c.teacher_id = $1 ORDER BY c.created_at DESC`,
    [teacherId]
  );
}

export function classesForStudent(studentId) {
  return query(
    `SELECT c.id, c.name, c.code, m.joined_at
       FROM class_members m JOIN classes c ON c.id = m.class_id
      WHERE m.student_id = $1 ORDER BY m.joined_at DESC`,
    [studentId]
  );
}

export async function getClassForTeacher(classId, teacherId) {
  if (!UUID_RE.test(String(classId))) return null;
  return queryOne('SELECT * FROM classes WHERE id = $1 AND teacher_id = $2', [classId, teacherId]);
}

export function classStudents(classId) {
  return query(
    `SELECT u.id, u.name, u.email, m.joined_at,
            GREATEST(COALESCE((SELECT SUM(amount) FROM xp_events e WHERE e.user_id = u.id), 0), 0)::int AS xp
       FROM class_members m JOIN users u ON u.id = m.student_id
      WHERE m.class_id = $1 ORDER BY u.name`,
    [classId]
  );
}

export async function teacherSummary(teacherId) {
  const row = await queryOne(
    `SELECT (SELECT COUNT(*) FROM classes WHERE teacher_id = $1)::int AS classes,
            (SELECT COUNT(DISTINCT m.student_id) FROM class_members m
               JOIN classes c ON c.id = m.class_id WHERE c.teacher_id = $1)::int AS students`,
    [teacherId]
  );
  return row;
}
