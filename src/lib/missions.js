import { query, queryOne, UUID_RE } from './db.js';
import { MISSIONS, MAPEL, localizeMission } from '../data/missions.js';
import { getContent, gradeQuiz } from '../data/missionContent.js';
import { MISSION_XP } from './gamification.js';
import { askPartInfo } from './ai.js';

export const getMission = (slug) => MISSIONS.find((m) => m.slug === slug) || null;
export const customSlug = (id) => `c-${id}`;
export const isCustomSlug = (slug) => /^c-[0-9a-f-]{36}$/i.test(String(slug));

export async function progressFor(userId) {
  const rows = await query('SELECT mission_slug, best_score, passed, attempts FROM mission_progress WHERE user_id = $1', [userId]);
  return Object.fromEntries(rows.map((r) => [r.mission_slug, r]));
}

export async function doneSlugs(userId) {
  const rows = await query("SELECT ref_id FROM xp_events WHERE user_id = $1 AND kind = 'MISSION'", [userId]);
  return new Set(rows.map((r) => r.ref_id));
}

// Kuis = latihan: hanya mencatat nilai terbaik, TIDAK memberi XP.
export async function submitQuiz(userId, slug, answers, lang = 'id') {
  const result = gradeQuiz(slug, answers, lang);
  if (!result) return null;
  await queryOne(
    `INSERT INTO mission_progress (user_id, mission_slug, best_score, passed, completed_at)
     VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN now() END)
     ON CONFLICT (user_id, mission_slug) DO UPDATE SET
       best_score = GREATEST(mission_progress.best_score, EXCLUDED.best_score),
       attempts = mission_progress.attempts + 1,
       passed = mission_progress.passed OR EXCLUDED.passed,
       completed_at = COALESCE(mission_progress.completed_at, EXCLUDED.completed_at),
       updated_at = now()
     RETURNING user_id`,
    [userId, slug, result.score, result.passed]
  );
  return result;
}

export async function openMission(userId, slug) {
  await query(
    `INSERT INTO mission_progress (user_id, mission_slug, best_score, attempts, passed) VALUES ($1, $2, 0, 0, false)
     ON CONFLICT DO NOTHING`, [userId, slug]);
}

// Apakah misi `slug` dibagikan guru ke salah satu kelas murid ini?
export async function isAssignedTo(userId, slug) {
  if (isCustomSlug(slug)) {
    return !!(await queryOne(
      `SELECT 1 FROM custom_missions cm JOIN class_members m ON m.class_id = cm.class_id
        WHERE cm.id = $1 AND m.student_id = $2`, [slug.slice(2), userId]));
  }
  return !!(await queryOne(
    `SELECT 1 FROM class_missions cm JOIN class_members m ON m.class_id = cm.class_id
      WHERE cm.mission_slug = $1 AND m.student_id = $2`, [slug, userId]));
}

// "Tandai selesai": +100 XP sekali per misi, hanya untuk materi kelas. Misi bawaan wajib lulus latihan dulu.
export async function completeMission(userId, slug) {
  if (!isCustomSlug(slug) && !getMission(slug)) return { error: 'Misi tidak ditemukan', status: 404 };
  if (!(await isAssignedTo(userId, slug))) return { error: 'Misi ini belum dibagikan gurumu di kelasmu, jadi tidak memberi XP (hanya latihan).', status: 403 };
  if (!isCustomSlug(slug)) {
    const p = await queryOne('SELECT passed FROM mission_progress WHERE user_id = $1 AND mission_slug = $2', [userId, slug]);
    if (!p?.passed) return { error: 'Lulus dulu soal latihan (nilai minimal 60) sebelum menandai selesai.', status: 409 };
  } else {
    await openMission(userId, slug);
  }
  const ins = await queryOne(
    `INSERT INTO xp_events (user_id, kind, amount, ref_id, note) VALUES ($1, 'MISSION', $2, $3, $4)
     ON CONFLICT (user_id, kind, ref_id) DO NOTHING RETURNING id`,
    [userId, MISSION_XP, slug, `Misi ${slug}`]);
  return { ok: true, xpGained: ins ? MISSION_XP : 0 };
}

export async function assignMission(classId, slug) {
  if (!getMission(slug)) return false;
  await query('INSERT INTO class_missions (class_id, mission_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, slug]);
  return true;
}
export async function unassignMission(classId, slug) {
  await query('DELETE FROM class_missions WHERE class_id = $1 AND mission_slug = $2', [classId, slug]);
}
export async function assignedForClass(classId) {
  const rows = await query('SELECT mission_slug FROM class_missions WHERE class_id = $1 ORDER BY assigned_at', [classId]);
  return rows.map((r) => r.mission_slug);
}
export async function assignedSlugsForStudent(userId) {
  const rows = await query(
    `SELECT DISTINCT cm.mission_slug FROM class_missions cm JOIN class_members m ON m.class_id = cm.class_id WHERE m.student_id = $1`, [userId]);
  return new Set(rows.map((r) => r.mission_slug));
}

// ---- materi AR buatan guru ----
export function validateCustom(body) {
  const title = String(body?.title ?? '').trim().replace(/\s+/g, ' ');
  const level = 'Kelas 10 RPL';
  const subject = String(body?.subject ?? '').trim();
  if (!MAPEL.includes(subject)) return { error: 'Pilih salah satu mata pelajaran' };
  const description = String(body?.description ?? '').trim().slice(0, 1000) || null;
  if (title.length < 2 || title.length > 100) return { error: 'Judul materi 2–100 karakter' };
  return { value: { title, level, subject, description } };
}
export const addCustom = (classId, teacherId, v, modelUrl) =>
  queryOne(`INSERT INTO custom_missions (class_id, teacher_id, title, level, subject, description, model_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [classId, teacherId, v.title, v.level, v.subject, v.description, modelUrl]);
export const customForClass = (classId) =>
  query('SELECT * FROM custom_missions WHERE class_id = $1 ORDER BY created_at DESC', [classId]);
export async function deleteCustom(teacherId, id) {
  if (!UUID_RE.test(String(id))) return null;
  return queryOne('DELETE FROM custom_missions WHERE id = $1 AND teacher_id = $2 RETURNING model_url', [id, teacherId]);
}
// Materi buatan guru yang boleh dilihat user (murid anggota kelas / guru pemilik).
export async function getCustomFor(user, id) {
  if (!UUID_RE.test(String(id))) return null;
  return user.role === 'MURID'
    ? queryOne(`SELECT cm.* FROM custom_missions cm JOIN class_members m ON m.class_id = cm.class_id AND m.student_id = $2 WHERE cm.id = $1`, [id, user.id])
    : queryOne('SELECT * FROM custom_missions WHERE id = $1 AND teacher_id = $2', [id, user.id]);
}

// Materi per kelas untuk murid: misi bawaan yang dibagikan + materi buatan guru.
export async function classMaterialsForStudent(userId) {
  const classes = await query(
    `SELECT c.id, c.name, c.code, u.name AS teacher_name FROM class_members m
       JOIN classes c ON c.id = m.class_id JOIN users u ON u.id = c.teacher_id
      WHERE m.student_id = $1 ORDER BY m.joined_at DESC`, [userId]);
  const [prog, done] = await Promise.all([progressFor(userId), doneSlugs(userId)]);
  const state = (slug) => (done.has(slug) ? 'done' : prog[slug] ? 'opened' : 'new');
  for (const c of classes) {
    const built = (await assignedForClass(c.id)).map((slug) => ({ slug, ...getMission(slug), kind: 'builtin' })).filter((m) => m.title);
    const custom = (await customForClass(c.id)).map((m) => ({
      slug: customSlug(m.id), title: m.title, category: m.subject || 'Materi guru',
      text: m.description, kind: 'custom', xp: MISSION_XP }));
    c.items = [...built, ...custom].map((m) => ({ ...m, state: state(m.slug) }));
  }
  return classes;
}

// Info komponen: cache di DB (per bahasa) → AI → teks bawaan. Untuk materi guru, nama komponen bebas.
export async function partInfo(slug, part, custom = null, lang = 'id') {
  const en = lang === 'en';
  let title; let context; let fallback;
  if (custom) {
    if (!/^[\p{L}\p{N} _.\-()]{1,60}$/u.test(part)) return null;
    title = custom.title; context = custom.description || custom.title;
    fallback = en
      ? `The part "${part}" of the model ${custom.title}. ${custom.description || ''} (AI explanations turn on when ANTHROPIC_API_KEY is set.)`.trim()
      : `Bagian "${part}" dari model ${custom.title}. ${custom.description || ''} (Penjelasan AI aktif bila ANTHROPIC_API_KEY diisi.)`.trim();
  } else {
    const base = getMission(slug); const mission = localizeMission(base, lang);
    const def = getContent(slug, lang)?.parts.find((p) => p.id === part);
    if (!mission || !def) return null;
    title = mission.title; context = `${mission.text} ${en ? 'Basic info' : 'Info dasar'}: ${def.info}`; fallback = def.info;
  }
  const cached = await queryOne('SELECT info, source FROM ar_part_info WHERE mission_slug = $1 AND part = $2 AND lang = $3', [slug, part, lang]);
  if (cached) return { part, info: cached.info, source: cached.source };
  const ai = await askPartInfo({ missionTitle: title, part, context, lang });
  if (ai) {
    await query(`INSERT INTO ar_part_info (mission_slug, part, lang, info, source) VALUES ($1, $2, $3, $4, 'AI') ON CONFLICT DO NOTHING`, [slug, part, lang, ai]);
    return { part, info: ai, source: 'AI' };
  }
  return { part, info: fallback, source: 'BAWAAN' };
}
