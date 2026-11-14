import { redirect } from 'next/navigation';
import { getCurrentUser, homeFor } from '@/lib/auth.js';
import AuthForm from '@/components/AuthForm.jsx';
import { getT } from '@/i18n/server.js';
import { LangSwitch } from '@/i18n/client.jsx';

export const metadata = { title: 'Daftar — Sintesa' };

export default async function RegisterPage() {
  const { t } = await getT();
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <div className="auth">
      <section className="auth-left">
        <div className="auth-brand">{t('✦ Sintesa')}</div>
        <div>
          <h1>{t('Buat ruang belajar interaktifmu.')}</h1>
          <p>{t('Daftar sebagai murid Kelas 10 RPL dan gunakan satu platform untuk belajar dengan materi visual 3D dan Augmented Reality.')}</p>
        </div>
        <div className="auth-tag">{t('Belajar · Berkreasi · Berinteraksi')}</div>
      </section>
      <section className="auth-right">
        <div className="auth-lang"><LangSwitch /></div>
        <div className="auth-card">
          <h2>{t('Buat akun murid')}</h2>
          <p className="sub">{t('Pendaftaran terbuka untuk murid Kelas 10 RPL. Akun guru dibuatkan oleh admin.')}</p>
          <AuthForm mode="register" />
        </div>
      </section>
    </div>
  );
}
