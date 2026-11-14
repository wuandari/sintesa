import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { validateProfile } from '@/lib/users.js';
import { query } from '@/lib/db.js';

export async function PATCH(req) {
  const { user, res } = await need();
  if (res) return res;
  const body = await readJson(req);
  const v = validateProfile(body);
  if (v.error) return fail(v.error);
  await query('UPDATE users SET name = $2, nis = $3, bio = $4 WHERE id = $1', [user.id, v.value.name, v.value.nis, v.value.bio]);
  return NextResponse.json({ ok: true, message: 'Profil disimpan' });
}
