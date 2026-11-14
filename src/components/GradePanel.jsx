'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtDate, fmtSize, STATUS } from '@/lib/format.js';
import { useT } from '@/i18n/client.jsx';

export default function GradePanel({ submission: s, points }) {
  const { t, locale } = useT();
  const router = useRouter();
  const current = s.files.filter((f) => f.revision === s.revision_count);
  const older = s.files.filter((f) => f.revision !== s.revision_count);
  const [rows, setRows] = useState(() => Object.fromEntries(current.map((f) => [f.id, { score: f.score ?? '', feedback: f.feedback ?? '' }])));
  const [feedback, setFeedback] = useState(s.feedback ?? '');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const st = STATUS[s.status];
  const canAct = s.status === 'SUBMITTED';

  async function send(action) {
    setBusy(true); setMsg(null);
    const files = current.map((f) => ({ id: f.id, score: rows[f.id].score === '' ? null : Number(rows[f.id].score), feedback: rows[f.id].feedback }));
    try {
      const res = await fetch(`/api/submissions/${s.id}/grade`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, files, feedback }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: t(data.message || 'Gagal.') });
      else router.refresh();
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }

  return (
    <article className="card panel sub-card">
      <div className="sub-head">
        <div><b>{s.student_name}</b><span className="muted"> · {s.student_email}</span></div>
        <span className={`status ${st.cls}`}>{t(st.label)}</span>
      </div>
      <p className="muted">{t('Dikumpulkan')}{' '}{fmtDate(s.submitted_at, locale)}{' '}{t('· revisi:')}{' '}{s.revision_count}{t('× · poin tugas')}{' '}{points}{' '}{t('XP')}{s.score != null ? ` · ${t('nilai')} ${s.score}` : ''}</p>

      {current.map((f) => (
        <div key={f.id} className="file-row">
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="file-link">📎 {f.name} <small>({fmtSize(f.size)})</small></a>
          <div className="grade-inputs">
            <input type="number" min={0} max={100} placeholder="0–100" aria-label={`${t('Nilai')} ${f.name}`} className="input" disabled={!canAct}
              value={rows[f.id].score} onChange={(e) => setRows({ ...rows, [f.id]: { ...rows[f.id], score: e.target.value } })} />
            <input placeholder={t('Feedback file ini')} aria-label={`${t('Feedback')} ${f.name}`} className="input" maxLength={500} disabled={!canAct}
              value={rows[f.id].feedback} onChange={(e) => setRows({ ...rows, [f.id]: { ...rows[f.id], feedback: e.target.value } })} />
          </div>
        </div>
      ))}
      {older.length > 0 && (
        <details className="older"><summary>{t('Versi sebelumnya (')}{older.length}{' '}{t('file)')}</summary>
          {older.map((f) => <div key={f.id}><a href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a> <small className="muted">{t('revisi')}{' '}{f.revision}</small></div>)}
        </details>
      )}
      {canAct ? (
        <>
          <textarea className="input" placeholder={t('Catatan umum untuk siswa (wajib bila meminta revisi)')} maxLength={1000} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          {msg && <div className="alert alert-error">{msg.text}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={busy} onClick={() => send('grade')}>{t('✅ Simpan Nilai')}</button>
            <button className="btn btn-outline" disabled={busy} onClick={() => send('revise')}>{t('↩️ Minta Revisi')}</button>
          </div>
        </>
      ) : s.feedback && <p className="note">💬 {s.feedback}</p>}
    </article>
  );
}
