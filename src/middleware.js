import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/token.js';

// Halaman yang wajib login. Pengecekan peran dilakukan di tiap halaman.
export const config = {
  matcher: ['/siswa/:path*', '/guru/:path*', '/tugas/:path*', '/library/:path*', '/ar/:path*', '/profil/:path*'],
};

export async function middleware(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (payload) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  const res = NextResponse.redirect(url);
  if (token) res.cookies.delete(COOKIE_NAME); // token rusak / kedaluwarsa
  return res;
}
