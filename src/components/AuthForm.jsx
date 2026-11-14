'use client';

import { useState } from 'react';
import Link from 'next/link';
import PasswordInput from './PasswordInput.jsx';
import { useT } from '@/i18n/client.jsx';

// Satu form untuk login dan daftar. mode: 'login' | 'register'
export default function AuthForm({ mode }) {
  const { t } = useT();
  const isRegister = mode === 'register';
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(t(''));
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(t(data.message || 'Terjadi kesalahan, coba lagi.'));
        setBusy(false);
        return;
      }
      window.location.assign(data.redirect || '/');
    } catch {
      setError(t('Tidak bisa terhubung ke server. Periksa koneksi internetmu.'));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {isRegister && (
        <div className="field">
          <label htmlFor="name">{t('Nama Lengkap')}</label>
          <input id="name" name="name" className="input" placeholder={t('Nama kamu')} autoComplete="name" required minLength={2} maxLength={80} />
        </div>
      )}

      <div className="field">
        <label htmlFor="email">{t('Email')}</label>
        <input id="email" name="email" type="email" className="input" placeholder={t('nama@email.com')} autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="password">{t('Password')}</label>
        <PasswordInput
          id="password"
          name="password"
          placeholder={isRegister ? 'Minimal 6 karakter' : 'Password kamu'}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          minLength={isRegister ? 6 : undefined}
          maxLength={72}
        />
      </div>

      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Memproses...' : isRegister ? 'Daftar sebagai Murid' : 'Masuk'}
      </button>

      <p className="switch">
        {isRegister ? (
          <>{t('Sudah punya akun?')}{' '}<Link href="/login">{t('Masuk di sini')}</Link></>
        ) : (
          <>{t('Belum punya akun?')}{' '}<Link href="/register">{t('Daftar di sini')}</Link></>
        )}
      </p>
    </form>
  );
}
