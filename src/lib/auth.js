// Pembantu sesi untuk Server Component dan Route Handler.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifyToken } from './token.js';
import { queryOne } from './db.js';

import { homeFor } from './home.js';

export { homeFor };

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  // Selalu baca ulang dari database supaya perubahan peran / akun yang dihapus langsung berlaku.
  return queryOne('SELECT id, name, email, role, avatar_url FROM users WHERE id = $1', [payload.sub]);
}

// Wajib login. Jika `roles` diisi dan peran tidak cocok, arahkan ke beranda perannya sendiri.
export async function requireUser(roles) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (roles && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
