'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export default function AvatarUpload() {
  const { t } = useT();
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = fd.get('avatar');
    if (!f || !f.size) { setMsg({ ok: false, text: t('Pilih foto dulu.') }); return; }
    if (f.size > 2 * 1024 * 1024) { setMsg({ ok: false, text: t('Foto maksimal 2 MB.') }); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(data.message || (res.ok ? 'Berhasil' : 'Gagal')) });
      if (res.ok) router.refresh();
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }
  return (
    <form onSubmit={onSubmit} className="uploader">
      <div className="field"><label htmlFor="av">{t('📷 Ganti foto profil')}</label>
        <input id="av" type="file" name="avatar" accept="image/png,image/jpeg,image/gif,image/webp" className="input" /></div>
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Mengunggah…' : 'Simpan Foto'}</button>
    </form>
  );
}
