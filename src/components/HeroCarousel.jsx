'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LEVELS } from '@/lib/gamification.js';
import { useT } from '@/i18n/client.jsx';

export default function HeroCarousel({ loggedIn, dashHref }) {
  const { t, locale } = useT();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null);
  const COUNT = 3;

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIdx((i) => (i + 1) % COUNT), 7000);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (i) => setIdx((i + COUNT) % COUNT);
  const startHref = loggedIn ? '/ar' : '/register';

  return (
    <div className="hero-wrap">
      <div
        className="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {/* Slide 1: sambutan */}
          <div className="slide" aria-hidden={idx !== 0}>
            <div className="hello"><span>{t('👋 Selamat datang di')}</span><a href="#cara-kerja" className="help-btn" aria-label={t('Cara kerja')}>?</a></div>
            <div className="blobs" aria-hidden="true">
              <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="blob b4" />
              <div className="wordmark">{t('Sintesa')}</div>
              <div className="tagline">{t('Kelas 10 SMK · RPL')}</div>
              <div className="float-chip fc1">{t('⚡ +100 XP')}</div>
              <div className="float-chip fc2">{t('🏆 MAX Lv.3')}</div>
              <div className="float-chip fc3">{t('🏅 6 Badge')}</div>
            </div>
            <Link href={startHref} className="banner">
              <div><b>{t('🧊 6 Misi AR Kelas 10 RPL menantimu!')}</b><span>{t('Selesaikan misi, kumpulkan XP sampai MAX Lv.3')}</span></div>
              <span className="go">→</span>
            </Link>
            <div className="quick">
              <Link href={loggedIn ? '/ar' : '/register'}><i>🧊</i>{t('Misi AR')}</Link>
              <a href="#gamifikasi"><i>⚡</i>{t('Level & XP')}</a>
              <Link href="/tugas"><i>📌</i>{t('Tugas')}</Link>
              <Link href="/library"><i>📁</i>{t('Library')}</Link>
              <Link href="/register"><i>📝</i>{t('Daftar')}</Link>
            </div>
          </div>

          {/* Slide 2: level */}
          <div className="slide" aria-hidden={idx !== 1}>
            <div className="hello"><span>{t('⚡ Naik level, kumpulkan XP')}</span></div>
            <div className="mini-levels">
              {LEVELS.map((l) => (
                <div className="mini-level" key={l.level}>
                  <span className="icon-tile">{l.icon}</span>
                  <div><b>{t('Level')}{' '}{l.level} — {t(l.name)}</b><span>{l.level === 3 ? t('Mulai {n} XP · MAX', { n: l.min.toLocaleString(locale) }) : t('Mulai {n} XP', { n: l.min.toLocaleString(locale) })}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 3: tugas & library */}
          <div className="slide" aria-hidden={idx !== 2}>
            <div className="hello"><span>{t('📌 Tugas & 📁 Library')}</span></div>
            <div className="mini-levels">
              <div className="mini-level"><span className="icon-tile">📌</span><div><b>{t('Tugas guru')}</b><span>{t('Kumpulkan file, XP sebesar poin guru, dinilai 0–100')}</span></div></div>
              <div className="mini-level"><span className="icon-tile">📁</span><div><b>{t('Library arsip')}</b><span>{t('Simpan file apa pun sebagai arsip pribadi, tanpa XP')}</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="dots" role="tablist" aria-label={t('Slide')}>
        {[0, 1, 2].map((i) => (
          <button key={i} className={`dot ${idx === i ? 'on' : ''}`} onClick={() => go(i)} aria-label={t('Slide {n}', { n: i + 1 })} aria-selected={idx === i} role="tab" />
        ))}
      </div>

      <div className="cta-band">
        <div className="wrap">
          {loggedIn ? (
            <Link href={dashHref} className="btn btn-primary">{t('Buka Dashboard →')}</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary">{t('🔐 Login')}</Link>
              <p>{t('Belum punya akun?')}{' '}<Link href="/register">{t('Daftar sebagai murid →')}</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
