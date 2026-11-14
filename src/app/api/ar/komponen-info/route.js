import { NextResponse } from 'next/server';
import { need, fail, readJson } from '@/lib/api.js';
import { allow } from '@/lib/rateLimit.js';
import { getLang } from '@/lib/lang.js';
import { partInfo, getCustomFor, isCustomSlug } from '@/lib/missions.js';

export async function POST(req) {
  const { user, res } = await need();
  if (res) return res;
  if (!allow(`part:${user.id}`, 40, 10 * 60 * 1000)) return fail('Terlalu sering. Coba lagi sebentar lagi.', 429);
  const body = await readJson(req);
  const mission = String(body?.mission ?? '').slice(0, 80);
  const part = String(body?.part ?? '').slice(0, 60);
  if (!mission || !part) return fail('Data tidak lengkap');
  try {
    let custom = null;
    if (isCustomSlug(mission)) {
      custom = await getCustomFor(user, mission.slice(2));
      if (!custom) return fail('Materi tidak ditemukan', 404);
    }
    const info = await partInfo(mission, part, custom, await getLang());
    if (!info) return fail('Komponen tidak dikenal', 404);
    return NextResponse.json(info);
  } catch (err) {
    console.error('part info error:', err);
    return fail('Gagal memuat info komponen', 500);
  }
}
