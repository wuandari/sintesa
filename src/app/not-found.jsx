import Link from 'next/link';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Halaman tidak ditemukan — Sintesa' };

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main className="wrap page" style={{ textAlign: 'center', paddingTop: 90 }}>
      <div style={{ fontSize: 64 }}>🧭</div>
      <h1 style={{ fontSize: 34, margin: '10px 0' }}>{t('Halaman tidak ditemukan')}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 22 }}>{t('Tautannya salah atau kamu tidak punya akses ke halaman ini.')}</p>
      <Link href="/" className="btn btn-primary">{t('← Kembali ke Beranda')}</Link>
    </main>
  );
}
