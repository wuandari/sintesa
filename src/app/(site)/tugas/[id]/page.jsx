import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth.js';
import { getTaskFor, submissionFor, submissionsForTask } from '@/lib/tasks.js';
import SubmitForm from '@/components/SubmitForm.jsx';
import GradePanel from '@/components/GradePanel.jsx';
import { DeleteButton } from '@/components/LibraryManager.jsx';
import { fmtDate, fmtSize, STATUS } from '@/lib/format.js';
import { taskXp } from '@/lib/xp.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Detail Tugas — Sintesa' };

export default async function TugasDetail({ params }) {
  const { t, locale } = await getT();
  const { id } = await params;
  const user = await requireUser();
  const task = await getTaskFor(user, id);
  if (!task) notFound();
  const isStudent = user.role === 'MURID';
  const late = task.due_at && new Date(task.due_at) < new Date();

  const head = (
    <section className="hero-panel">
      <div className="eyebrow">📌 {task.class_name}</div>
      <h1>{task.title}</h1>
      <p className="lead">{task.description || t('Tidak ada deskripsi.')}</p>
      <div className="hero-pills">
        <span className="hero-pill">⚡ {task.points}{' '}{t('XP')}</span>
        {task.due_at && <span className="hero-pill">⏰ {fmtDate(task.due_at, locale)}{late ? ` (${t('lewat')})` : ''}</span>}
      </div>
      {task.attachments.length > 0 && (
        <div className="hero-actions">
          {task.attachments.map((a) => <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-sm">📎 {a.name} ({fmtSize(a.size)})</a>)}
        </div>
      )}
    </section>
  );

  if (isStudent) {
    const sub = await submissionFor(task.id, user.id);
    const st = STATUS[sub?.status || 'NONE'];
    const current = sub ? sub.files.filter((f) => f.revision === sub.revision_count) : [];
    return (
      <main className="wrap page">
        <Link href="/tugas" className="back">{t('← Semua Tugas')}</Link>
        {head}
        <section className="card panel">
          <h3>{t('Status:')}{' '}<span className={`status ${st.cls}`}>{t(st.label)}</span></h3>
          {sub && (
            <>
              <p className="sub">{t('XP tugas ini sekarang:')}{' '}<b>{taskXp(task.points, sub.revision_count)}</b>{' '}{t('dari')}{' '}{task.points}{' '}{t('· revisi dilakukan:')}{' '}{sub.revision_count}{t('×')}{sub.score != null ? ` · ${t('nilai')} ${sub.score}/100` : ''}</p>
              {sub.feedback && <p className="note">{t('💬 Catatan guru:')}{' '}{sub.feedback}</p>}
              {current.map((f) => (
                <div key={f.id} className="file-row">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="file-link">📎 {f.name} <small>({fmtSize(f.size)})</small></a>
                  {f.score != null && <span className="chip">{t('Nilai')}{' '}{f.score}</span>}
                  {f.feedback && <p className="note">💬 {f.feedback}</p>}
                </div>
              ))}
            </>
          )}
          {sub?.status === 'GRADED' ? (
            <div className="alert alert-ok">{t('Tugas sudah dinilai dan tidak bisa direvisi lagi.')}</div>
          ) : (
            <>
              <h3 style={{ marginTop: 18 }}>{sub ? t('Unggah revisi') : t('Kumpulkan tugas')}</h3>
              <SubmitForm taskId={task.id} points={task.points} revisionCount={sub?.revision_count ?? 0} hasSubmission={!!sub} />
            </>
          )}
        </section>
      </main>
    );
  }

  const subs = await submissionsForTask(task.id);
  return (
    <main className="wrap page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/tugas" className="back">{t('← Semua Tugas')}</Link>
        <DeleteButton url={`/api/tasks/${task.id}`} confirm={t('Hapus tugas ini beserta semua kiriman siswa?')} label="🗑️ Hapus tugas" />
      </div>
      {head}
      <section>
        <h2 className="sec-title">{t('Kiriman Siswa (')}{subs.length})</h2>
        <p className="sec-sub">{t('Beri nilai 0–100 per file dan feedback, atau minta revisi.')}</p>
        {subs.length === 0 ? <div className="card empty">{t('Belum ada siswa yang mengumpulkan.')}</div> : (
          <div style={{ display: 'grid', gap: 16 }}>{subs.map((s) => <GradePanel key={`${s.id}-${s.revision_count}-${s.status}`} submission={JSON.parse(JSON.stringify(s))} points={task.points} />)}</div>
        )}
      </section>
    </main>
  );
}
