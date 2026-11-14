import pg from 'pg';

const g = globalThis;

// Koneksi dibuat saat pertama dipakai (bukan saat build), dan dipakai ulang antar permintaan.
export function getPool() {
  if (!g.__sintesaPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL belum diisi (lihat .env.example)');
    const pool = new pg.Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 10000, // buang koneksi menganggur sebelum diputus server (Neon)
      connectionTimeoutMillis: 30000, // Neon gratis butuh waktu "bangun" setelah lama diam
      keepAlive: true,
    });
    // Tanpa ini, koneksi menganggur yang diputus server bisa menjatuhkan proses.
    pool.on('error', (err) => console.error('pg pool idle error:', err.message));
    g.__sintesaPool = pool;
  }
  return g.__sintesaPool;
}

const TRANSIENT = /Connection terminated|ECONNRESET|EPIPE|ETIMEDOUT|timeout exceeded when trying to connect/i;

export async function query(text, params = []) {
  // Koneksi yang putus di tengah jalan (mis. database tidur) dicoba ulang sampai 2 kali.
  for (let attempt = 0; ; attempt += 1) {
    try {
      const res = await getPool().query(text, params);
      return res.rows;
    } catch (err) {
      if (attempt >= 2 || !TRANSIENT.test(String(err && err.message))) throw err;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
