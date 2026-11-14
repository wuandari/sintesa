// Data contoh (nama karangan) supaya leaderboard dan dashboard terlihat hidup.
// HANYA untuk percobaan. Pemakaian: npm run db:demo
import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const PASSWORD = 'demo1234';

try {
  await client.connect();
  const hash = await bcrypt.hash(PASSWORD, 10);

  const guru = (
    await client.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ('Guru Demo', 'guru.demo@sintesa.test', $1, 'GURU')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [hash]
    )
  ).rows[0];

  const kelas = (
    await client.query(
      `INSERT INTO classes (name, description, code, teacher_id)
       VALUES ('Kelas Demo RPL', 'Kelas contoh untuk percobaan', 'KELAS-DEMO1', $1)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [guru.id]
    )
  ).rows[0];

  const murid = [
    ['Andi Pratama', 300],
    ['Budi Santoso', 200],
    ['Citra Lestari', 100],
    ['Dewi Anggraini', 100],
    ['Eko Wibowo', 0],
  ];

  for (const [i, [name, xp]] of murid.entries()) {
    const email = `murid${i + 1}.demo@sintesa.test`;
    const u = (
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'MURID')
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name, email, hash]
      )
    ).rows[0];
    await client.query(
      'INSERT INTO class_members (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [kelas.id, u.id]
    );
    for (let k = 0; k < xp / 100; k += 1) {
      await client.query(
        `INSERT INTO xp_events (user_id, kind, amount, ref_id, note) VALUES ($1, 'MISSION', 100, $2, 'data demo')
         ON CONFLICT DO NOTHING`,
        [u.id, `demo-${k}`]
      );
    }
  }

  console.log('Data demo siap.');
  console.log(`  Guru : guru.demo@sintesa.test / ${PASSWORD}`);
  console.log(`  Murid: murid1.demo@sintesa.test ... murid5.demo@sintesa.test / ${PASSWORD}`);
} catch (err) {
  console.error('Gagal:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
