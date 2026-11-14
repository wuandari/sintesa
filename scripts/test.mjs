// Tes logika inti (database sungguhan). Jalankan: npm test
import assert from 'node:assert/strict';
import { prepareDatabase } from './test-db.mjs';

const { url, client, stop } = await prepareDatabase();
process.env.DATABASE_URL = url;
process.env.AUTH_SECRET = 'x'.repeat(40);

const { getLevel, computeBadges } = await import('../src/lib/gamification.js');
const users = await import('../src/lib/users.js');
const classes = await import('../src/lib/classes.js');
const { signToken, verifyToken } = await import('../src/lib/token.js');
const { runMigrations } = await import('./migrate-lib.mjs');
const { getPool } = await import('../src/lib/db.js');

let passed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed += 1; console.log(`  ok   ${name}`); }
  catch (err) { failures.push(name); console.log(`  GAGAL ${name}\n       ${err.message}`); }
}

console.log('Gamifikasi');
await test('level 1 saat 0 XP, butuh 500 lagi', () => {
  const l = getLevel(0);
  assert.equal(l.level, 1); assert.equal(l.remaining, 500); assert.equal(l.progress, 0); assert.equal(l.isMax, false);
});
await test('progress 50% di 250 XP', () => assert.equal(getLevel(250).progress, 50));
await test('level 2 mulai 500 XP, level 3 mulai 2000 XP (MAX)', () => {
  assert.equal(getLevel(499).level, 1); assert.equal(getLevel(500).level, 2);
  assert.equal(getLevel(1999).level, 2);
  const m = getLevel(2000); assert.equal(m.level, 3); assert.equal(m.isMax, true); assert.equal(m.progress, 100);
  assert.equal(getLevel(99999).level, 3);
});
await test('XP negatif / aneh tidak merusak level', () => {
  assert.equal(getLevel(-50).xp, 0); assert.equal(getLevel(NaN).level, 1); assert.equal(getLevel(undefined).level, 1);
});
await test('badge sesuai syarat', () => {
  const none = computeBadges({ xp: 0, missions: 0, tasks: 0 });
  assert.equal(none.filter((b) => b.earned).length, 0); assert.equal(none.length, 6);
  const some = Object.fromEntries(computeBadges({ xp: 500, missions: 3, tasks: 1 }).map((b) => [b.id, b.earned]));
  assert.deepEqual(some, { 'langkah-pertama': true, 'penjelajah-3d': true, 'master-materi': false, 'pengumpul-tugas': true, 'pejuang-tugas': false, 'bintang-ar': true });
});

console.log('Validasi pendaftaran');
await test('data valid dirapikan (nama, email huruf kecil)', () => {
  const v = users.validateRegistration({ name: '  Siti   Aminah ', email: '  SITI@Mail.COM ', password: 'rahasia1' });
  assert.deepEqual(v.value, { name: 'Siti Aminah', email: 'siti@mail.com', password: 'rahasia1' });
});
await test('menolak nama pendek, email salah, password pendek/panjang', () => {
  assert.ok(users.validateRegistration({ name: 'A', email: 'a@b.co', password: '123456' }).error);
  assert.ok(users.validateRegistration({ name: 'Ani', email: 'bukan-email', password: '123456' }).error);
  assert.ok(users.validateRegistration({ name: 'Ani', email: 'a@b.co', password: '12345' }).error);
  assert.ok(users.validateRegistration({ name: 'Ani', email: 'a@b.co', password: 'x'.repeat(73) }).error);
  assert.ok(users.validateRegistration(null).error);
});

console.log('Akun & login');
let murid; let guru;
await test('membuat murid, password tersimpan sebagai hash', async () => {
  murid = await users.createUser({ name: 'Murid Satu', email: 'murid1@test.id', password: 'rahasia1', role: 'MURID' });
  assert.ok(murid.id); assert.equal(murid.role, 'MURID');
  const row = (await client.query('SELECT password_hash FROM users WHERE id = $1', [murid.id])).rows[0];
  assert.notEqual(row.password_hash, 'rahasia1'); assert.match(row.password_hash, /^\$2[aby]\$/);
});
await test('email ganda ditolak dengan kode EMAIL_TAKEN', async () => {
  await assert.rejects(users.createUser({ name: 'Lain', email: 'murid1@test.id', password: 'rahasia1', role: 'MURID' }), (e) => e.code === 'EMAIL_TAKEN');
});
await test('peran di luar daftar ditolak database', async () => {
  await assert.rejects(client.query("INSERT INTO users (name,email,password_hash,role) VALUES ('x','x@x.id','h','HACKER')"));
});
await test('login berhasil, email tidak peka huruf besar/kecil', async () => {
  const u = await users.authenticate('  MURID1@test.id ', 'rahasia1');
  assert.equal(u.id, murid.id); assert.equal(u.password_hash, undefined);
});
await test('login gagal: password salah / email tak terdaftar / kosong', async () => {
  assert.equal(await users.authenticate('murid1@test.id', 'salah'), null);
  assert.equal(await users.authenticate('tidak@ada.id', 'rahasia1'), null);
  assert.equal(await users.authenticate('', ''), null);
});
await test('token sesi: sah, rusak, dan dipalsukan ditolak', async () => {
  const t = await signToken(murid);
  const p = await verifyToken(t);
  assert.equal(p.sub, murid.id); assert.equal(p.role, 'MURID');
  assert.equal(await verifyToken(t.slice(0, -3) + 'abc'), null);
  assert.equal(await verifyToken('sampah'), null);
});

console.log('Kelas');
guru = await users.createUser({ name: 'Bu Guru', email: 'guru@test.id', password: 'rahasia1', role: 'GURU' });
const guru2 = await users.createUser({ name: 'Pak Guru', email: 'guru2@test.id', password: 'rahasia1', role: 'GURU' });
let kelas;
await test('validasi nama kelas', () => {
  assert.ok(classes.validateClass({ name: 'A' }).error);
  assert.ok(classes.validateClass({ name: 'RPL 10-A', description: 'x'.repeat(301) }).error);
  assert.deepEqual(classes.validateClass({ name: ' RPL  10-A ', description: '' }).value, { name: 'RPL 10-A', description: null });
});
await test('kode kelas berformat KELAS-XXXXX dan unik', async () => {
  kelas = await classes.createClass(guru.id, { name: 'RPL 10-A', description: null });
  assert.match(kelas.code, /^KELAS-[A-HJ-NP-Z2-9]{5}$/);
  const codes = new Set();
  for (let i = 0; i < 30; i += 1) codes.add((await classes.createClass(guru.id, { name: `K${i}`, description: null })).code);
  assert.equal(codes.size, 30);
});
await test('murid bergabung: kode huruf kecil & tanpa awalan KELAS- juga diterima', async () => {
  const r = await classes.joinClass(murid.id, kelas.code.toLowerCase());
  assert.equal(r.already, false); assert.equal(r.class.id, kelas.id);
  const r2 = await classes.joinClass(murid.id, kelas.code.replace('KELAS-', ''));
  assert.equal(r2.already, true);
});
await test('kode salah / kosong ditolak', async () => {
  assert.equal((await classes.joinClass(murid.id, 'KELAS-ZZZZZ')).status, 404);
  assert.equal((await classes.joinClass(murid.id, '  ')).status, 400);
});
await test('daftar kelas guru, murid, dan jumlah siswa', async () => {
  const g = await classes.classesForTeacher(guru.id);
  assert.equal(g.length, 31); assert.equal(g.find((c) => c.id === kelas.id).student_count, 1);
  const s = await classes.classesForStudent(murid.id);
  assert.equal(s.length, 1); assert.equal(s[0].id, kelas.id);
});
await test('guru lain / id ngawur tidak bisa membuka kelas', async () => {
  assert.ok(await classes.getClassForTeacher(kelas.id, guru.id));
  assert.equal(await classes.getClassForTeacher(kelas.id, guru2.id), null);
  assert.equal(await classes.getClassForTeacher('bukan-uuid', guru.id), null);
});
await test('ringkasan guru & daftar siswa kelas', async () => {
  assert.deepEqual(await users.leaderboard(1).then(() => classes.teacherSummary(guru.id)), { classes: 31, students: 1 });
  const st = await classes.classStudents(kelas.id);
  assert.equal(st.length, 1); assert.equal(st[0].name, 'Murid Satu'); assert.equal(st[0].xp, 0);
});

console.log('XP & leaderboard');
const m2 = await users.createUser({ name: 'Murid Dua', email: 'murid2@test.id', password: 'rahasia1', role: 'MURID' });
const m3 = await users.createUser({ name: 'Murid Tiga', email: 'murid3@test.id', password: 'rahasia1', role: 'MURID' });
const addXp = (uid, kind, amount, ref) => client.query('INSERT INTO xp_events (user_id, kind, amount, ref_id) VALUES ($1,$2,$3,$4)', [uid, kind, amount, ref]);
await test('XP yang sama tidak bisa diberikan dua kali', async () => {
  await addXp(m2.id, 'MISSION', 100, 'misi-a');
  await assert.rejects(addXp(m2.id, 'MISSION', 100, 'misi-a'), (e) => e.code === '23505');
});
await test('peringkat: XP terbanyak di atas, seri urut siapa lebih dulu daftar, guru tidak ikut', async () => {
  await addXp(m3.id, 'MISSION', 100, 'misi-a');
  await addXp(m3.id, 'TASK', 250, 'tugas-1');
  const b = await users.leaderboard(10);
  assert.deepEqual(b.map((r) => [r.name, r.xp]), [['Murid Tiga', 350], ['Murid Dua', 100], ['Murid Satu', 0]]);
  await addXp(murid.id, 'MISSION', 100, 'misi-a');
  const b2 = await users.leaderboard(10);
  assert.deepEqual(b2.map((r) => r.name), ['Murid Tiga', 'Murid Satu', 'Murid Dua']); // seri 100: Satu daftar lebih dulu
});
await test('statistik murid: XP per sumber dan jumlah misi/tugas', async () => {
  const s = await users.studentStats(m3.id);
  assert.deepEqual(s, { xp: 350, mission_xp: 100, task_xp: 250, missions: 1, tasks: 1 });
  assert.deepEqual(await users.studentStats(guru.id), { xp: 0, mission_xp: 0, task_xp: 0, missions: 0, tasks: 0 });
});
await test('pengurangan XP revisi tidak membuat total di bawah 0', async () => {
  await addXp(m2.id, 'REVISION', -500, 'rev-1');
  assert.equal((await users.studentStats(m2.id)).xp, 0);
  assert.equal((await users.leaderboard(10)).find((r) => r.id === m2.id).xp, 0);
});

console.log('Tahap 2-6: XP revisi, kuis, tugas, library');
const { taskXp, revisionDelta } = await import('../src/lib/xp.js');
const tasksLib = await import('../src/lib/tasks.js');
const missionsLib = await import('../src/lib/missions.js');
const libLib = await import('../src/lib/library.js');
const { gradeQuiz, CONTENT, publicContent, pairGame, checkPairs, getContent } = await import('../src/data/missionContent.js');
const { checkFile, safeName } = await import('../src/lib/storage.js');

await test('rumus XP revisi: 100 poin → 100,80,60,40,20,20,20', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((n) => taskXp(100, n)), [100, 80, 60, 40, 20, 20, 20]);
});
await test('batas bawah 20% dan selisih revisi', () => {
  assert.equal(taskXp(250, 99), 50);
  assert.equal(revisionDelta(100, 1), -20); assert.equal(revisionDelta(100, 4), -20);
  assert.equal(revisionDelta(100, 5), 0); assert.equal(revisionDelta(100, 8), 0);
  assert.equal(taskXp(0, 3), 0); assert.equal(taskXp(10000, 0), 10000);
});
await test('kuis: nilai, lulus ≥60, kunci jawaban tidak bocor ke publik', () => {
  const slug = 'sistem-komputer';
  const all = gradeQuiz(slug, CONTENT[slug].soal.map((q) => q.jawab));
  assert.equal(all.score, 100); assert.equal(all.passed, true);
  const none = gradeQuiz(slug, [9, 9, 9, 9, 9]);
  assert.equal(none.score, 0); assert.equal(none.passed, false);
  assert.equal(gradeQuiz(slug, CONTENT[slug].soal.map((q, i) => (i < 3 ? q.jawab : 9))).passed, true);
  assert.equal(JSON.stringify(publicContent(slug)).includes('jawab'), false);
  assert.equal(gradeQuiz('tidak-ada', []), null);
});
await test('game hubungkan komponen: dicek di server, kunci tidak bocor, EN/ID', () => {
  for (const slug of Object.keys(CONTENT)) {
    const g = pairGame(slug);
    assert.ok(g.parts.length >= 5 && g.parts.length <= 7, slug);
    assert.equal(g.options.length, g.parts.length);
    // cari pilihan benar lewat teks fungsi (urutan pilihan sengaja diputar)
    const c = getContent(slug);
    const links = {};
    c.parts.forEach((p) => { links[p.id] = g.options.find((o) => o.text === p.fungsi).key; });
    const ok = checkPairs(slug, links);
    assert.equal(ok.right, ok.total); assert.equal(ok.linked, ok.total);
    const bad = checkPairs(slug, { [c.parts[0].id]: 99 });
    assert.equal(bad.right, 0);
    assert.equal(JSON.stringify(g).includes('jawab'), false);
    assert.notEqual(getContent(slug, 'en').materi[0].isi, c.materi[0].isi);
  }
  assert.equal(checkPairs('tidak-ada', {}), null);
});
await test('6 misi punya materi, 5 soal, dan komponen', () => {
  assert.equal(Object.keys(CONTENT).length, 6);
  for (const c of Object.values(CONTENT)) { assert.equal(c.soal.length, 5); assert.ok(c.materi.length >= 3); assert.ok(c.parts.length >= 5); }
});

const sA = await users.createUser({ name: 'Siswa A', email: 'sa@test.id', password: 'rahasia1', role: 'MURID' });
const sB = await users.createUser({ name: 'Siswa B', email: 'sb@test.id', password: 'rahasia1', role: 'MURID' });
const outsider = await users.createUser({ name: 'Luar Kelas', email: 'out@test.id', password: 'rahasia1', role: 'MURID' });
const cls2 = await classes.createClass(guru.id, { name: 'Kelas Tugas', description: null });
await classes.joinClass(sA.id, cls2.code); await classes.joinClass(sB.id, cls2.code);

await test('kuis hanyalah latihan: tidak memberi XP; XP lewat "tandai selesai" untuk misi yang dibagikan guru', async () => {
  const ans = CONTENT['jaringan-komputer'].soal.map((q) => q.jawab);
  const r1 = await missionsLib.submitQuiz(sA.id, 'jaringan-komputer', ans);
  assert.equal(r1.passed, true); assert.equal(r1.xpGained, undefined);
  assert.equal((await users.studentStats(sA.id)).xp, 0);
  assert.equal((await missionsLib.completeMission(sA.id, 'jaringan-komputer')).status, 403); // belum dibagikan
  await missionsLib.assignMission(cls2.id, 'jaringan-komputer');
  assert.equal((await missionsLib.completeMission(sB.id, 'jaringan-komputer')).status, 409); // sB belum lulus latihan
  const ok = await missionsLib.completeMission(sA.id, 'jaringan-komputer');
  assert.equal(ok.xpGained, 100);
  assert.equal((await missionsLib.completeMission(sA.id, 'jaringan-komputer')).xpGained, 0);
  assert.equal((await users.studentStats(sA.id)).xp, 100);
  assert.equal((await missionsLib.completeMission(outsider.id, 'jaringan-komputer')).status, 403);
  assert.equal((await missionsLib.completeMission(sA.id, 'misi-palsu')).status, 404);
  await missionsLib.unassignMission(cls2.id, 'jaringan-komputer');
});
await test('materi AR buatan guru: simpan, hak akses, selesai +100 XP sekali, info komponen bebas', async () => {
  const v = missionsLib.validateCustom({ title: 'Anatomi Jantung', subject: 'Informatika', description: 'Model jantung' });
  assert.ok(v.value); assert.ok(missionsLib.validateCustom({ title: 'x' }).error);
  const row = await missionsLib.addCustom(cls2.id, guru.id, v.value, '/api/files/models/x.glb');
  const slug = missionsLib.customSlug(row.id);
  assert.equal(missionsLib.isCustomSlug(slug), true); assert.equal(missionsLib.isCustomSlug('c-xyz'), false);
  assert.ok(await missionsLib.getCustomFor({ id: sA.id, role: 'MURID' }, row.id));
  assert.equal(await missionsLib.getCustomFor({ id: outsider.id, role: 'MURID' }, row.id), null);
  assert.equal(await missionsLib.getCustomFor({ id: guru2.id, role: 'GURU' }, row.id), null);
  const before = (await users.studentStats(sB.id)).xp;
  assert.equal((await missionsLib.completeMission(sB.id, slug)).xpGained, 100);
  assert.equal((await missionsLib.completeMission(sB.id, slug)).xpGained, 0);
  assert.equal((await users.studentStats(sB.id)).xp, before + 100);
  const info = await missionsLib.partInfo(slug, 'Terminal', row);
  assert.equal(info.source, 'BAWAAN'); assert.equal(await missionsLib.partInfo(slug, '<script>', row), null);
  const mats = await missionsLib.classMaterialsForStudent(sB.id);
  assert.equal(mats[0].items.find((i) => i.slug === slug).state, 'done');
  assert.equal(await missionsLib.deleteCustom(guru2.id, row.id), null);
  assert.ok(await missionsLib.deleteCustom(guru.id, row.id));
});
await test('info komponen: tanpa API key memakai teks bawaan; komponen asing ditolak', async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const r = await missionsLib.partInfo('sistem-komputer', 'CPU');
  assert.equal(r.source, 'BAWAAN'); assert.ok(r.info.length > 20);
  assert.equal(await missionsLib.partInfo('sistem-komputer', 'Roket'), null);
  assert.equal(await missionsLib.partInfo('misi-palsu', 'CPU'), null);
});
await test('validasi tugas', () => {
  const ok = { class_id: cls2.id, title: 'Flowchart', points: 100 };
  assert.ok(tasksLib.validateTask(ok).value);
  assert.ok(tasksLib.validateTask({ ...ok, points: 0 }).error);
  assert.ok(tasksLib.validateTask({ ...ok, points: 10001 }).error);
  assert.ok(tasksLib.validateTask({ ...ok, points: 1.5 }).error);
  assert.ok(tasksLib.validateTask({ ...ok, title: 'x' }).error);
  assert.ok(tasksLib.validateTask({ ...ok, class_id: 'bukan-uuid' }).error);
});
let task;
await test('guru hanya bisa membuat tugas di kelasnya sendiri', async () => {
  const v = tasksLib.validateTask({ class_id: cls2.id, title: 'Tugas Revisi', points: 100 }).value;
  const bad = await tasksLib.createTask(guru2.id, v);
  assert.equal(bad.status, 404);
  const good = await tasksLib.createTask(guru.id, v, [{ name: 'soal.pdf', url: '/api/files/x', size: 10, mime: 'application/pdf' }]);
  task = good.task; assert.ok(task.id);
});
await test('hak akses tugas: murid luar kelas & guru lain tidak bisa melihat', async () => {
  assert.ok(await tasksLib.getTaskFor({ id: sA.id, role: 'MURID' }, task.id));
  assert.equal(await tasksLib.getTaskFor({ id: outsider.id, role: 'MURID' }, task.id), null);
  assert.equal(await tasksLib.getTaskFor({ id: guru2.id, role: 'GURU' }, task.id), null);
  assert.equal(await tasksLib.getTaskFor({ id: sA.id, role: 'MURID' }, 'bukan-uuid'), null);
});
const file = (n) => ({ name: `f${n}.pdf`, url: `/api/files/t/${n}`, size: 100, mime: 'application/pdf' });
const xpOf = async (uid) => (await users.studentStats(uid)).xp;
await test('kumpul pertama memberi XP penuh sebesar poin tugas', async () => {
  const before = await xpOf(sB.id);
  const r = await tasksLib.submitTask(task, sB.id, [file(1)]);
  assert.equal(r.revision, 0); assert.equal(r.xpDelta, 100);
  assert.equal((await xpOf(sB.id)) - before, 100);
  assert.equal(await tasksLib.activeTaskCount(sB.id), 0);
});
await test('revisi ke-1..6 mengurangi 20% per revisi, minimal sisa 20%', async () => {
  const expected = [80, 60, 40, 20, 20, 20];
  for (let n = 1; n <= 6; n += 1) {
    const r = await tasksLib.submitTask(task, sB.id, [file(10 + n)]);
    assert.equal(r.revision, n); assert.equal(r.xpNow, expected[n - 1]);
    const ev = await client.query("SELECT COALESCE(SUM(amount),0)::int AS s FROM xp_events WHERE user_id=$1 AND ref_id LIKE $2", [sB.id, `${task.id}%`]);
    assert.equal(ev.rows[0].s, expected[n - 1]);
  }
});
await test('XP tugas tidak dobel: kumpul ulang tidak menambah TASK, dan revisi tak bisa diulang per nomor', async () => {
  const c = await client.query("SELECT COUNT(*)::int AS n FROM xp_events WHERE user_id=$1 AND kind='TASK' AND ref_id=$2", [sB.id, task.id]);
  assert.equal(c.rows[0].n, 1);
  await client.query("INSERT INTO xp_events (user_id,kind,amount,ref_id) VALUES ($1,'REVISION',-5,$2) ON CONFLICT DO NOTHING", [sB.id, `${task.id}:1`]);
  const ev = await client.query("SELECT COUNT(*)::int AS n FROM xp_events WHERE user_id=$1 AND kind='REVISION' AND ref_id=$2", [sB.id, `${task.id}:1`]);
  assert.equal(ev.rows[0].n, 1);
});
await test('total XP murid tidak pernah di bawah 0 meski revisi banyak', async () => {
  const t2 = (await tasksLib.createTask(guru.id, tasksLib.validateTask({ class_id: cls2.id, title: 'Kecil', points: 10 }).value)).task;
  await tasksLib.submitTask(t2, sA.id, [file(50)]);
  for (let n = 1; n <= 10; n += 1) await tasksLib.submitTask(t2, sA.id, [file(50 + n)]);
  assert.ok((await xpOf(sA.id)) >= 0);
  assert.equal(taskXp(10, 10), 2);
});
await test('penilaian: nilai per file 0–100, rata-rata jadi nilai akhir; murid tak bisa revisi setelah dinilai', async () => {
  const sub = await tasksLib.submissionFor(task.id, sB.id);
  const cur = sub.files.filter((f) => f.revision === sub.revision_count);
  assert.equal((await tasksLib.gradeSubmission(guru2.id, sub.id, { action: 'grade', files: [] })).status, 404);
  assert.equal((await tasksLib.gradeSubmission(guru.id, sub.id, { action: 'grade', files: [{ id: cur[0].id, score: 150 }] })).status, 400);
  const ok = await tasksLib.gradeSubmission(guru.id, sub.id, { action: 'grade', files: [{ id: cur[0].id, score: 88, feedback: 'Bagus' }], feedback: 'Mantap' });
  assert.equal(ok.score, 88); assert.equal(ok.status, 'GRADED');
  const again = await tasksLib.submitTask(task, sB.id, [file(99)]);
  assert.equal(again.status, 409);
});
await test('minta revisi: wajib catatan, siswa bisa kirim ulang', async () => {
  const t3 = (await tasksLib.createTask(guru.id, tasksLib.validateTask({ class_id: cls2.id, title: 'Minta Revisi', points: 50 }).value)).task;
  await tasksLib.submitTask(t3, sA.id, [file(70)]);
  const sub = await tasksLib.submissionFor(t3.id, sA.id);
  assert.equal((await tasksLib.gradeSubmission(guru.id, sub.id, { action: 'revise', files: [] })).status, 400);
  assert.equal((await tasksLib.gradeSubmission(guru.id, sub.id, { action: 'revise', feedback: 'Perbaiki bagian 2', files: [] })).status, 'REVISION_REQUESTED');
  assert.equal(await tasksLib.activeTaskCount(sA.id) >= 1, true);
  const r = await tasksLib.submitTask(t3, sA.id, [file(71)]);
  assert.equal(r.revision, 1); assert.equal(r.xpNow, taskXp(50, 1));
});
await test('library: tambah, cari, filter jenis, hapus hanya milik sendiri', async () => {
  const f1 = await libLib.addLibraryFile(sA.id, { name: 'catatan-jaringan.pdf', url: '/u/1', size: 1000, mime: 'application/pdf' });
  await libLib.addLibraryFile(sA.id, { name: 'foto.png', url: '/u/2', size: 500, mime: 'image/png' });
  assert.equal((await libLib.listLibrary(sA.id)).length, 2);
  assert.equal((await libLib.listLibrary(sA.id, { q: 'jaringan' })).length, 1);
  assert.equal((await libLib.listLibrary(sA.id, { type: 'gambar' })).length, 1);
  assert.equal((await libLib.listLibrary(sB.id)).length, 0);
  assert.equal(await libLib.deleteLibraryFile(sB.id, f1.id), null);
  assert.ok(await libLib.deleteLibraryFile(sA.id, f1.id));
  const xp = await xpOf(sA.id); assert.ok(xp >= 0);
});
await test('validasi file: ukuran 15 MB, ekstensi, foto profil', () => {
  const mk = (name, size) => ({ name, size, arrayBuffer() {} });
  assert.equal(checkFile(mk('a.pdf', 1024)), null);
  assert.ok(checkFile(mk('a.pdf', 15 * 1024 * 1024 + 1)));
  assert.equal(checkFile(mk('a.pdf', 15 * 1024 * 1024)), null);
  assert.ok(checkFile(mk('virus.exe', 100)));
  assert.ok(checkFile(mk('a.pdf', 100), { imageOnly: true }));
  assert.equal(checkFile(mk('a.png', 100), { imageOnly: true }), null);
  assert.ok(checkFile(mk('a.pdf', 0)));
  assert.equal(safeName('../../etc/passwd'), 'passwd');
});
await test('assign misi ke kelas', async () => {
  assert.equal(await missionsLib.assignMission(cls2.id, 'keamanan-data'), true);
  assert.equal(await missionsLib.assignMission(cls2.id, 'misi-palsu'), false);
  assert.deepEqual(await missionsLib.assignedForClass(cls2.id), ['keamanan-data']);
  assert.ok((await missionsLib.assignedSlugsForStudent(sA.id)).has('keamanan-data'));
  assert.equal((await missionsLib.assignedSlugsForStudent(outsider.id)).size, 0);
  await missionsLib.unassignMission(cls2.id, 'keamanan-data');
  assert.equal((await missionsLib.assignedForClass(cls2.id)).length, 0);
});

console.log('Streak & profil');
const streakLib = await import('../src/lib/streak.js');
await test('tingkatan streak: abu <10, oranye 10, ungu 30, biru 50', () => {
  const id = (n) => streakLib.streakTier(n).id;
  assert.deepEqual([0, 9, 10, 29, 30, 49, 50, 400].map(id), ['abu', 'abu', 'oranye', 'oranye', 'ungu', 'ungu', 'biru', 'biru']);
  assert.equal(streakLib.streakTier(4).remaining, 6);
  assert.equal(streakLib.streakTier(50).next, null);
});
await test('aturan nextStreak: hari sama tetap, besok +1, bolong reset', () => {
  assert.equal(streakLib.nextStreak(5, '2026-11-10', '2026-11-10'), 5);
  assert.equal(streakLib.nextStreak(5, '2026-11-09', '2026-11-10'), 6);
  assert.equal(streakLib.nextStreak(5, '2026-11-08', '2026-11-10'), 1);
  assert.equal(streakLib.nextStreak(5, '2026-10-31', '2026-11-01'), 6);
});
await test('visitStreak: naik tiap hari, sekali per hari, reset jika bolong, rekor tersimpan', async () => {
  const u = await users.createUser({ name: 'Streaker', email: 'streak@test.id', password: 'rahasia1', role: 'MURID' });
  const day = (d) => new Date(`2026-03-${String(d).padStart(2, '0')}T08:00:00+07:00`);
  assert.deepEqual(await streakLib.visitStreak(u.id, day(1)), { count: 1, best: 1 });
  assert.deepEqual(await streakLib.visitStreak(u.id, day(1)), { count: 1, best: 1 });
  const both = await Promise.all([streakLib.visitStreak(u.id, day(2)), streakLib.visitStreak(u.id, day(2))]);
  assert.deepEqual(both.map((b) => b.count), [2, 2]);
  assert.deepEqual(await streakLib.visitStreak(u.id, day(3)), { count: 3, best: 3 });
  assert.deepEqual(await streakLib.visitStreak(u.id, day(5)), { count: 1, best: 3 });
  assert.deepEqual(await streakLib.visitStreak(u.id, day(6)), { count: 2, best: 3 });
});
await test('tanggal WIB: 23:30 UTC sudah hari berikutnya di Jakarta', () => {
  assert.equal(streakLib.wibDate(new Date('2026-03-01T23:30:00Z')), '2026-03-02');
});
await test('validasi profil dan riwayat XP', async () => {
  assert.ok(users.validateProfile({ name: 'A' }).error);
  assert.ok(users.validateProfile({ name: 'Budi', nis: '!!' }).error);
  assert.ok(users.validateProfile({ name: 'Budi', bio: 'x'.repeat(201) }).error);
  assert.deepEqual(users.validateProfile({ name: ' Budi  S ', nis: '', bio: '' }).value, { name: 'Budi S', nis: null, bio: null });
  const p = await users.profileData(murid.id);
  assert.equal(p.work.submitted, 0); assert.ok(Array.isArray(p.classes));
  assert.ok(Array.isArray(await users.xpHistory(murid.id)));
});

console.log('Migrasi');
await test('menjalankan migrasi lagi tidak berbuat apa-apa', async () => {
  assert.equal(await runMigrations(client, () => {}), 0);
});

await getPool().end();
await client.end();
await stop();
console.log(`\n${passed} lulus, ${failures.length} gagal`);
if (failures.length) { console.log('Gagal:', failures.join(' | ')); process.exit(1); }
