import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { getClassForTeacher } from '@/lib/classes.js';
import { assignMission, unassignMission } from '@/lib/missions.js';

async function guard(params) {
  const { id } = await params;
  const { user, res } = await need(['GURU', 'ADMIN']);
  if (res) return { res };
  const cls = await getClassForTeacher(id, user.id);
  if (!cls) return { res: fail('Kelas tidak ditemukan', 404) };
  return { cls };
}

export async function POST(req, { params }) {
  const g = await guard(params);
  if (g.res) return g.res;
  const body = await readJson(req);
  if (!(await assignMission(g.cls.id, String(body?.slug ?? '')))) return fail('Misi tidak ditemukan', 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const g = await guard(params);
  if (g.res) return g.res;
  const body = await readJson(req);
  await unassignMission(g.cls.id, String(body?.slug ?? ''));
  return NextResponse.json({ ok: true });
}
