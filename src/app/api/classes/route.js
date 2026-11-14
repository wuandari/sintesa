import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.js';
import { validateClass, createClass } from '@/lib/classes.js';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Silakan masuk dulu' }, { status: 401 });
  if (user.role !== 'GURU' && user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Hanya guru yang bisa membuat kelas' }, { status: 403 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Permintaan tidak valid' }, { status: 400 });
  }
  const v = validateClass(body);
  if (v.error) return NextResponse.json({ message: v.error }, { status: 400 });
  try {
    const cls = await createClass(user.id, v.value);
    return NextResponse.json(cls, { status: 201 });
  } catch (err) {
    console.error('create class error:', err);
    return NextResponse.json({ message: 'Gagal membuat kelas' }, { status: 500 });
  }
}
