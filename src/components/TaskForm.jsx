'use client';

import Uploader from './Uploader.jsx';
import { useT } from '@/i18n/client.jsx';

export default function TaskForm({ classes }) {
  const { t } = useT();
  if (classes.length === 0) return <div className="alert alert-ok" style={{ margin: 0 }}>{t('Buat kelas dulu sebelum membuat tugas.')}</div>;
  return (
    <Uploader action="/api/tasks" label="+ Buat Tugas" fields="optional">
      <div className="field"><label htmlFor="t-class">{t('Kelas')}</label>
        <select id="t-class" name="class_id" className="input" required>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="field"><label htmlFor="t-title">{t('Judul tugas')}</label>
        <input id="t-title" name="title" className="input" required minLength={2} maxLength={120} placeholder={t('Contoh: Flowchart login')} /></div>
      <div className="field"><label htmlFor="t-desc">{t('Deskripsi')}</label>
        <textarea id="t-desc" name="description" className="input" maxLength={2000} placeholder={t('Instruksi untuk siswa…')} /></div>
      <div className="field-row">
        <div className="field"><label htmlFor="t-pts">{t('Poin XP (1–10.000)')}</label>
          <input id="t-pts" name="points" type="number" min={1} max={10000} defaultValue={100} className="input" required /></div>
        <div className="field"><label htmlFor="t-due">{t('Tenggat (opsional)')}</label>
          <input id="t-due" name="due_at" type="datetime-local" className="input" /></div>
      </div>
      <small className="muted">{t('Lampiran dari guru (opsional, maks 5 file):')}</small>
    </Uploader>
  );
}
