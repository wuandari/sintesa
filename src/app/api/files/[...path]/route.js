import fs from 'node:fs/promises';
import path from 'node:path';
import { need, fail } from '@/lib/api.js';
import { UPLOAD_DIR, extOf } from '@/lib/storage.js';

// Menyajikan file lokal (hanya dipakai bila Vercel Blob tidak dikonfigurasi). Wajib login.
const INLINE = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', txt: 'text/plain; charset=utf-8', mp4: 'video/mp4', mp3: 'audio/mpeg' };

export async function GET(_req, { params }) {
  const { res } = await need();
  if (res) return res;
  const parts = (await params).path || [];
  const full = path.resolve(UPLOAD_DIR, ...parts.map((p) => decodeURIComponent(p)));
  if (!full.startsWith(UPLOAD_DIR + path.sep)) return fail('Tidak ditemukan', 404);
  try {
    const data = await fs.readFile(full);
    const ext = extOf(full);
    const inline = INLINE[ext];
    const name = path.basename(full).replace(/^[0-9a-f-]{36}-/, '');
    return new Response(data, {
      headers: {
        'content-type': inline || 'application/octet-stream',
        'content-disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name)}`,
        'x-content-type-options': 'nosniff',
        'cache-control': 'private, max-age=3600',
      },
    });
  } catch {
    return fail('Tidak ditemukan', 404);
  }
}
