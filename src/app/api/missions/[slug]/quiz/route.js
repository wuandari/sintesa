import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { getLang } from '@/lib/lang.js';
import { getMission, submitQuiz } from '@/lib/missions.js';

export async function POST(req, { params }) {
  const { slug } = await params;
  const { user, res } = await need(['MURID']);
  if (res) return res;
  if (!getMission(slug)) return fail('Misi tidak ditemukan', 404);
  const body = await readJson(req);
  if (!Array.isArray(body?.answers)) return fail('Jawaban tidak valid');
  try {
    const result = await submitQuiz(user.id, slug, body.answers.slice(0, 20), await getLang());
    return NextResponse.json(result);
  } catch (err) {
    console.error('quiz error:', err);
    return fail('Gagal menyimpan hasil kuis', 500);
  }
}
