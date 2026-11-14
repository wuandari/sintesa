import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { getLang } from '@/lib/lang.js';
import { checkAnswer } from '@/data/missionContent.js';

// Umpan balik per soal (latihan). Tidak mengubah XP.
export async function POST(req, { params }) {
  const { slug } = await params;
  const { res } = await need();
  if (res) return res;
  const body = await readJson(req);
  const r = checkAnswer(slug, Number(body?.q), Number(body?.a), await getLang());
  if (!r) return fail('Data tidak valid');
  return NextResponse.json(r);
}
