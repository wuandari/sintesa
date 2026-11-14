// Tes alur lengkap lewat HTTP (daftar, login, kelas, hak akses). Jalankan setelah `npm run build`:
//   npm run test:e2e
// Memakai database kosong khusus tes (lihat scripts/test-db.mjs).
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import bcrypt from 'bcryptjs';
import { prepareDatabase } from './test-db.mjs';

const PORT = 3100 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;
const { url, client, stop } = await prepareDatabase();

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
  env: { ...process.env, DATABASE_URL: url, AUTH_SECRET: 'e'.repeat(40), NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });

async function waitReady() {
  for (let i = 0; i < 60; i += 1) {
    try { const r = await fetch(`${BASE}/login`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server tidak siap.\n${serverLog}`);
}

const jar = () => ({ cookie: '' });
function remember(j, res) {
  const sc = res.headers.getSetCookie?.() ?? [];
  for (const c of sc) {
    const [pair] = c.split(';');
    const [name, value] = pair.split('=');
    if (/max-age=0/i.test(c) || value === '') j.cookie = ''; else j.cookie = `${name}=${value}`;
  }
}
async function req(path, { method = 'GET', body, form, j, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method, redirect: 'manual',
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(j?.cookie ? { cookie: j.cookie } : {}), ...headers },
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  if (j) remember(j, res);
  // React menyisipkan <!-- --> di antara teks dinamis; dibuang agar pencarian teks akurat.
  const text = (await res.text()).replace(/<!-- -->/g, '');
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, text, json, res, location: res.headers.get('location') };
}

let passed = 0; const failures = [];
async function test(name, fn) {
  try { await fn(); passed += 1; console.log(`  ok   ${name}`); }
  catch (err) { failures.push(name); console.log(`  GAGAL ${name}\n       ${err.message}`); }
}

try {
  await waitReady();
  const hash = await bcrypt.hash('guru1234', 10);
  await client.query("INSERT INTO users (name,email,password_hash,role) VALUES ('Bu Shela Guru','guru@e2e.id',$1,'GURU'),('Pak Lain Guru','guru2@e2e.id',$1,'GURU')", [hash]);

  const murid = jar(); const guru = jar(); const guru2 = jar(); const anon = jar();
  let classId; let classCode;

  console.log('Halaman publik');
  await test('landing tampil lengkap (gamifikasi, misi, cara kerja, leaderboard kosong)', async () => {
    const r = await req('/');
    assert.equal(r.status, 200);
    for (const t of ['Sintesa', 'Kelas 10 SMK · RPL', 'Kenapa belajar di Sintesa terasa seperti bermain?', 'Sistem Komputer &amp; Cara Kerja', 'Dari kelas hingga naik level dalam 3 langkah', 'Tugas dan arsip kini terpisah rapi', 'Daftar Gratis', 'Belum ada murid terdaftar']) {
      assert.ok(r.text.includes(t), `tidak ada teks: ${t}`);
    }
  });
  await test('login memiliki ikon mata (tampilkan password)', async () => {
    const r = await req('/login');
    assert.equal(r.status, 200); assert.ok(r.text.includes('Selamat datang')); assert.ok(r.text.includes('aria-label="Tampilkan password"')); assert.ok(r.text.includes('type="password"'));
  });
  await test('daftar memiliki ikon mata dan tulisan khusus murid', async () => {
    const r = await req('/register');
    assert.equal(r.status, 200); assert.ok(r.text.includes('Buat akun murid')); assert.ok(r.text.includes('Akun guru dibuatkan oleh admin')); assert.ok(r.text.includes('aria-label="Tampilkan password"'));
  });
  await test('halaman yang butuh login mengarahkan ke /login', async () => {
    for (const p of ['/siswa', '/guru', '/tugas', '/library', '/ar', '/guru/kelas/abc']) {
      const r = await req(p); assert.equal(r.status, 307, p); assert.ok(r.location.endsWith('/login'), p);
    }
  });

  console.log('Pendaftaran murid');
  await test('data tidak valid ditolak (400)', async () => {
    assert.equal((await req('/api/auth/register', { method: 'POST', body: { name: 'A', email: 'a@b.co', password: '123456' } })).status, 400);
    assert.equal((await req('/api/auth/register', { method: 'POST', body: { name: 'Ani', email: 'a@b.co', password: '123' } })).status, 400);
    assert.equal((await req('/api/auth/register', { method: 'POST', body: { name: 'Ani', email: 'salah', password: '123456' } })).status, 400);
  });
  await test('daftar berhasil: sesi dibuat (HttpOnly) dan arah ke /siswa', async () => {
    const r = await req('/api/auth/register', { method: 'POST', j: murid, body: { name: 'Wulan Dari', email: 'Wulan@E2E.id', password: 'rahasia1' } });
    assert.equal(r.status, 201); assert.equal(r.json.redirect, '/siswa');
    const sc = r.res.headers.getSetCookie().join(';'); assert.match(sc, /HttpOnly/i); assert.match(sc, /sintesa_session=/);
  });
  await test('peran dari pendaftaran selalu MURID, meski dikirim role=GURU', async () => {
    const r = await req('/api/auth/register', { method: 'POST', body: { name: 'Nakal Sekali', email: 'nakal@e2e.id', password: 'rahasia1', role: 'GURU' } });
    assert.equal(r.status, 201);
    assert.equal((await client.query("SELECT role FROM users WHERE email='nakal@e2e.id'")).rows[0].role, 'MURID');
  });
  await test('email sama (beda huruf besar) ditolak 409', async () => {
    assert.equal((await req('/api/auth/register', { method: 'POST', body: { name: 'Dobel', email: 'wulan@e2e.id', password: 'rahasia1' } })).status, 409);
  });

  console.log('Dashboard murid');
  await test('/siswa menampilkan level, XP, badge, leaderboard', async () => {
    const r = await req('/siswa', { j: murid });
    assert.equal(r.status, 200);
    for (const t of ['Halo, Wulan', 'Level 1 — Penjelajah Baru', '500 XP lagi naik level', '0/6 badge', 'Badge Koleksiku', 'Langkah Pertama', 'Bintang AR', 'Lanjut ke Mana?', 'Wulan Dari (kamu)']) {
      assert.ok(r.text.includes(t), `tidak ada teks: ${t}`);
    }
  });
  await test('murid membuka /guru dialihkan ke /siswa', async () => {
    const r = await req('/guru', { j: murid }); assert.equal(r.status, 307); assert.ok(r.location.endsWith('/siswa'));
  });
  await test('/login & /register untuk yang sudah masuk dialihkan ke dashboard', async () => {
    const r = await req('/login', { j: murid }); assert.equal(r.status, 307); assert.ok(r.location.endsWith('/siswa'));
  });
  await test('murid tidak bisa membuat kelas (403), tamu 401', async () => {
    assert.equal((await req('/api/classes', { method: 'POST', j: murid, body: { name: 'Kelas Gelap' } })).status, 403);
    assert.equal((await req('/api/classes', { method: 'POST', body: { name: 'Kelas Gelap' } })).status, 401);
  });

  console.log('Login');
  await test('password salah 401, email tak dikenal 401 (pesan sama)', async () => {
    const a = await req('/api/auth/login', { method: 'POST', body: { email: 'wulan@e2e.id', password: 'salah' } });
    const b = await req('/api/auth/login', { method: 'POST', body: { email: 'tidak@ada.id', password: 'salah' } });
    assert.equal(a.status, 401); assert.equal(b.status, 401); assert.equal(a.json.message, b.json.message);
  });
  await test('login guru diarahkan ke /guru', async () => {
    const r = await req('/api/auth/login', { method: 'POST', j: guru, body: { email: 'GURU@e2e.id', password: 'guru1234' } });
    assert.equal(r.status, 200); assert.equal(r.json.redirect, '/guru');
    await req('/api/auth/login', { method: 'POST', j: guru2, body: { email: 'guru2@e2e.id', password: 'guru1234' } });
  });
  await test('login murid diarahkan ke /siswa', async () => {
    const j = jar();
    const r = await req('/api/auth/login', { method: 'POST', j, body: { email: 'wulan@e2e.id', password: 'rahasia1' } });
    assert.equal(r.status, 200); assert.equal(r.json.redirect, '/siswa');
  });
  await test('cookie dipalsukan ditolak dan dibersihkan', async () => {
    const r = await req('/siswa', { j: { cookie: 'sintesa_session=abc.def.ghi' } });
    assert.equal(r.status, 307); assert.ok(r.location.endsWith('/login'));
  });

  console.log('Kelas oleh guru');
  await test('guru membuat kelas dan mendapat kode', async () => {
    const r = await req('/api/classes', { method: 'POST', j: guru, body: { name: 'RPL 10-A', description: 'Kelas uji' } });
    assert.equal(r.status, 201); assert.match(r.json.code, /^KELAS-[A-Z0-9]{5}$/);
    classId = r.json.id; classCode = r.json.code;
    assert.equal((await req('/api/classes', { method: 'POST', j: guru, body: { name: 'x' } })).status, 400);
  });
  await test('/guru menampilkan kelas, ringkasan, dan form', async () => {
    const r = await req('/guru', { j: guru });
    assert.equal(r.status, 200);
    for (const t of ['Halo, Bu', 'Pantau progres game kelasmu', 'RPL 10-A', classCode, 'Buat Kelas Baru', 'Daftar Kelas', 'Kelola']) assert.ok(r.text.includes(t), `tidak ada teks: ${t}`);
  });
  await test('guru tidak bisa bergabung ke kelas (403)', async () => {
    assert.equal((await req('/api/classes/join', { method: 'POST', j: guru, body: { code: classCode } })).status, 403);
  });

  console.log('Murid bergabung ke kelas');
  await test('kode salah 404, kosong 400, benar 200, ulang -> sudah ada', async () => {
    assert.equal((await req('/api/classes/join', { method: 'POST', j: murid, body: { code: 'KELAS-ZZZZZ' } })).status, 404);
    assert.equal((await req('/api/classes/join', { method: 'POST', j: murid, body: { code: '' } })).status, 400);
    const ok = await req('/api/classes/join', { method: 'POST', j: murid, body: { code: classCode.toLowerCase() } });
    assert.equal(ok.status, 200); assert.equal(ok.json.already, false);
    const again = await req('/api/classes/join', { method: 'POST', j: murid, body: { code: classCode } });
    assert.equal(again.json.already, true);
  });
  await test('halaman kelas guru menampilkan siswa yang bergabung', async () => {
    const r = await req(`/guru/kelas/${classId}`, { j: guru });
    assert.equal(r.status, 200); assert.ok(r.text.includes('RPL 10-A')); assert.ok(r.text.includes('Wulan Dari')); assert.ok(r.text.includes('wulan@e2e.id')); assert.ok(r.text.includes(classCode));
  });
  await test('guru lain dan id ngawur mendapat 404', async () => {
    assert.equal((await req(`/guru/kelas/${classId}`, { j: guru2 })).status, 404);
    assert.equal((await req('/guru/kelas/bukan-uuid', { j: guru })).status, 404);
  });

  console.log('XP tampil di leaderboard');
  await test('XP murid muncul di dashboard, landing, dan dashboard guru', async () => {
    const uid = (await client.query("SELECT id FROM users WHERE email='wulan@e2e.id'")).rows[0].id;
    await client.query("INSERT INTO xp_events (user_id,kind,amount,ref_id) VALUES ($1,'MISSION',100,'m1'),($1,'MISSION',100,'m2'),($1,'MISSION',100,'m3'),($1,'MISSION',100,'m4'),($1,'MISSION',100,'m5')", [uid]);
    const s = await req('/siswa', { j: murid });
    for (const t of ['Level 2 — Petualang Sintesa', '3/6 badge']) assert.ok(s.text.includes(t), `siswa: ${t}`);
    assert.ok(s.text.includes('500 XP'));
    const l = await req('/'); assert.ok(l.text.includes('Wulan Dari')); assert.ok(l.text.includes('500 XP'));
    const g = await req('/guru', { j: guru }); assert.ok(g.text.includes('Wulan Dari · 500 XP'));
  });

  console.log('Misi AR, kuis, popup komponen');
  const { CONTENT } = await import('../src/data/missionContent.js');
  const xpNow = async () => (await client.query("SELECT COALESCE(SUM(amount),0)::int AS s FROM xp_events WHERE user_id=(SELECT id FROM users WHERE email='wulan@e2e.id')")).rows[0].s;
  await test('/ar: hero, kategori, daftar misi, detail (Misi/Materi/Soal) tanpa kunci jawaban; tautan lama dialihkan', async () => {
    const list = await req('/ar', { j: murid });
    assert.equal(list.status, 200);
    for (const t of ['Pilih misimu, pelajari materinya, jawab soalnya.', 'Semua · Kelas 10 RPL', 'Dasar-dasar PPLG', 'Sistem Komputer', 'Mode 3D aktif', 'Materi (3)', 'Soal (5)', 'Materi AR dari gurumu', 'Gabung Kelas Baru']) assert.ok(list.text.includes(t), t);
    const sel = await req('/ar?m=keamanan-data', { j: murid });
    assert.ok(sel.text.includes('Misi: Sebutkan 3 praktik keamanan data')); assert.equal(sel.text.includes('"jawab"'), false);
    const cat = await req('/ar?k=Informatika', { j: murid }); assert.equal(cat.text.includes('Alat Kerja Seorang Programmer'), false);
    const old = await req('/ar/sistem-komputer', { j: murid }); assert.equal(old.status, 307); assert.ok(old.location.includes('/ar?m=sistem-komputer'));
  });
  await test('file model 3D tersedia untuk semua misi', async () => {
    for (const slug of Object.keys(CONTENT)) { const r = await fetch(`${BASE}/models/${slug}.glb`); assert.equal(r.status, 200, slug); }
  });
  await test('popup komponen: butuh login, komponen valid → info bawaan, tak dikenal → 404', async () => {
    assert.equal((await req('/api/ar/komponen-info', { method: 'POST', body: { mission: 'sistem-komputer', part: 'CPU' } })).status, 401);
    const ok = await req('/api/ar/komponen-info', { method: 'POST', j: murid, body: { mission: 'sistem-komputer', part: 'CPU' } });
    assert.equal(ok.status, 200); assert.ok(ok.json.info.length > 20); assert.equal(ok.json.source, 'BAWAAN');
    assert.equal((await req('/api/ar/komponen-info', { method: 'POST', j: murid, body: { mission: 'sistem-komputer', part: 'Roket' } })).status, 404);
  });
  await test('kuis = latihan (0 XP); cek jawaban per soal; tandai selesai butuh misi dibagikan + lulus latihan', async () => {
    const before = await xpNow();
    const ck = await req('/api/missions/sistem-komputer/check', { method: 'POST', j: murid, body: { q: 0, a: 0 } });
    assert.equal(ck.status, 200); assert.equal(ck.json.correct, true); assert.ok(ck.json.explanation);
    assert.equal((await req('/api/missions/sistem-komputer/check', { method: 'POST', j: murid, body: { q: 99, a: 0 } })).status, 400);
    const bad = await req('/api/missions/sistem-komputer/quiz', { method: 'POST', j: murid, body: { answers: [9, 9, 9, 9, 9] } });
    assert.equal(bad.json.passed, false);
    const ans = CONTENT['sistem-komputer'].soal.map((q) => q.jawab);
    const good = await req('/api/missions/sistem-komputer/quiz', { method: 'POST', j: murid, body: { answers: ans } });
    assert.equal(good.json.passed, true); assert.equal(await xpNow(), before);
    assert.equal((await req('/api/missions/sistem-komputer/complete', { method: 'POST', j: murid })).status, 403);
    assert.equal((await req('/api/missions/sistem-komputer/quiz', { method: 'POST', j: guru, body: { answers: ans } })).status, 403);
    assert.equal((await req('/api/missions/sistem-komputer/quiz', { method: 'POST', body: { answers: ans } })).status, 401);
    assert.equal((await req(`/api/classes/${classId}/missions`, { method: 'POST', j: guru, body: { slug: 'sistem-komputer' } })).status, 200);
    const done = await req('/api/missions/sistem-komputer/complete', { method: 'POST', j: murid });
    assert.equal(done.json.xpGained, 100); assert.equal(await xpNow(), before + 100);
    assert.equal((await req('/api/missions/sistem-komputer/complete', { method: 'POST', j: murid })).json.xpGained, 0);
    assert.equal((await req('/api/missions/keamanan-data/complete', { method: 'POST', j: murid })).status, 403);
  });
  await test('guru menugaskan misi ke kelas → muncul "Dari guru" di /ar murid; guru lain ditolak', async () => {
    assert.equal((await req(`/api/classes/${classId}/missions`, { method: 'POST', j: guru2, body: { slug: 'keamanan-data' } })).status, 404);
    assert.equal((await req(`/api/classes/${classId}/missions`, { method: 'POST', j: murid, body: { slug: 'keamanan-data' } })).status, 403);
    assert.equal((await req(`/api/classes/${classId}/missions`, { method: 'POST', j: guru, body: { slug: 'keamanan-data' } })).status, 200);
    assert.ok((await req('/ar', { j: murid })).text.includes('Keamanan Data &amp; Proteksi')); assert.ok((await req('/ar', { j: murid })).text.includes('Belum dibuka'));
    assert.ok((await req(`/guru/kelas/${classId}`, { j: guru })).text.includes('Sudah dibagikan'));
  });

  await test('materi AR buatan guru: unggah GLB, tampil di kelas murid, info komponen, tandai selesai +100 XP', async () => {
    const glb = new Uint8Array(await (await import('node:fs/promises')).readFile('public/models/sistem-komputer.glb'));
    const mk = (extra = {}, name = 'jantung.glb') => { const f = new FormData(); f.append('title', 'Anatomi Jantung'); f.append('subject', 'Informatika'); Object.entries(extra).forEach(([k, v]) => f.append(k, v)); f.append('model', new File([glb], name)); return f; };
    assert.equal((await req(`/api/classes/${classId}/materi`, { method: 'POST', j: murid, form: mk() })).status, 403);
    assert.equal((await req(`/api/classes/${classId}/materi`, { method: 'POST', j: guru2, form: mk() })).status, 404);
    assert.equal((await req(`/api/classes/${classId}/materi`, { method: 'POST', j: guru, form: mk({}, 'bukan.pdf') })).status, 400);
    const up = await req(`/api/classes/${classId}/materi`, { method: 'POST', j: guru, form: mk() });
    assert.equal(up.status, 200); const mid = up.json.id;
    assert.ok((await req('/ar', { j: murid })).text.includes('Anatomi Jantung'));
    const page = await req(`/ar/materi/${mid}`, { j: murid }); assert.equal(page.status, 200); assert.ok(page.text.includes('Tandai Selesai'));
    const out = jar(); await req('/api/auth/register', { method: 'POST', j: out, body: { name: 'Orang Lain', email: 'lain@e2e.id', password: 'rahasia1' } });
    assert.equal((await req(`/ar/materi/${mid}`, { j: out })).status, 404);
    const info = await req('/api/ar/komponen-info', { method: 'POST', j: murid, body: { mission: `c-${mid}`, part: 'Bilik Kiri' } });
    assert.equal(info.status, 200); assert.equal(info.json.source, 'BAWAAN');
    assert.equal((await req('/api/ar/komponen-info', { method: 'POST', j: out, body: { mission: `c-${mid}`, part: 'Bilik Kiri' } })).status, 404);
    const before = await xpNow();
    assert.equal((await req(`/api/missions/c-${mid}/complete`, { method: 'POST', j: murid })).json.xpGained, 100);
    assert.equal((await req(`/api/missions/c-${mid}/complete`, { method: 'POST', j: murid })).json.xpGained, 0);
    assert.equal(await xpNow(), before + 100);
    assert.equal((await req(`/api/materi/${mid}`, { method: 'DELETE', j: guru2 })).status, 404);
    assert.equal((await req(`/api/materi/${mid}`, { method: 'DELETE', j: guru })).status, 200);
  });

  console.log('Tugas, kumpul, revisi XP, penilaian');
  let taskId; let subId;
  const mkForm = (obj, files = []) => { const f = new FormData(); for (const [k, v] of Object.entries(obj)) f.append(k, v); for (const [n, c] of files) f.append('files', new File([c], n)); return f; };
  await test('guru membuat tugas (poin 200) dengan lampiran; murid tak boleh; poin tak valid ditolak', async () => {
    const base = { class_id: classId, title: 'Flowchart Login', description: 'Buat flowchart', points: '200' };
    assert.equal((await req('/api/tasks', { method: 'POST', j: murid, form: mkForm(base) })).status, 403);
    assert.equal((await req('/api/tasks', { method: 'POST', j: guru, form: mkForm({ ...base, points: '0' }) })).status, 400);
    assert.equal((await req('/api/tasks', { method: 'POST', j: guru2, form: mkForm(base) })).status, 404);
    const ok = await req('/api/tasks', { method: 'POST', j: guru, form: mkForm(base, [['panduan.pdf', 'isi panduan']]) });
    assert.equal(ok.status, 200); taskId = ok.json.id;
  });
  await test('tugas tampil di /tugas murid dan detailnya; murid luar kelas dapat 404', async () => {
    const l = await req('/tugas', { j: murid }); assert.ok(l.text.includes('Flowchart Login')); assert.ok(l.text.includes('Belum dikumpulkan'));
    const d = await req(`/tugas/${taskId}`, { j: murid }); assert.equal(d.status, 200); assert.ok(d.text.includes('panduan.pdf')); assert.ok(d.text.includes('Kumpulkan tugas'));
    const out = jar(); await req('/api/auth/register', { method: 'POST', j: out, body: { name: 'Orang Luar', email: 'luar@e2e.id', password: 'rahasia1' } });
    assert.equal((await req(`/tugas/${taskId}`, { j: out })).status, 404);
    assert.equal((await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: out, form: mkForm({}, [['a.pdf', 'x']]) })).status, 404);
  });
  await test('validasi unggah: tanpa file, jenis .exe, >15 MB ditolak', async () => {
    assert.equal((await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}) })).status, 400);
    assert.equal((await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}, [['jahat.exe', 'x']]) })).status, 400);
    const big = new FormData(); big.append('files', new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'besar.pdf'));
    assert.equal((await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: big })).status, 400);
  });
  await test('kumpul pertama: +200 XP penuh', async () => {
    const before = await xpNow();
    const r = await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}, [['jawaban.pdf', 'versi 1']]) });
    assert.equal(r.status, 200); assert.equal(r.json.revision, 0); assert.equal(await xpNow(), before + 200);
    subId = r.json.submissionId;
  });
  await test('revisi: XP tugas berkurang 20% tiap revisi (200→160→120→80→40→40)', async () => {
    const start = await xpNow();
    const expectLost = [40, 80, 120, 160, 160];
    for (let n = 1; n <= 5; n += 1) {
      const r = await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}, [[`rev${n}.pdf`, `v${n}`]]) });
      assert.equal(r.status, 200); assert.equal(r.json.revision, n);
      assert.equal(await xpNow(), start - expectLost[n - 1] + 0, `revisi ${n}`);
    }
    const d = await req(`/tugas/${taskId}`, { j: murid });
    assert.ok(d.text.includes('XP tugas ini sekarang')); assert.ok(d.text.includes('revisi dilakukan: 5'));
  });
  await test('guru melihat kiriman, minta revisi lalu menilai; murid tidak bisa menilai', async () => {
    const page = await req(`/tugas/${taskId}`, { j: guru });
    assert.equal(page.status, 200); assert.ok(page.text.includes('Wulan Dari')); assert.ok(page.text.includes('rev5.pdf'));
    assert.equal((await req(`/tugas/${taskId}`, { j: guru2 })).status, 404);
    const fid = (await client.query("SELECT id FROM submission_files WHERE submission_id=$1 AND revision=5", [subId])).rows[0].id;
    assert.equal((await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: murid, body: { action: 'grade', files: [{ id: fid, score: 100 }] } })).status, 403);
    assert.equal((await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: guru2, body: { action: 'grade', files: [{ id: fid, score: 100 }] } })).status, 404);
    assert.equal((await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: guru, body: { action: 'grade', files: [{ id: fid, score: 101 }] } })).status, 400);
    assert.equal((await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: guru, body: { action: 'revise', files: [] } })).status, 400);
    assert.equal((await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: guru, body: { action: 'revise', feedback: 'Tambah alur gagal login', files: [] } })).json.status, 'REVISION_REQUESTED');
    assert.ok((await req(`/tugas/${taskId}`, { j: murid })).text.includes('Tambah alur gagal login'));
    const r6 = await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}, [['rev6.pdf', 'v6']]) });
    assert.equal(r6.status, 200);
    const fid2 = (await client.query("SELECT id FROM submission_files WHERE submission_id=$1 AND revision=6", [subId])).rows[0].id;
    const g = await req(`/api/submissions/${subId}/grade`, { method: 'POST', j: guru, body: { action: 'grade', files: [{ id: fid2, score: 92, feedback: 'Rapi' }], feedback: 'Bagus' } });
    assert.equal(g.json.score, 92);
    const after = await req(`/api/tasks/${taskId}/submit`, { method: 'POST', j: murid, form: mkForm({}, [['lagi.pdf', 'x']]) });
    assert.equal(after.status, 409);
    const d = await req(`/tugas/${taskId}`, { j: murid }); assert.ok(d.text.includes('Sudah dinilai')); assert.ok(d.text.includes('92'));
  });
  await test('total XP murid sesuai: 500 + 100 (misi bawaan) + 100 (materi guru) + 40 (sisa XP tugas 20% dari 200)', async () => {
    assert.equal(await xpNow(), 500 + 100 + 100 + 40);
  });
  await test('dashboard guru menghitung tugas; daftar tugas guru memuat tugas', async () => {
    const g = await req('/guru', { j: guru }); assert.ok(g.text.includes('Tugas (1)')); assert.ok((await req(`/guru/kelas/${classId}`, { j: guru })).text.includes('Library Materi AR'));
    assert.ok((await req('/tugas', { j: guru })).text.includes('Flowchart Login'));
  });

  console.log('Library & foto profil');
  await test('library: unggah, cari, filter, hapus; file orang lain tidak terlihat', async () => {
    assert.equal((await req('/api/library', { method: 'POST', form: mkForm({}, [['a.pdf', 'x']]) })).status, 401);
    const up = await req('/api/library', { method: 'POST', j: murid, form: mkForm({}, [['catatan-ar.pdf', 'isi'], ['sketsa.png', 'png']]) });
    assert.equal(up.status, 200); assert.equal(up.json.count, 2);
    const xpBefore = await xpNow();
    const page = await req('/library', { j: murid }); assert.ok(page.text.includes('catatan-ar.pdf')); assert.ok(page.text.includes('sketsa.png'));
    assert.ok((await req('/library?q=catatan', { j: murid })).text.includes('catatan-ar.pdf'));
    assert.equal((await req('/library?q=catatan', { j: murid })).text.includes('sketsa.png'), false);
    assert.equal((await req('/library?type=gambar', { j: murid })).text.includes('catatan-ar.pdf'), false);
    assert.ok((await req('/library', { j: guru })).text.includes('catatan-ar.pdf')); // guru kelasnya memantau arsip siswa
    assert.equal((await req('/library', { j: guru2 })).text.includes('catatan-ar.pdf'), false); // guru lain tidak bisa
    assert.equal(await xpNow(), xpBefore);
    const lid = (await client.query("SELECT id FROM library_files WHERE name='catatan-ar.pdf'")).rows[0].id;
    assert.equal((await req(`/api/library/${lid}`, { method: 'DELETE', j: guru })).status, 404);
    assert.equal((await req(`/api/library/${lid}`, { method: 'DELETE', j: murid })).status, 200);
  });
  await test('file lokal bisa diunduh setelah login, tidak bisa tanpa login atau lewat ../', async () => {
    const url = (await client.query("SELECT url FROM library_files WHERE name='sketsa.png'")).rows[0].url;
    assert.equal((await fetch(BASE + url)).status, 401);
    const ok = await fetch(BASE + url, { headers: { cookie: murid.cookie } }); assert.equal(ok.status, 200);
    assert.equal((await fetch(`${BASE}/api/files/..%2F..%2Fpackage.json`, { headers: { cookie: murid.cookie } })).status, 404);
  });
  await test('foto profil: hanya gambar ≤2 MB; tampil di /profil', async () => {
    const bad = new FormData(); bad.append('avatar', new File(['x'], 'a.pdf'));
    assert.equal((await req('/api/profile/avatar', { method: 'POST', j: murid, form: bad })).status, 400);
    const big = new FormData(); big.append('avatar', new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'b.png'));
    assert.equal((await req('/api/profile/avatar', { method: 'POST', j: murid, form: big })).status, 400);
    const ok = new FormData(); ok.append('avatar', new File([new Uint8Array(100)], 'me.png', { type: 'image/png' }));
    const r = await req('/api/profile/avatar', { method: 'POST', j: murid, form: ok }); assert.equal(r.status, 200);
    assert.ok((await req('/profil', { j: murid })).text.includes('avatar-img'));
  });

  console.log('Keluar');
  await test('logout menghapus sesi', async () => {
    assert.equal((await req('/api/auth/logout', { method: 'POST', j: murid })).status, 200);
    const r = await req('/siswa', { j: murid }); assert.equal(r.status, 307);
  });

  console.log('Pembatas percobaan login');
  await test('percobaan salah berulang akhirnya diblokir (429)', async () => {
    let last = 0;
    for (let i = 0; i < 12; i += 1) last = (await req('/api/auth/login', { method: 'POST', body: { email: 'brute@e2e.id', password: 'x' + i } })).status;
    assert.equal(last, 429);
  });
} finally {
  server.kill('SIGTERM');
  await client.end().catch(() => {});
  await stop();
}

console.log(`\n${passed} lulus, ${failures.length} gagal`);
if (failures.length) { console.log('Gagal:', failures.join(' | ')); console.log('--- log server ---\n' + serverLog.slice(-1500)); process.exit(1); }
