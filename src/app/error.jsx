'use client';
import { useT } from '@/i18n/client.jsx';

export default function GlobalError({ reset }) {
  const { t } = useT();
  return (
    <main className="wrap page" style={{ textAlign: 'center', paddingTop: 90 }}>
      <div style={{ fontSize: 64 }}>🛠️</div>
      <h1 style={{ fontSize: 34, margin: '10px 0' }}>{t('Terjadi kesalahan')}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 22 }}>{t('Coba muat ulang. Bila berulang, pastikan database dan file .env sudah benar.')}</p>
      <button className="btn btn-primary" onClick={() => reset()}>{t('Coba lagi')}</button>
    </main>
  );
}
