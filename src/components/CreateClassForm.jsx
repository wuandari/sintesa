'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export default function CreateClassForm() {
  const { t } = useT();
  const router = useRouter();
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(t(''));
    setOk('');
    setBusy(true);
    const formEl = e.currentTarget;
    const payload = Object.fromEntries(new FormData(formEl).entries());
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(t(data.message || 'Gagal membuat kelas.'));
      } else {
        formEl.reset();
        setOk(`Kelas dibuat. Kode: ${data.code}`);
        router.refresh();
      }
    } catch {
      setError(t('Tidak bisa terhubung ke server.'));
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {ok && <div className="alert alert-ok" role="status">{ok}</div>}
      <div className="field">
        <label htmlFor="cname">{t('Nama Kelas')}</label>
        <input id="cname" name="name" className="input" placeholder={t('Contoh: RPL 10-A')} required minLength={2} maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="cdesc">{t('Deskripsi')}</label>
        <textarea id="cdesc" name="description" className="input" placeholder={t('Deskripsi singkat kelas...')} maxLength={300} />
      </div>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Membuat...' : '+ Buat Kelas'}</button>
    </form>
  );
}
