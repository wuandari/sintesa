import { NextResponse } from 'next/server';
import { need, fail, readForm } from '@/lib/api.js';
import { allow } from '@/lib/rateLimit.js';
import { filesFrom, saveFile, removeFile } from '@/lib/storage.js';
import { addLibraryFile } from '@/lib/library.js';

export async function POST(req) {
  const { user, res } = await need();
  if (res) return res;
  if (!allow(`lib:${user.id}`, 40, 60 * 60 * 1000)) return fail('Terlalu sering mengunggah. Coba lagi nanti.', 429);
  const form = await readForm(req);
  if (!form) return fail('Permintaan tidak valid');
  const { files, error } = filesFrom(form, 'files');
  if (error) return fail(error);
  if (files.length === 0) return fail('Pilih minimal 1 file');
  if (files.length > 10) return fail('Maksimal 10 file sekali unggah');
  const note = String(form.get('note') ?? '').trim().slice(0, 200) || null;
  const out = [];
  try {
    for (const f of files) {
      const s = await saveFile(f, `library/${user.id}`);
      try { out.push(await addLibraryFile(user.id, s, note)); } catch (e) { await removeFile(s.url); throw e; }
    }
    return NextResponse.json({ ok: true, count: out.length, message: `${out.length} file tersimpan di arsip` });
  } catch (err) {
    console.error('library error:', err);
    return fail('Gagal menyimpan file', 500);
  }
}
