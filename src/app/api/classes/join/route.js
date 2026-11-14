import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.js';
import { joinClass } from '@/lib/classes.js';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Silakan masuk dulu' }, { status: 401 });
  if (user.role !== 'MURID') {
    return NextResponse.json({ message: 'Hanya murid yang bisa bergabung ke kelas' }, { status: 403 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Permintaan tidak valid' }, { status: 400 });
  }
  try {
    const result = await joinClass(user.id, body?.code);
    if (result.error) return NextResponse.json({ message: result.error }, { status: result.status });
    return NextResponse.json({
      ok: true,
      already: result.already,
      class: result.class,
      message: result.already ? `Kamu sudah ada di kelas ${result.class.name}` : `Berhasil bergabung ke ${result.class.name}`,
    });
  } catch (err) {
    console.error('join class error:', err);
    return NextResponse.json({ message: 'Gagal bergabung ke kelas' }, { status: 500 });
  }
}
