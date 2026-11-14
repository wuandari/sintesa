'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export default function CustomMaterialForm({ classId }) {
  const { t } = useT();
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget; const fd = new FormData(form); const f = fd.get('model');
    if (!f || !f.size) { setMsg({ ok: false, text: t('Pilih file model .glb.') }); return; }
    if (f.size > 15 * 1024 * 1024) { setMsg({ ok: false, text: t('Model melebihi 15 MB.') }); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/classes/${classId}/materi`, { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(d.message || 'Gagal.') });
      if (res.ok) { form.reset(); router.refresh(); }
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="uploader">
      <div className="field"><label htmlFor="cm-title">{t('Judul materi')}</label><input id="cm-title" name="title" className="input" required minLength={2} maxLength={100} placeholder={t('Contoh: Anatomi Jantung Manusia')} /></div>
      <div className="field-row">
        <div className="field"><label htmlFor="cm-subj">{t('Mata pelajaran')}</label>
          <select id="cm-subj" name="subject" className="input" required defaultValue="">
            <option value="" disabled>{t('Pilih mata pelajaran')}</option>
            <option value="Informatika">{t('Informatika')}</option>
            <option value="Dasar-dasar PPLG">{t('Dasar-dasar PPLG')}</option>
            <option value="Sistem Komputer">{t('Sistem Komputer')}</option>
          </select></div>
      </div>
      <div className="field"><label htmlFor="cm-desc">{t('Deskripsi')}</label><textarea id="cm-desc" name="description" className="input" maxLength={1000} placeholder={t('Apa yang dipelajari dari model ini?')} /></div>
      <div className="field"><label htmlFor="cm-model">{t('Model 3D (.glb, maks 15 MB)')}</label><input id="cm-model" name="model" type="file" accept=".glb" className="input" /></div>
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Mengunggah…' : '+ Tambah Materi AR'}</button>
    </form>
  );
}
