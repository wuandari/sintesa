import 'dotenv/config';
import pg from 'pg';
import { runMigrations } from './migrate-lib.mjs';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await runMigrations(client);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
