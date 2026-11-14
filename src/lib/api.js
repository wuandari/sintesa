import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth.js';

export const fail = (message, status = 400) => NextResponse.json({ message }, { status });

// Pastikan login (dan peran cocok). Mengembalikan { user } atau { res } yang langsung dikirim.
export async function need(roles) {
  const user = await getCurrentUser();
  if (!user) return { res: fail('Silakan masuk dulu', 401) };
  if (roles && !roles.includes(user.role)) return { res: fail('Kamu tidak punya akses untuk ini', 403) };
  return { user };
}

export async function readJson(req) {
  try { return await req.json(); } catch { return null; }
}

export async function readForm(req) {
  try { return await req.formData(); } catch { return null; }
}
