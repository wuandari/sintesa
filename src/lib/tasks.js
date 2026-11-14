import { getPool, query, queryOne, UUID_RE } from './db.js';
import { taskXp, revisionDelta } from './xp.js';

export function validateTask(body) {
  const title = String(body?.title ?? '').trim().replace(/\s+/g, ' ');
  const description = String(body?.description ?? '').trim();
  const points = Number(body?.points);
  const classId = String(body?.class_id ?? '');
  let due = null;
  if (body?.due_at) {
    due = new Date(body.due_at);
    if (Number.isNaN(due.getTime())) return { error: 'Tenggat tidak valid' };
  }
  if (!UUID_RE.test(classId)) return { error: 'Pilih kelas tujuan' };
  if (title.length < 2 || title.length > 120) return { error: 'Judul tugas 2–120 karakter' };
  if (description.length > 2000) return { error: 'Deskripsi maksimal 2000 karakter' };
  if (!Number.isInteger(points) || points < 1 || points > 10000) return { error: 'Poin XP harus bilangan bulat 1–10.000' };
  return { value: { title, description: description || null, points, classId, due } };
}

export async function createTask(teacherId, v, attachments = []) {
  const cls = await queryOne('SELECT id FROM classes WHERE id = $1 AND teacher_id = $2', [v.classId, teacherId]);
  if (!cls) return { error: 'Kelas tidak ditemukan', status: 404 };
  const task = await queryOne(
    `INSERT INTO tasks (class_id, teacher_id, title, description, points, due_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [v.classId, teacherId, v.title, v.description, v.points, v.due]
  );
  for (const a of attachments) {
    await query('INSERT INTO task_attachments (task_id, name, url, size, mime) VALUES ($1, $2, $3, $4, $5)',
      [task.id, a.name, a.url, a.size, a.mime]);
  }
  return { task };
}

export function tasksForTeacher(teacherId) {
  return query(
    `SELECT t.*, c.name AS class_name,
            (SELECT COUNT(*) FROM class_members m WHERE m.class_id = t.class_id)::int AS students,
            (SELECT COUNT(*) FROM submissions s WHERE s.task_id = t.id)::int AS submitted,
            (SELECT COUNT(*) FROM submissions s WHERE s.task_id = t.id AND s.status = 'SUBMITTED')::int AS to_grade
       FROM tasks t JOIN classes c ON c.id = t.class_id
      WHERE t.teacher_id = $1 ORDER BY t.created_at DESC`,
    [teacherId]
  );
}

export function tasksForClass(classId) {
  return query(
    `SELECT t.*, (SELECT COUNT(*) FROM submissions s WHERE s.task_id = t.id)::int AS submitted,
            (SELECT COUNT(*) FROM class_members m WHERE m.class_id = t.class_id)::int AS students
       FROM tasks t WHERE t.class_id = $1 ORDER BY t.created_at DESC`,
    [classId]
  );
}

export function tasksForStudent(studentId) {
  return query(
    `SELECT t.*, c.name AS class_name, s.id AS submission_id, s.status, s.score, s.revision_count
       FROM tasks t
       JOIN class_members m ON m.class_id = t.class_id AND m.student_id = $1
       JOIN classes c ON c.id = t.class_id
       LEFT JOIN submissions s ON s.task_id = t.id AND s.student_id = $1
      ORDER BY (s.status IS NULL OR s.status = 'REVISION_REQUESTED') DESC, t.created_at DESC`,
    [studentId]
  );
}

export async function activeTaskCount(studentId) {
  const r = await queryOne(
    `SELECT COUNT(*)::int AS n FROM tasks t
       JOIN class_members m ON m.class_id = t.class_id AND m.student_id = $1
       LEFT JOIN submissions s ON s.task_id = t.id AND s.student_id = $1
      WHERE s.id IS NULL OR s.status = 'REVISION_REQUESTED'`,
    [studentId]
  );
  return r.n;
}

// Tugas yang boleh dilihat user (murid anggota kelas / guru pemilik). Selain itu null.
export async function getTaskFor(user, taskId) {
  if (!UUID_RE.test(String(taskId))) return null;
  const task = user.role === 'MURID'
    ? await queryOne(
      `SELECT t.*, c.name AS class_name FROM tasks t JOIN classes c ON c.id = t.class_id
        JOIN class_members m ON m.class_id = t.class_id AND m.student_id = $2 WHERE t.id = $1`,
      [taskId, user.id])
    : await queryOne(
      `SELECT t.*, c.name AS class_name FROM tasks t JOIN classes c ON c.id = t.class_id
        WHERE t.id = $1 AND t.teacher_id = $2`,
      [taskId, user.id]);
  if (!task) return null;
  task.attachments = await query('SELECT id, name, url, size FROM task_attachments WHERE task_id = $1', [task.id]);
  return task;
}

export async function submissionFor(taskId, studentId) {
  const sub = await queryOne('SELECT * FROM submissions WHERE task_id = $1 AND student_id = $2', [taskId, studentId]);
  if (!sub) return null;
  sub.files = await query('SELECT * FROM submission_files WHERE submission_id = $1 ORDER BY revision, created_at', [sub.id]);
  return sub;
}

export async function submissionsForTask(taskId) {
  const subs = await query(
    `SELECT s.*, u.name AS student_name, u.email AS student_email
       FROM submissions s JOIN users u ON u.id = s.student_id WHERE s.task_id = $1 ORDER BY s.updated_at DESC`,
    [taskId]
  );
  for (const s of subs) {
    s.files = await query('SELECT * FROM submission_files WHERE submission_id = $1 ORDER BY revision, created_at', [s.id]);
  }
  return subs;
}

// Kumpul / revisi. `files` = hasil saveFile. Aman dari klik ganda: XP dijaga UNIQUE di xp_events.
export async function submitTask(task, studentId, files) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    let sub = (await client.query(
      `INSERT INTO submissions (task_id, student_id) VALUES ($1, $2)
       ON CONFLICT (task_id, student_id) DO NOTHING RETURNING *`, [task.id, studentId])).rows[0];
    let revision = 0; let xpDelta = 0;
    if (sub) {
      await client.query(
        `INSERT INTO xp_events (user_id, kind, amount, ref_id, note) VALUES ($1, 'TASK', $2, $3, $4)
         ON CONFLICT (user_id, kind, ref_id) DO NOTHING`,
        [studentId, task.points, task.id, `Tugas: ${task.title}`]);
      xpDelta = task.points;
    } else {
      sub = (await client.query('SELECT * FROM submissions WHERE task_id = $1 AND student_id = $2 FOR UPDATE', [task.id, studentId])).rows[0];
      if (sub.status === 'GRADED') { await client.query('ROLLBACK'); return { error: 'Tugas sudah dinilai, tidak bisa direvisi lagi', status: 409 }; }
      revision = sub.revision_count + 1;
      xpDelta = revisionDelta(task.points, revision);
      await client.query(
        `UPDATE submissions SET revision_count = $2, status = 'SUBMITTED', score = NULL, updated_at = now() WHERE id = $1`,
        [sub.id, revision]);
      if (xpDelta !== 0) {
        await client.query(
          `INSERT INTO xp_events (user_id, kind, amount, ref_id, note) VALUES ($1, 'REVISION', $2, $3, $4)
           ON CONFLICT (user_id, kind, ref_id) DO NOTHING`,
          [studentId, xpDelta, `${task.id}:${revision}`, `Revisi ke-${revision}: ${task.title}`]);
      }
    }
    for (const f of files) {
      await client.query(
        'INSERT INTO submission_files (submission_id, revision, name, url, size, mime) VALUES ($1, $2, $3, $4, $5, $6)',
        [sub.id, revision, f.name, f.url, f.size, f.mime]);
    }
    await client.query('COMMIT');
    return { submissionId: sub.id, revision, xpDelta, xpNow: taskXp(task.points, revision) };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function gradeSubmission(teacherId, submissionId, body) {
  if (!UUID_RE.test(String(submissionId))) return { error: 'Pengumpulan tidak ditemukan', status: 404 };
  const sub = await queryOne(
    `SELECT s.* FROM submissions s JOIN tasks t ON t.id = s.task_id WHERE s.id = $1 AND t.teacher_id = $2`,
    [submissionId, teacherId]);
  if (!sub) return { error: 'Pengumpulan tidak ditemukan', status: 404 };
  if (sub.status !== 'SUBMITTED') return { error: 'Hanya pengumpulan berstatus "Dikumpulkan" yang bisa dinilai', status: 409 };

  const feedback = String(body?.feedback ?? '').trim().slice(0, 1000) || null;
  const items = Array.isArray(body?.files) ? body.files : [];
  const current = await query('SELECT id FROM submission_files WHERE submission_id = $1 AND revision = $2', [sub.id, sub.revision_count]);
  const ids = new Set(current.map((f) => f.id));
  const byId = new Map();
  for (const it of items) {
    if (!ids.has(it?.id)) return { error: 'File tidak valid', status: 400 };
    byId.set(it.id, { score: it.score, feedback: String(it.feedback ?? '').trim().slice(0, 500) || null });
  }

  if (body?.action === 'revise') {
    if (!feedback || feedback.length < 3) return { error: 'Tulis catatan revisi untuk siswa', status: 400 };
    for (const [id, v] of byId) await query('UPDATE submission_files SET feedback = $2 WHERE id = $1', [id, v.feedback]);
    await query(`UPDATE submissions SET status = 'REVISION_REQUESTED', feedback = $2, updated_at = now() WHERE id = $1`, [sub.id, feedback]);
    return { ok: true, status: 'REVISION_REQUESTED' };
  }
  if (body?.action !== 'grade') return { error: 'Aksi tidak dikenal', status: 400 };

  let total = 0;
  for (const id of ids) {
    const v = byId.get(id);
    if (!v || !Number.isInteger(v.score) || v.score < 0 || v.score > 100) return { error: 'Beri nilai 0–100 untuk setiap file', status: 400 };
    total += v.score;
  }
  if (ids.size === 0) return { error: 'Tidak ada file untuk dinilai', status: 400 };
  for (const [id, v] of byId) await query('UPDATE submission_files SET score = $2, feedback = $3 WHERE id = $1', [id, v.score, v.feedback]);
  const score = Math.round(total / ids.size);
  await query(`UPDATE submissions SET status = 'GRADED', score = $2, feedback = $3, updated_at = now() WHERE id = $1`, [sub.id, score, feedback]);
  return { ok: true, status: 'GRADED', score };
}

export async function deleteTask(teacherId, taskId) {
  if (!UUID_RE.test(String(taskId))) return null;
  const files = await query(
    `SELECT f.url FROM submission_files f JOIN submissions s ON s.id = f.submission_id
       JOIN tasks t ON t.id = s.task_id WHERE t.id = $1 AND t.teacher_id = $2
     UNION ALL SELECT a.url FROM task_attachments a JOIN tasks t ON t.id = a.task_id WHERE t.id = $1 AND t.teacher_id = $2`,
    [taskId, teacherId]);
  const del = await queryOne('DELETE FROM tasks WHERE id = $1 AND teacher_id = $2 RETURNING id', [taskId, teacherId]);
  return del ? files.map((f) => f.url) : null;
}
