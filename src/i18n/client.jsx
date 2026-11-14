'use client';

import { createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { makeT, localeOf, LANG_COOKIE } from './index.js';

const Ctx = createContext({ lang: 'id', t: makeT('id'), locale: 'id-ID' });

export function LangProvider({ lang, children }) {
  const value = useMemo(() => ({ lang, t: makeT(lang), locale: localeOf(lang) }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);

// Tombol ID | EN. Menyimpan pilihan di cookie lalu memuat ulang data halaman.
export function LangSwitch({ className = '' }) {
  const { lang } = useT();
  const router = useRouter();
  function set(next) {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language / Bahasa">
      <button type="button" className={lang === 'id' ? 'on' : ''} aria-pressed={lang === 'id'} onClick={() => set('id')} title="Bahasa Indonesia">ID</button>
      <button type="button" className={lang === 'en' ? 'on' : ''} aria-pressed={lang === 'en'} onClick={() => set('en')} title="English">EN</button>
    </div>
  );
}
