import { NextResponse } from 'next/server';
import { need, fail, readForm } from '@/lib/api.js';
import { checkFile, saveFile, removeFile, MAX_AVATAR_BYTES } from '@/lib/storage.js';
import { query } from '@/lib/db.js';

export async function POST(req) {
  const { user, res } = await need();
  if (res) return res;
  const form = await readForm(req);
  const file = form?.get('avatar');
  const err = checkFile(file, { imageOnly: true, maxBytes: MAX_AVATAR_BYTES });
  if (err) return fail(err);
  try {
    const saved = await saveFile(file, `avatars/${user.id}`);
    await query('UPDATE users SET avatar_url = $2 WHERE id = $1', [user.id, saved.url]);
    if (user.avatar_url) await removeFile(user.avatar_url);
    return NextResponse.json({ ok: true, url: saved.url, message: 'Foto profil diperbarui' });
  } catch (e) {
    console.error('avatar error:', e);
    return fail('Gagal menyimpan foto', 500);
  }
}
