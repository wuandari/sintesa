'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export default function JoinClassForm() {
  const { t } = useT();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/classes/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setMsg({ ok: true, text: d.already ? t('Kamu sudah ada di kelas ini.') : t('Berhasil masuk {name}!', { name: d.class?.name || t('kelas') }) }); setCode(''); router.refresh(); }
      else setMsg({ ok: false, text: t(d.message || 'Gagal bergabung.') });
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }
  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10 }}>
        <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t('CONTOH: KELAS-X9K2A')} aria-label={t('Kode kelas')} maxLength={20} />
        <button className="btn btn-primary" disabled={busy || !code.trim()}>{busy ? '…' : t('Gabung Kelas')}</button>
      </form>
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} style={{ marginTop: 10, marginBottom: 0 }}>{msg.text}</div>}
    </div>
  );
}
