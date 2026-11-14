import { NextResponse } from 'next/server';
import { need, fail } from '@/lib/api.js';
import { deleteCustom } from '@/lib/missions.js';
import { removeFile } from '@/lib/storage.js';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return res;
  const row = await deleteCustom(user.id, id);
  if (!row) return fail('Materi tidak ditemukan', 404);
  await removeFile(row.model_url);
  return NextResponse.json({ ok: true });
}
