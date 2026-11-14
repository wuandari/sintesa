// Menjalankan file SQL di db/migrations yang belum pernah dijalankan.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');

export async function runMigrations(client, log = console.log) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

  const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  let applied = 0;

  for (const file of files) {
    if (done.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    log(`Menjalankan ${file} ...`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      applied += 1;
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migrasi ${file} gagal: ${err.message}`);
    }
  }
  log(applied ? `Selesai: ${applied} migrasi dijalankan.` : 'Database sudah yang terbaru.');
  return applied;
}
