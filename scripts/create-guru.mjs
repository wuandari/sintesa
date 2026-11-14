// Membuat akun guru (pendaftaran umum hanya untuk murid).
// Pemakaian: npm run guru:buat -- "Nama Guru" email@contoh.com passwordnya
import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error('Pemakaian: npm run guru:buat -- "Nama Guru" email@contoh.com password');
  process.exit(1);
}
if (password.length < 6) {
  console.error('Password minimal 6 karakter.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const hash = await bcrypt.hash(password, 10);
  const res = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'GURU')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'GURU'
     RETURNING id`,
    [name.trim(), email.trim().toLowerCase(), hash]
  );
  console.log(`Akun guru siap: ${email.trim().toLowerCase()} (id ${res.rows[0].id})`);
} catch (err) {
  console.error('Gagal:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
