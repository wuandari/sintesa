'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

export function DeleteButton({ url, confirm: ask, label = 'Hapus', className = 'btn btn-soft btn-sm' }) {
  const { t } = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!window.confirm(ask)) return;
    setBusy(true);
    try { await fetch(url, { method: 'DELETE' }); router.refresh(); } catch { /* biarkan */ }
    setBusy(false);
  }
  return <button type="button" className={className} disabled={busy} onClick={go}>{busy ? '…' : t(label)}</button>;
}
