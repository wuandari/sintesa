import { NextResponse } from 'next/server';
import { need, fail, readForm } from '@/lib/api.js';
import { allow } from '@/lib/rateLimit.js';
import { filesFrom, saveFile, removeFile } from '@/lib/storage.js';
import { getTaskFor, submitTask } from '@/lib/tasks.js';

export async function POST(req, { params }) {
  const { id } = await params;
  const { user, res } = await need(['MURID']);
  if (res) return res;
  if (!allow(`submit:${user.id}`, 30, 60 * 60 * 1000)) return fail('Terlalu sering mengunggah. Coba lagi nanti.', 429);
  const task = await getTaskFor(user, id);
  if (!task) return fail('Tugas tidak ditemukan', 404);
  const form = await readForm(req);
  if (!form) return fail('Permintaan tidak valid');
  const { files, error } = filesFrom(form, 'files');
  if (error) return fail(error);
  if (files.length === 0) return fail('Pilih minimal 1 file');
  if (files.length > 5) return fail('Maksimal 5 file per pengumpulan');
  const saved = [];
  try {
    for (const f of files) saved.push(await saveFile(f, `submissions/${task.id}`));
    const out = await submitTask(task, user.id, saved);
    if (out.error) { await Promise.all(saved.map((s) => removeFile(s.url))); return fail(out.error, out.status); }
    const message = out.revision === 0
      ? `Tugas terkumpul! +${out.xpDelta} XP`
      : out.xpDelta < 0
        ? `Revisi ke-${out.revision} terkirim. XP tugas ini berkurang ${-out.xpDelta} (sisa ${out.xpNow} XP).`
        : `Revisi ke-${out.revision} terkirim. XP tugas ini tetap ${out.xpNow} XP.`;
    return NextResponse.json({ ok: true, ...out, message });
  } catch (err) {
    console.error('submit error:', err);
    await Promise.all(saved.map((s) => removeFile(s.url)));
    return fail('Gagal mengumpulkan tugas', 500);
  }
}
