// Penyimpanan file: Vercel Blob bila BLOB_READ_WRITE_TOKEN ada, selain itu folder lokal ./uploads.
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const MAX_BYTES = 15 * 1024 * 1024;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const DOC_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'zip', 'rar', '7z',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'json', 'sql', 'glb', 'gltf', 'html', 'css', 'js', 'py', 'java', 'c', 'cpp', 'php'];
const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

export const MODEL_EXT = ['glb'];

export function extOf(name) {
  const m = /\.([a-z0-9]{1,8})$/i.exec(String(name || ''));
  return m ? m[1].toLowerCase() : '';
}

export function safeName(name) {
  const base = String(name || 'file').split(/[\\/]/).pop().replace(/[^\w.\- ()]+/g, '_').replace(/\s+/g, ' ').trim();
  return (base || 'file').slice(0, 100);
}

// Mengembalikan pesan kesalahan atau null bila file boleh diunggah.
export function checkFile(file, { imageOnly = false, modelOnly = false, maxBytes = MAX_BYTES } = {}) {
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') return 'File tidak valid';
  if (!file.size) return `File "${safeName(file.name)}" kosong`;
  if (file.size > maxBytes) return `File "${safeName(file.name)}" melebihi ${Math.round(maxBytes / 1024 / 1024)} MB`;
  const ext = extOf(file.name);
  if (modelOnly && !MODEL_EXT.includes(ext)) return 'Model 3D harus berformat .glb';
  if (!modelOnly && !(imageOnly ? IMG_EXT : DOC_EXT).includes(ext)) {
    return imageOnly ? 'Foto harus berformat PNG, JPG, GIF, atau WEBP' : `Jenis file .${ext || '?'} tidak didukung`;
  }
  return null;
}

export async function saveFile(file, folder) {
  const name = safeName(file.name);
  const key = `${folder}/${randomUUID()}-${name}`;
  const mime = file.type || null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(key, file, { access: 'public', addRandomSuffix: false });
    return { name, url: blob.url, size: file.size, mime };
  }
  const full = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, Buffer.from(await file.arrayBuffer()));
  return { name, url: `/api/files/${key.split('/').map(encodeURIComponent).join('/')}`, size: file.size, mime };
}

export async function removeFile(url) {
  try {
    if (/^https?:\/\//.test(url)) {
      if (process.env.BLOB_READ_WRITE_TOKEN) { const { del } = await import('@vercel/blob'); await del(url); }
    } else if (url.startsWith('/api/files/')) {
      const rel = decodeURIComponent(url.slice('/api/files/'.length));
      const full = path.resolve(UPLOAD_DIR, rel);
      if (full.startsWith(UPLOAD_DIR + path.sep)) await fs.unlink(full);
    }
  } catch { /* file sudah hilang: abaikan */ }
}

// Ambil semua file dari FormData (field `files`), validasi, kembalikan { files } atau { error }.
export function filesFrom(form, field = 'files', opts) {
  const files = form.getAll(field).filter((f) => f && typeof f !== 'string' && f.size > 0);
  for (const f of files) { const err = checkFile(f, opts); if (err) return { error: err }; }
  return { files };
}
