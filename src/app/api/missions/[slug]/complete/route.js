import { NextResponse } from 'next/server';
import { need, fail } from '@/lib/api.js';
import { completeMission } from '@/lib/missions.js';

export async function POST(_req, { params }) {
  const { slug } = await params;
  const { user, res } = await need(['MURID']);
  if (res) return res;
  try {
    const out = await completeMission(user.id, slug);
    if (out.error) return fail(out.error, out.status);
    return NextResponse.json({ ...out, message: out.xpGained ? `Misi selesai! +${out.xpGained} XP 🎉` : 'Misi ini sudah kamu selesaikan sebelumnya.' });
  } catch (err) {
    console.error('complete error:', err);
    return fail('Gagal menyimpan', 500);
  }
}
