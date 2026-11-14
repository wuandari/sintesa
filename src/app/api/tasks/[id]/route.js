import { NextResponse } from 'next/server';
import { need, fail } from '@/lib/api.js';
import { removeFile } from '@/lib/storage.js';
import { deleteTask } from '@/lib/tasks.js';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return res;
  const urls = await deleteTask(user.id, id);
  if (!urls) return fail('Tugas tidak ditemukan', 404);
  await Promise.all(urls.map(removeFile));
  return NextResponse.json({ ok: true });
}
