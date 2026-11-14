import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard.jsx';
import CreateClassForm from '@/components/CreateClassForm.jsx';
import { requireUser } from '@/lib/auth.js';
import { leaderboard } from '@/lib/users.js';
import { classesForTeacher, teacherSummary } from '@/lib/classes.js';
import TaskForm from '@/components/TaskForm.jsx';
import { query } from '@/lib/db.js';
import { firstName } from '@/lib/gamification.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Dashboard Guru — Sintesa' };

export default async function GuruPage() {
  const { t, locale } = await getT();
  const user = await requireUser(['GURU', 'ADMIN']);
  const [board, classes, summary, extra] = await Promise.all([
    leaderboard(100), classesForTeacher(user.id), teacherSummary(user.id),
    query(`SELECT (SELECT COUNT(*) FROM tasks WHERE teacher_id = $1)::int AS tasks,
                  (SELECT COUNT(DISTINCT cm.mission_slug) FROM class_missions cm JOIN classes c ON c.id = cm.class_id WHERE c.teacher_id = $1)::int AS missions,
                  (SELECT COUNT(*) FROM library_files WHERE user_id = $1)::int AS files`, [user.id]).then((r) => r[0]),
  ]);
  const top = board[0];
  const totalXp = board.reduce((s, r) => s + r.xp, 0);
  const fmt = (n) => n.toLocaleString(locale);

  return (
    <main className="wrap page">
      <section className="hero-panel">
        <div className="hero-top">
          <div>
            <div className="eyebrow">{t('🎮 Dashboard Gamifikasi')}</div>
            <h1>{t('Halo,')}{' '}{firstName(user.name)}!<br />{t('Pantau progres game kelasmu.')}</h1>
            <p className="lead">{t('Leaderboard, XP, dan badge siswa terlihat di sini, plus kelola kelas & tugas. Misi AR ada di halaman Misi AR.')}</p>
          </div>
          <div className="hero-actions">
            <Link href="/ar" className="btn btn-outline-white">{t('🧊 Misi AR')}</Link>
            <Link href="/tugas" className="btn btn-white">{t('📌 Tugas (')}{extra.tasks})</Link>
            <Link href="/library" className="btn btn-outline-white">{t('📁 Arsip (')}{extra.files})</Link>
          </div>
        </div>
      </section>

      <section className="stat-row">
        <div className="card stat"><span className="tile t-yellow">🏆</span><div><b>{top ? `${top.name} · ${fmt(top.xp)} XP` : t('Belum ada murid')}</b><span>{t('Peringkat 1 saat ini')}</span></div></div>
        <div className="card stat"><span className="tile t-blue">⚡</span><div><b>{fmt(totalXp)}{' '}{t('XP')}</b><span>{t('Total XP seluruh siswa di leaderboard')}</span></div></div>
        <div className="card stat"><span className="tile t-pink">🎯</span><div><b>{extra.tasks}{' '}{t('tugas')}</b><span>{t('Misi tugas aktif memberi XP poin guru')}</span></div></div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div><h2 className="sec-title">{t('🏆 Leaderboard Siswa')}</h2><p className="sec-sub">{t('Peringkat XP seluruh siswa.')}</p></div>
          <Link href="/tugas" className="btn btn-soft btn-sm">{t('Nilai di Tugas →')}</Link>
        </div>
        <div className="card lb-wide"><Leaderboard rows={board.slice(0, 10)} /></div>
      </section>

      <section>
        <h2 className="sec-title">{t('🏫 Kelola Kelas & Tugas')}</h2>
        <p className="sec-sub">{t('Buat kelas, buat tugas ber-XP, dan buka kelas untuk menugaskan materi AR.')}</p>
        <div className="manage-grid">
          <div className="card panel">
            <h3>{t('📊 Ringkasan')}</h3>
            <p className="sub">{t('Gambaran kelasmu saat ini.')}</p>
            <div className="mini-stats">
              <div className="mini-stat ms1"><b>{summary.classes}</b><span>{t('Kelas')}</span></div>
              <div className="mini-stat ms2"><b>{extra.missions}</b><span>{t('Materi AR')}</span></div>
              <div className="mini-stat ms3"><b>{summary.students}</b><span>{t('Siswa')}</span></div>
              <div className="mini-stat ms4"><b>{extra.tasks}</b><span>{t('Tugas aktif')}</span></div>
            </div>
          </div>
          <div className="card panel">
            <h3>{t('＋ Buat Kelas Baru')}</h3>
            <p className="sub">{t('Kelas mendapat kode unik untuk dibagikan.')}</p>
            <CreateClassForm />
          </div>
          <div className="card panel" id="buat-tugas">
            <h3>{t('🎯 Buat Tugas (+XP poin guru)')}</h3>
            <p className="sub">{t('Siswa mengumpulkan di halaman Tugas dan langsung dapat XP sebesar poin ini.')}</p>
            <TaskForm classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="sec-title">{t('Daftar Kelas')}</h2>
        <p className="sec-sub">{t('Klik kelas untuk menugaskan materi AR dan melihat siswa.')}</p>
        {classes.length === 0 ? (
          <div className="card empty">{t('Belum ada kelas. Buat kelas pertamamu di atas.')}</div>
        ) : (
          <div className="class-grid">
            {classes.map((c) => (
              <article className="card class-card" key={c.id}>
                <div className="class-top"><small>{t('KODE KELAS ·')}{' '}{c.code}</small><h3>{c.name}</h3></div>
                <div className="class-body">
                  <p>{c.description || t('Belum ada deskripsi.')}</p>
                  <div className="chips"><span className="chip">{c.mission_count}{' '}{t('materi AR')}</span><span className="chip">{c.student_count}{' '}{t('siswa')}</span></div>
                  <div className="class-foot"><span>{t('Kode:')}{' '}{c.code}</span><Link href={`/guru/kelas/${c.id}`}>{t('Kelola →')}</Link></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
