import { NextResponse } from 'next/server';
import { need, fail, readForm } from '@/lib/api.js';
import { getClassForTeacher } from '@/lib/classes.js';
import { addCustom, validateCustom } from '@/lib/missions.js';
import { checkFile, saveFile, removeFile } from '@/lib/storage.js';

export async function POST(req, { params }) {
  const { id } = await params;
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return res;
  const cls = await getClassForTeacher(id, user.id);
  if (!cls) return fail('Kelas tidak ditemukan', 404);
  const form = await readForm(req);
  if (!form) return fail('Permintaan tidak valid');
  const v = validateCustom(Object.fromEntries(['title', 'level', 'subject', 'description'].map((k) => [k, form.get(k)])));
  if (v.error) return fail(v.error);
  const file = form.get('model');
  const err = checkFile(file, { modelOnly: true });
  if (err) return fail(err);
  let saved;
  try {
    saved = await saveFile(file, `models/${cls.id}`);
    const row = await addCustom(cls.id, user.id, v.value, saved.url);
    return NextResponse.json({ ok: true, id: row.id, message: 'Materi AR ditambahkan ke kelas' });
  } catch (e) {
    console.error('materi error:', e);
    if (saved) await removeFile(saved.url);
    return fail('Gagal menyimpan materi', 500);
  }
}
