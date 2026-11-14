// Pembantu tes: menyiapkan database kosong untuk pengujian.
// - Jika TEST_DATABASE_URL diisi, pakai database itu (HARUS kosong / khusus tes).
// - Jika tidak, otomatis menjalankan Postgres sementara (embedded-postgres).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import pg from 'pg';
import { runMigrations } from './migrate-lib.mjs';

export async function prepareDatabase() {
  let stop = async () => {};
  let url = process.env.TEST_DATABASE_URL;

  if (!url) {
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sintesa-pg-'));
    const port = 54000 + Math.floor(Math.random() * 900);
    const server = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password: 'pw', port, persistent: false });
    await server.initialise();
    await server.start();
    await server.createDatabase('sintesa_test');
    url = `postgresql://postgres:pw@localhost:${port}/sintesa_test`;
    stop = async () => { await server.stop(); fs.rmSync(dir, { recursive: true, force: true }); };
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const existing = await client.query("SELECT to_regclass('public.users') AS t");
  if (existing.rows[0].t) {
    const n = (await client.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n;
    if (n > 0) {
      await client.end();
      throw new Error('Database tes sudah berisi data. Pakai database kosong khusus tes (jangan database asli!).');
    }
  }
  await runMigrations(client, () => {});
  return { url, client, stop };
}
