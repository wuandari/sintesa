import { redirect } from 'next/navigation';
import { getCurrentUser, homeFor } from '@/lib/auth.js';
import AuthForm from '@/components/AuthForm.jsx';
import { getT } from '@/i18n/server.js';
import { LangSwitch } from '@/i18n/client.jsx';

export const metadata = { title: 'Masuk — Sintesa' };

export default async function LoginPage() {
  const { t } = await getT();
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <div className="auth">
      <section className="auth-left">
        <div className="auth-brand">{t('✦ Sintesa')}</div>
        <div>
          <h1>{t('Belajar jadi lebih hidup dengan 3D & AR.')}</h1>
          <p>{t('Platform pembelajaran interaktif untuk guru dan siswa. Masuk untuk membuka kelas, materi, dan pengalaman belajar 3D.')}</p>
          <div className="auth-points">
            <div className="auth-point">{t('🧑‍🏫 Kelola kelas dengan mudah')}</div>
            <div className="auth-point">{t('🧊 Eksplorasi materi dalam 3D')}</div>
            <div className="auth-point">{t('📱 Aktifkan pengalaman AR di perangkat yang mendukung')}</div>
          </div>
        </div>
        <div className="auth-tag">{t('Sintesa · Platform Pembelajaran')}</div>
      </section>
      <section className="auth-right">
        <div className="auth-lang"><LangSwitch /></div>
        <div className="auth-card">
          <h2>{t('Selamat datang 👋')}</h2>
          <p className="sub">{t('Masuk ke akunmu untuk melanjutkan pembelajaran.')}</p>
          <AuthForm mode="login" />
        </div>
      </section>
    </div>
  );
}
