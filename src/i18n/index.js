// Alih bahasa sederhana: kunci = teks bahasa Indonesia, nilai = terjemahan Inggris (src/i18n/en.js).
// Teks yang belum ada terjemahannya tampil apa adanya (Indonesia). Variabel ditulis {nama}.
import EN from './en.js';

export const LANG_COOKIE = 'sintesa_lang';
export const normLang = (v) => (v === 'en' ? 'en' : 'id');

export function translate(lang, text, vars) {
  let out = lang === 'en' ? (EN[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}
export const makeT = (lang) => (text, vars) => translate(lang, text, vars);
export const localeOf = (lang) => (lang === 'en' ? 'en-US' : 'id-ID');
