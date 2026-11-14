import { NextResponse } from 'next/server';
import { need, fail } from '@/lib/api.js';
import { removeFile } from '@/lib/storage.js';
import { deleteLibraryFile } from '@/lib/library.js';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { user, res } = await need();
  if (res) return res;
  const row = await deleteLibraryFile(user.id, id);
  if (!row) return fail('File tidak ditemukan', 404);
  await removeFile(row.url);
  return NextResponse.json({ ok: true });
}
