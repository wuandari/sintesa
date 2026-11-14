import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard.jsx';
import { requireUser } from '@/lib/auth.js';
import StreakCard from '@/components/StreakCard.jsx';
import Flame from '@/components/Flame.jsx';
import { visitStreak } from '@/lib/streak.js';
import { leaderboard, studentStats, xpHistory } from '@/lib/users.js';
import { computeBadges, firstName, getLevel, TOTAL_MISSIONS } from '@/lib/gamification.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Dashboard — Sintesa' };

export default async function SiswaPage() {
  const { t, locale } = await getT();
  const user = await requireUser(['MURID']);
  const streak = await visitStreak(user.id);
  const [stats, board, history] = await Promise.all([studentStats(user.id), leaderboard(100), xpHistory(user.id, 15)]);
  const lv = getLevel(stats.xp);
  const badges = computeBadges({ xp: stats.xp, missions: stats.missions, tasks: stats.tasks });
  const earned = badges.filter((b) => b.earned).length;
  const fmt = (n) => n.toLocaleString(locale);
  const revisionXp = history.filter((h) => h.kind === 'REVISION').reduce((a, h) => a + h.amount, 0);
  const KIND = { MISSION: ['🧊', 'Materi AR selesai'], TASK: ['📌', 'Tugas dikumpulkan'], REVISION: ['✏️', 'Revisi tugas'], ADJUST: ['⚙️', 'Penyesuaian'] };
  const when = (d) => new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' });

  return (
    <main className="wrap page">
      <section className="hero-panel">
        <div className="eyebrow">{t('🎮 Dashboard Gamifikasi')}</div>
        <h1>{t('Halo,')}{' '}{firstName(user.name)} 👋<br />{t('Level')}{' '}{lv.level} — {t(lv.name)}</h1>
        <p className="lead">{t('Semua progres game-mu ada di sini: XP, badge, dan peringkat. Mainkan misi di halaman AR, kumpulkan tugas untuk naik level.')}</p>
        <div className="hero-pills">
          <span className="hero-pill"><Flame count={streak.count} size={14} /> {streak.count}{' '}{t('hari streak')}</span>
          <span className="hero-pill">⚡ {fmt(stats.xp)}{' '}{t('XP')}</span>
          <span className="hero-pill">🏅 {earned}/{badges.length}{' '}{t('badge')}</span>
          <span className="hero-pill">📌 {stats.tasks}{' '}{t('tugas selesai')}</span>
          <span className="hero-pill">✅ {stats.missions}{' '}{t('materi selesai')}</span>
        </div>
        <div className="hero-actions">
          <Link href="/ar" className="btn btn-white">{t('🧊 Mainkan Misi AR')}</Link>
          <Link href="/tugas" className="btn btn-white">{t('📌 Kumpulkan Tugas')}</Link>
          <Link href="/library" className="btn btn-outline-white">{t('📁 Arsipku')}</Link>
        </div>
      </section>

      <section className="duo-row">
        <StreakCard count={streak.count} best={streak.best} />
        <div className="card xp-total">
          <div className="xp-total-head">
            <span className="tile t-yellow">⚡</span>
            <div><span>{t('Total XP-mu')}</span><b>{fmt(stats.xp)} <small>{t('XP')}</small></b></div>
          </div>
          <ul className="xp-break">
            <li><span>{t('🧊 Materi AR selesai (')}{stats.missions})</span><b>+{fmt(stats.mission_xp)}</b></li>
            <li><span>{t('📌 Tugas guru (')}{stats.tasks})</span><b>+{fmt(stats.task_xp)}</b></li>
            <li><span>{t('📝 Soal latihan')}</span><b>0</b></li>
          </ul>
          <p className="hint">{t('Soal latihan hanya untuk berlatih (0 XP). XP datang dari menandai materi kelas selesai dan dari tugas guru. Revisi tugas mengurangi sedikit XP tugas itu.')}</p>
        </div>
      </section>

      <section className="stat-row">
        <div className="card stat" style={{ display: 'block' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span className="tile t-yellow">{lv.icon}</span>
            <div>
              <b style={{ fontSize: 16 }}>{t('Level')}{' '}{lv.level} — {t(lv.name)}</b>
              <span>{lv.isMax ? t('{xp} XP · Level maksimal tercapai 🎉', { xp: fmt(lv.xp) }) : t('{xp} XP · {n} XP lagi naik level', { xp: fmt(lv.xp), n: fmt(lv.remaining) })}</span>
            </div>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={lv.progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${lv.progress}%` }} /></div>
        </div>
        <div className="card stat"><span className="tile t-yellow">⚡</span><div><b>{fmt(stats.task_xp)}{' '}{t('XP')}</b><span>{t('dari')}{' '}{stats.tasks}{' '}{t('tugas guru (poin guru, sekali per tugas)')}</span></div></div>
        <div className="card stat"><span className="tile t-blue">🧊</span><div><b>{fmt(stats.mission_xp)}{' '}{t('XP')}</b><span>{t('dari')}{' '}{stats.missions}{' '}{t('materi AR selesai (+100/materi)')}</span></div></div>
      </section>

      <section>
        <h2 className="sec-title">{t('🧾 Riwayat XP')}</h2>
        <p className="sec-sub">{t('15 perolehan XP terakhir')}{revisionXp < 0 ? ` · potongan revisi ${fmt(revisionXp)} XP` : ''}.</p>
        <div className="card xp-history">
          {history.length === 0 ? (
            <p className="muted" style={{ padding: 18 }}>{t('Belum ada XP. Selesaikan materi kelas atau kumpulkan tugas untuk mulai mengumpulkan XP.')}</p>
          ) : (
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  <span className="xh-ico">{KIND[h.kind]?.[0] || '⚡'}</span>
                  <div className="xh-body"><b>{t(KIND[h.kind]?.[1] || h.kind)}{h.revision ? ` ${t('ke-{n}', { n: h.revision })}` : ''}</b><span>{h.title}</span></div>
                  <span className="xh-date">{when(h.at)}</span>
                  <span className={`xh-amt ${h.amount < 0 ? 'neg' : 'pos'}`}>{h.amount > 0 ? '+' : ''}{fmt(h.amount)}{' '}{t('XP')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="sec-title">{t('🏅 Badge Koleksiku')}</h2>
        <p className="sec-sub">{t('Selesaikan misi & tugas untuk membuka semuanya.')}</p>
        <div className="card badge-box">
          <div className="badges">
            {badges.map((b) => (
              <span key={b.id} className={`badge ${b.earned ? 'earned' : ''}`} title={t(b.hint)}>{b.icon} {t(b.name)}</span>
            ))}
          </div>
          <p className="hint">{t('💡 Pengumpul Tugas = 1 tugas · Pejuang Tugas = 3 tugas · Bintang AR = 500 XP. Arsip Library tidak memberi XP/badge.')}</p>
        </div>
      </section>

      <section>
        <h2 className="sec-title">{t('🏆 Leaderboard')}</h2>
        <p className="sec-sub">{t('Peringkat XP seluruh siswa.')}</p>
        <div className="card lb-wide"><Leaderboard rows={board} meId={user.id} /></div>
      </section>

      <section>
        <h2 className="sec-title">{t('🗺️ Lanjut ke Mana?')}</h2>
        <p className="sec-sub">{t('Dashboard ini khusus progres. Aktivitas ada di halaman masing-masing.')}</p>
        <div className="next-grid">
          <Link href="/ar" className="card next-card"><span className="e">🧊</span><b>{t('Misi AR')}</b><p>{TOTAL_MISSIONS}{' '}{t('misi + materi & soal latihan. Materi kelas dari gurumu juga ada di sini.')}</p><span className="lnk">{t('Mainkan →')}</span></Link>
          <Link href="/tugas" className="card next-card"><span className="e">📌</span><b>{t('Tugas Guru')}</b><p>{t('Kumpulkan file per tugas, raih XP sebesar poin guru.')}</p><span className="lnk">{t('Kumpulkan →')}</span></Link>
          <Link href="/library" className="card next-card"><span className="e">📁</span><b>{t('Arsip Library')}</b><p>{t('Penyimpanan file bebas (tanpa XP, tanpa nilai).')}</p><span className="lnk">{t('Buka arsip →')}</span></Link>
        </div>
      </section>
    </main>
  );
}
