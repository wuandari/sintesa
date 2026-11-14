'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

// Zona unggah: seret file atau klik. Mengirim ke `action` (field `files` + `note`).
export default function DropUploader({ action, formats, withNote = true, label = 'Simpan ke Arsip' }) {
  const { t } = useT();
  const router = useRouter();
  const input = useRef(null);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  function add(list) { setFiles([...list].slice(0, 10)); setMsg(null); }
  async function send() {
    if (files.length === 0) { setMsg({ ok: false, text: t('Pilih file terlebih dahulu.') }); return; }
    if (files.some((f) => f.size > 15 * 1024 * 1024)) { setMsg({ ok: false, text: t('Ada file yang melebihi 15 MB.') }); return; }
    setBusy(true); setMsg(null);
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f)); if (note) fd.append('note', note);
    try {
      const res = await fetch(action, { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(d.message || (res.ok ? 'Berhasil' : 'Gagal')) });
      if (res.ok) { setFiles([]); setNote(''); if (input.current) input.current.value = ''; router.refresh(); }
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }

  return (
    <div className="dropper">
      <div className={`dropzone ${over ? 'over' : ''}`} role="button" tabIndex={0}
        onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}>
        <div className="dz-ico">☁️</div>
        <b>{t('Seret file ke sini atau klik untuk memilih')}</b>
        <small>{formats}</small>
        {files.length > 0 && <div className="dz-files">{files.map((f) => <span key={f.name + f.size}>📎 {f.name}</span>)}</div>}
        <input ref={input} type="file" multiple hidden onChange={(e) => add(e.target.files)} />
      </div>
      {withNote && (
        <div className="field" style={{ marginTop: 14 }}><label htmlFor="dz-note">{t('Catatan arsip (opsional)')}</label>
          <input id="dz-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder={t('Contoh: Foto praktikum sel — arsip pribadi')} /></div>
      )}
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} role="status">{msg.text}</div>}
      <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={busy} onClick={send}>
        {busy ? t('Mengunggah…') : files.length ? `${t(label)} (${t('{n} file', { n: files.length })})` : t('Pilih file terlebih dahulu')}
      </button>
    </div>
  );
}
