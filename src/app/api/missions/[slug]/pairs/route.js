import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { checkPairs } from '@/data/missionContent.js';

// Permainan "hubungkan komponen ke fungsinya": hasil diperiksa di server, tidak memberi XP.
export async function POST(req, { params }) {
  const { slug } = await params;
  const { res } = await need();
  if (res) return res;
  const body = await readJson(req);
  const links = {};
  if (body?.links && typeof body.links === 'object') {
    for (const [k, v] of Object.entries(body.links).slice(0, 20)) if (Number.isInteger(v)) links[String(k).slice(0, 40)] = v;
  }
  const r = checkPairs(slug, links);
  if (!r) return fail('Data tidak valid');
  return NextResponse.json(r);
}
