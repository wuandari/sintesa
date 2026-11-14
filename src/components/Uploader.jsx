'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

// Form unggah umum: kirim FormData (field `files`) ke `action`, lalu refresh halaman.
export default function Uploader({ action, label = 'Unggah', multiple = true, warn, children, fields = null, onDone }) {
  const { t } = useT();
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const picked = fd.getAll('files').filter((f) => f && f.size);
    if (fields !== 'optional' && picked.length === 0) { setMsg({ ok: false, text: t('Pilih file dulu.') }); return; }
    if (picked.some((f) => f.size > 15 * 1024 * 1024)) { setMsg({ ok: false, text: t('Ada file yang melebihi 15 MB.') }); return; }
    if (warn && !window.confirm(warn)) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(action, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(data.message || (res.ok ? 'Berhasil' : 'Gagal')) });
      if (res.ok) { form.reset(); router.refresh(); onDone?.(data); }
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="uploader">
      {children}
      <div className="field">
        <input type="file" name="files" className="input" multiple={multiple} />
        <small className="muted">{t('Maksimal 15 MB per file.')}</small>
      </div>
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} role="status">{msg.text}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Mengunggah…' : label}</button>
    </form>
  );
}
