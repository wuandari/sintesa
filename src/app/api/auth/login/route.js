import { NextResponse } from 'next/server';
import { authenticate, normalizeEmail } from '@/lib/users.js';
import { signToken, sessionCookie } from '@/lib/token.js';
import { allow, clientIp } from '@/lib/rateLimit.js';
import { homeFor } from '@/lib/home.js';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Permintaan tidak valid' }, { status: 400 });
  }

  const email = normalizeEmail(body?.email);
  if (!email || !body?.password) {
    return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 });
  }
  if (!allow(`login:${clientIp(req)}:${email}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ message: 'Terlalu banyak percobaan masuk. Coba lagi beberapa menit lagi.' }, { status: 429 });
  }

  try {
    const user = await authenticate(email, body.password);
    if (!user) return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 });
    const res = NextResponse.json({ ok: true, redirect: homeFor(user.role) });
    res.cookies.set(sessionCookie(await signToken(user)));
    return res;
  } catch (err) {
    console.error('login error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan di server' }, { status: 500 });
  }
}
