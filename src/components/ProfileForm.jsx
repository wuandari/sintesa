'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export default function ProfileForm({ name, nis, bio, isStudent }) {
  const { t } = useT();
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [len, setLen] = useState((bio || '').length);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), nis: fd.get('nis'), bio: fd.get('bio') }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(data.message || (res.ok ? 'Tersimpan' : 'Gagal')) });
      if (res.ok) router.refresh();
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="uploader">
      <div className="field"><label htmlFor="pn">{t('Nama lengkap')}</label>
        <input id="pn" name="name" className="input" defaultValue={name} required minLength={2} maxLength={80} /></div>
      {isStudent && (
        <div className="field"><label htmlFor="pnis">{t('NIS (opsional)')}</label>
          <input id="pnis" name="nis" className="input" defaultValue={nis || ''} maxLength={20} placeholder={t('mis. 2425.10.001')} /></div>
      )}
      <div className="field"><label htmlFor="pb">{t('Bio singkat')}{' '}<span className="muted">({len}/200)</span></label>
        <textarea id="pb" name="bio" className="input" rows={3} maxLength={200} defaultValue={bio || ''}
          onChange={(e) => setLen(e.target.value.length)} placeholder={t('Ceritakan sedikit tentang dirimu, minat, atau cita-cita…')} /></div>
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Profil'}</button>
    </form>
  );
}
