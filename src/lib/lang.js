// Bahasa antarmuka: 'id' (default) atau 'en'. Disimpan di cookie `sintesa_lang`.
import { cookies } from 'next/headers';

export const LANG_COOKIE = 'sintesa_lang';
export const LANGS = ['id', 'en'];
export const normLang = (v) => (v === 'en' ? 'en' : 'id');

export async function getLang() {
  return normLang((await cookies()).get(LANG_COOKIE)?.value);
}
