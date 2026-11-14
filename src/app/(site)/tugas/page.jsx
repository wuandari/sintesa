import Link from 'next/link';
import { requireUser } from '@/lib/auth.js';
import { tasksForStudent, tasksForTeacher } from '@/lib/tasks.js';
import { classesForTeacher } from '@/lib/classes.js';
import { fmtDate, STATUS } from '@/lib/format.js';
import { firstName } from '@/lib/gamification.js';
import { taskXp } from '@/lib/xp.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Tugas — Sintesa' };

async function Info() {
  const { t, locale } = await getT();
  return (
    <div className="info-box">
      <b>{t('❓ Bedanya Tugas vs Library?')}</b>
      <span>📌 <b>{t('/tugas (halaman ini):')}</b>{' '}{t('wajib pilih tugas guru → XP = poin guru → bisa dinilai.')}</span>
      <span>📁 <b>{t('/library:')}</b>{' '}{t('arsip bebas tanpa tugas → 0 XP → tidak dinilai.')}</span>
    </div>
  );
}

export default async function TugasPage({ searchParams }) {
  const { t, locale } = await getT();
  const user = await requireUser();
  const sp = await searchParams;
  const f = ['belum', 'sudah'].includes(sp?.f) ? sp.f : 'semua';
  const isStudent = user.role === 'MURID';
  const tasks = isStudent ? await tasksForStudent(user.id) : await tasksForTeacher(user.id);
  const classes = isStudent ? [] : await classesForTeacher(user.id);
  const cls = typeof sp?.c === 'string' && classes.some((c) => c.id === sp.c) ? sp.c : '';
  const sent = (tk) => !!tk.submission_id && tk.status !== 'REVISION_REQUESTED';
  const shown = tasks.filter((tk) => (isStudent
    ? (f === 'semua' || (f === 'belum' ? !sent(tk) : sent(tk)))
    : (!cls || tk.class_id === cls) && (f === 'semua' || (f === 'belum' ? tk.to_grade > 0 : tk.to_grade === 0))));
  const href = (o) => `/tugas?${new URLSearchParams({ ...(f !== 'semua' ? { f } : {}), ...(cls ? { c: cls } : {}), ...o }).toString()}`;
  const submitted = tasks.filter((tk) => (isStudent ? sent(tk) : false)).length;
  const gained = isStudent ? tasks.reduce((n, tk) => n + (tk.submission_id ? taskXp(tk.points, tk.revision_count) : 0), 0) : 0;
  const files = isStudent ? 0 : tasks.reduce((n, tk) => n + tk.submitted, 0);

  const chips = (
    <div className="card t-chips">
      <Link href={href({ f: '' })} className={`cat-chip ${f === 'semua' ? 'on' : ''}`}>{t('🌐 Semua')}</Link>
      <Link href={href({ f: 'belum' })} className={`cat-chip ${f === 'belum' ? 'on' : ''}`}>🔥 {isStudent ? t('Belum kumpul') : t('Perlu dinilai')}</Link>
      <Link href={href({ f: 'sudah' })} className={`cat-chip ${f === 'sudah' ? 'on' : ''}`}>✅ {isStudent ? t('Sudah kumpul') : t('Sudah beres')}</Link>
      <Link href={href({})} className="cat-chip">{t('🔄 Muat ulang')}</Link>
    </div>
  );

  return (
    <main className="wrap page">
      <section className="hero-panel">
        <div className="eyebrow">{t('📌 Pengumpulan Tugas')}</div>
        <h1>{isStudent ? `Halo, ${firstName(user.name)}! Kumpulkan tugas gurumu di sini.` : `Halo, ${firstName(user.name)}! Nilai karya siswamu di sini.`}</h1>
        <p className="lead">{isStudent
          ? 'Pilih tugas → unggah file → XP sebesar poin guru masuk otomatis (dihitung sekali per tugas). Mengunggah revisi mengurangi 20% XP tugas itu (sisa minimal 20%).'
          : 'Setiap tugas menampilkan file yang masuk. Beri nilai 0–100 + feedback langsung per file.'}</p>
        <div className="hero-pills">
          <span className="hero-pill">📌 {tasks.length}{' '}{t('tugas')}</span>
          {isStudent ? <><span className="hero-pill">✅ {submitted}{' '}{t('terkumpul')}</span><span className="hero-pill">🔥 {gained}{' '}{t('XP dari tugas')}</span></>
            : <span className="hero-pill">📥 {files}{' '}{t('file masuk')}</span>}
        </div>
        <div className="hero-actions"><Link href="/library" className="btn btn-white">{t('📁 Arsip Library')}</Link><Link href={isStudent ? '/siswa' : '/guru'} className="btn btn-white">{t('← Dashboard')}</Link></div>
      </section>

      {chips}

      {!isStudent && (
        <section>
          <h2 className="sec-title">{t('🏫 Shortcut Kelas')}</h2>
          <p className="sec-sub">{t('Pilih kelas untuk melihat tugas yang sedang berjalan di kelas itu.')}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={href({ c: '' })} className={`sc-chip ${!cls ? 'on' : ''}`}>🌐 <span>{t('Semua Kelas')}<small>{tasks.length}{' '}{t('tugas')}</small></span></Link>
            {classes.map((c, i) => <Link key={c.id} href={href({ c: c.id })} className={`sc-chip ${cls === c.id ? 'on' : ''}`}><span className="m-ico" style={{ width: 30, height: 30, fontSize: 14, background: 'var(--primary)', color: '#fff' }}>{i + 1}</span><span>{c.name}<small>{c.code} · {tasks.filter((tk) => tk.class_id === c.id).length}{' '}{t('tugas')}</small></span></Link>)}
          </div>
        </section>
      )}

      {!isStudent && classes.filter((c) => !cls || c.id === cls).map((c) => (
        <div key={c.id} className="class-banner"><span>🏫 <b>{t('KELAS')}</b></span><b style={{ fontSize: 18 }}>{c.name}</b><span className="muted">{t('Kode')}{' '}{c.code}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}><span className="muted">{tasks.filter((tk) => tk.class_id === c.id).length}{' '}{t('tugas')}</span><Link href="/guru#buat-tugas" className="btn btn-primary btn-sm">{t('+ Tugas Baru')}</Link></span></div>
      ))}

      {shown.length === 0 ? (
        <div className="card empty" style={{ padding: 40 }}>
          <div style={{ fontSize: 40 }}>📌</div><b style={{ fontSize: 18, color: 'var(--text)' }}>{t('Belum ada tugas')}</b>
          <p>{isStudent ? t('Minta gurumu membuat tugas di kelas.') : t('Buat tugas dari dashboard guru → pilih kelas → buat tugas.')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {shown.map((tk) => {
            const st = STATUS[tk.status || 'NONE'];
            return (
              <Link key={tk.id} href={`/tugas/${tk.id}`} className="card t-card">
                <div className="t-top"><span className="lab">{tk.class_name}</span>
                  <span className="xp-badge">+{tk.points}{' '}{t('XP ·')}{' '}{isStudent ? (tk.submission_id ? t('sisa {n} XP', { n: taskXp(tk.points, tk.revision_count) }) : t('belum kumpul')) : t('{n} pengumpulan', { n: tk.submitted })}</span></div>
                <h4>{tk.title}</h4>
                <span className="muted">{t('Siswa mendapat +{n} XP saat mengumpulkan.', { n: tk.points })}{tk.due_at ? ` · ${t('tenggat')} ${fmtDate(tk.due_at, locale)}` : ''}</span>
                {isStudent
                  ? <span className={`status ${st.cls}`} style={{ justifySelf: 'start' }}>{t(st.label)}{tk.status === 'GRADED' ? ` · ${t('nilai')} ${tk.score}` : ''}</span>
                  : tk.submitted === 0 ? <div className="t-empty">{t('Belum ada file masuk untuk tugas ini.')}</div>
                    : <span className="status st-blue" style={{ justifySelf: 'start' }}>{tk.submitted}/{tk.students}{' '}{t('kumpul')}{tk.to_grade ? ` · ${t('{n} perlu dinilai', { n: tk.to_grade })}` : ''}{' '}{t('· Nilai submission →')}</span>}
              </Link>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 22 }}><Info /></div>
    </main>
  );
}
