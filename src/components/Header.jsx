'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { homeFor } from '@/lib/home.js';
import Flame from './Flame.jsx';
import { useT, LangSwitch } from '@/i18n/client.jsx';

const ROLE_LABEL = { MURID: 'Murid', GURU: 'Guru', ADMIN: 'Admin' };
const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();

function Avatar({ user, className = 'avatar' }) {
  return user.avatarUrl
    ? <img src={user.avatarUrl} alt="" className={`${className} avatar-img`} />
    : <span className={className}>{initial(user.name)}</span>;
}

function Brand() {
  const { t } = useT();
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">✦</span>
      <span className="brand-name">{t('Sintesa')}</span>
    </Link>
  );
}

function JoinClass({ onDone }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const code = new FormData(e.currentTarget).get('code');
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(data.message || (res.ok ? 'Berhasil' : 'Gagal')) });
      if (res.ok) {
        router.refresh();
        setTimeout(() => { setOpen(false); setMsg(null); onDone?.(); }, 1200);
      }
    } catch {
      setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') });
    }
    setBusy(false);
  }

  if (!open) return <button className="dashed" onClick={() => setOpen(true)}>{t('+ Gabung Kelas Lain')}</button>;
  return (
    <form className="join-box" onSubmit={submit}>
      <input name="code" className="input" placeholder={t('Kode kelas, mis. KELAS-782BG')} required autoFocus />
      {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} style={{ margin: 0 }}>{msg.text}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Menggabung...' : 'Gabung'}</button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => { setOpen(false); setMsg(null); }}>{t('Batal')}</button>
      </div>
    </form>
  );
}

export default function Header({ user, classes = [], taskCount = 0, streak = null }) {
  const { t } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.assign('/');
  }

  const isTeacher = user && user.role !== 'MURID';
  const dash = user ? homeFor(user.role) : '/login';
  const nav = [
    { href: '/', ico: '🏠', label: 'Beranda' },
    ...(user ? [{ href: dash, ico: '📊', label: 'Dashboard' }, { href: '/tugas', ico: '📌', label: 'Tugas' }, { href: '/library', ico: '📁', label: 'Library' }] : []),
    { href: user ? '/ar' : '/register', ico: '🧊', label: 'Misi AR' },
  ];
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header className="site-header">
        <div className="wrap header-in">
          <div className="header-left">
            <button className="hamb" aria-label={t('Buka menu')} aria-expanded={open} onClick={() => setOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <Brand />
          </div>
          <div className="header-right">
            <LangSwitch />
            {user ? (
              <>
                {streak !== null && (
                  <Link href="/siswa" className="hdr-streak" title={t('Streak {n} hari', { n: streak })}><Flame count={streak} size={16} /> {streak}</Link>
                )}
                <div className="user-chip">
                  <Avatar user={user} />
                  <div className="meta"><b>{user.name}</b><span>{t(ROLE_LABEL[user.role])}</span></div>
                </div>
                <button className="btn-header" onClick={logout}>{t('Keluar')}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-header">{t('Masuk')}</Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: '11px 18px' }}>{t('Daftar Gratis')}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('Menu')}>
            <div className="drawer-head">
              <Brand />
              <button className="hamb" aria-label={t('Tutup menu')} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="drawer-body">
              {user && (
                <div className="profile-card">
                  <Avatar user={user} className="avatar avatar-lg" />
                  <div>
                    <b>{user.name}</b>
                    <span>{t(ROLE_LABEL[user.role])}{' '}{t('· Kelas 10 RPL')}</span>
                    {isTeacher && <div className="chip-blue">🏫 {classes.length}{' '}{t('kelas diajar')}</div>}
                  </div>
                </div>
              )}

              {nav.map((n) => (
                <Link key={n.label} href={n.href} className={`nav-card ${isActive(n.href) ? 'active' : ''}`}>
                  <span className="nav-ico">{n.ico}</span>{t(n.label)}<span className="go">→</span>
                </Link>
              ))}

              {user && (
                <div className="side-box">
                  <div className="side-box-head">{t('🏫 Kelas Saya')}{' '}<span className="count-pill">{classes.length}</span></div>
                  {classes.length === 0 ? (
                    <div className="side-empty">{t('Belum ada kelas.')}</div>
                  ) : (
                    classes.map((c) => (
                      <Link key={c.id} href={isTeacher ? `/guru/kelas/${c.id}` : '/ar'} className="side-item">
                        <div><b>{c.name}</b><span>{t('Kode')}{' '}{c.code}</span></div><span>→</span>
                      </Link>
                    ))
                  )}
                  <Link href={isTeacher ? '/guru' : '/ar'} className="side-link">
                    {isTeacher ? '+ Kelola kelas →' : 'Buka halaman AR →'}
                  </Link>
                </div>
              )}

              {user && !isTeacher && (
                <>
                  <div className="side-box">
                    <div className="side-box-head">{t('📌 Tugas Saya')}{' '}<span className="count-pill">{taskCount}</span></div>
                    <div className="side-empty">{taskCount === 0 ? t('Belum ada tugas.') : t('{n} tugas aktif', { n: taskCount })}</div>
                    <Link href="/tugas" className="side-link">{t('Buka halaman Tugas →')}</Link>
                  </div>
                  <JoinClass onDone={() => setOpen(false)} />
                </>
              )}

              {!user && (
                <div style={{ display: 'grid', gap: 10, marginTop: 6 }}>
                  <Link href="/login" className="btn btn-soft">{t('Masuk')}</Link>
                  <Link href="/register" className="btn btn-primary">{t('Daftar Gratis')}</Link>
                </div>
              )}
            </div>

            {user && (
              <div className="drawer-foot">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar user={user} />
                  <Link href="/profil" style={{ lineHeight: 1.25 }}>
                    <b style={{ fontSize: 14 }}>{user.name}</b>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t(ROLE_LABEL[user.role])}{' '}{t('· Profil →')}</div>
                  </Link>
                </div>
                <button className="btn btn-soft btn-block" onClick={logout}>{t('Keluar')}</button>
                <small>{t('Belajar · Bermain · Berkreasi')}</small>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
