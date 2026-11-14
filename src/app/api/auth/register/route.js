import { NextResponse } from 'next/server';
import { validateRegistration, createUser } from '@/lib/users.js';
import { signToken, sessionCookie } from '@/lib/token.js';
import { allow, clientIp } from '@/lib/rateLimit.js';

export async function POST(req) {
  if (!allow(`register:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ message: 'Terlalu banyak percobaan, coba lagi nanti.' }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Permintaan tidak valid' }, { status: 400 });
  }

  const v = validateRegistration(body);
  if (v.error) return NextResponse.json({ message: v.error }, { status: 400 });

  try {
    // Pendaftaran umum SELALU menjadi murid. Akun guru dibuat lewat skrip admin.
    const user = await createUser({ ...v.value, role: 'MURID' });
    const res = NextResponse.json({ ok: true, redirect: '/siswa' }, { status: 201 });
    res.cookies.set(sessionCookie(await signToken(user)));
    return res;
  } catch (err) {
    if (err.code === 'EMAIL_TAKEN') {
      return NextResponse.json({ message: 'Email sudah terdaftar. Silakan masuk.' }, { status: 409 });
    }
    console.error('register error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan di server' }, { status: 500 });
  }
}
