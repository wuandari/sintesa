import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { gradeSubmission } from '@/lib/tasks.js';

export async function POST(req, { params }) {
  const { id } = await params;
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return res;
  const body = await readJson(req);
  if (!body) return fail('Permintaan tidak valid');
  try {
    const out = await gradeSubmission(user.id, id, body);
    if (out.error) return fail(out.error, out.status);
    return NextResponse.json(out);
  } catch (err) {
    console.error('grade error:', err);
    return fail('Gagal menyimpan penilaian', 500);
  }
}
