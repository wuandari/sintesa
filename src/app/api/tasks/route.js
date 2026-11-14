import { NextResponse } from 'next/server';
import { need, fail, readForm } from '@/lib/api.js';
import { filesFrom, saveFile, removeFile } from '@/lib/storage.js';
import { createTask, validateTask } from '@/lib/tasks.js';

export async function POST(req) {
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return res;
  const form = await readForm(req);
  if (!form) return fail('Permintaan tidak valid');
  const v = validateTask(Object.fromEntries(['class_id', 'title', 'description', 'points', 'due_at'].map((k) => [k, form.get(k)])));
  if (v.error) return fail(v.error);
  const { files, error } = filesFrom(form, 'files');
  if (error) return fail(error);
  if (files.length > 5) return fail('Maksimal 5 lampiran');
  const saved = [];
  try {
    for (const f of files) saved.push(await saveFile(f, 'tasks'));
    const out = await createTask(user.id, v.value, saved);
    if (out.error) { await Promise.all(saved.map((s) => removeFile(s.url))); return fail(out.error, out.status); }
    return NextResponse.json({ ok: true, id: out.task.id, message: 'Tugas dibuat' });
  } catch (err) {
    console.error('create task error:', err);
    await Promise.all(saved.map((s) => removeFile(s.url)));
    return fail('Gagal membuat tugas', 500);
  }
}
