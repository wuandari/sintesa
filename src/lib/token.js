// Token sesi (JWT). Hanya memakai "jose" sehingga aman dipakai juga di middleware.
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'sintesa_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET harus diisi, minimal 32 karakter (lihat .env.example)');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(user) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  };
}

export function clearedCookie() {
  return { ...sessionCookie(''), maxAge: 0 };
}
