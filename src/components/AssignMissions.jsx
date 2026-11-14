'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

// Kartu "Library Materi AR": + Tugaskan / ✓ Ditugaskan.
export default function AssignMissions({ classId, missions, assigned }) {
  const { t } = useT();
  const router = useRouter();
  const [busy, setBusy] = useState('');
  async function toggle(slug, on) {
    setBusy(slug);
    try {
      await fetch(`/api/classes/${classId}/missions`, { method: on ? 'DELETE' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      router.refresh();
    } catch { /* biarkan */ }
    setBusy('');
  }
  return (
    <div className="mat-grid">
      {missions.map((m) => {
        const on = assigned.includes(m.slug);
        return (
          <div key={m.slug} className="card mat-card">
            <div className="mat-top"><div>🧊</div></div>
            <div className="mat-body">
              <span className="lab">{t('SMK ·')}{' '}{t(m.category)}</span><b>{m.title}</b><p>{m.text}</p>
              <div className="mat-foot"><span>{on ? t('✓ Sudah dibagikan') : t('Siap dibagikan')}</span>
                <button type="button" disabled={busy === m.slug} className={`btn btn-sm ${on ? 'btn-soft' : 'btn-primary'}`} onClick={() => toggle(m.slug, on)}>{busy === m.slug ? '…' : on ? t('Batalkan') : t('+ Tugaskan')}</button></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
