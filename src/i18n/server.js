// Untuk Server Component / Route Handler: const { t, lang } = await getT();
import { getLang } from '@/lib/lang.js';
import { makeT, localeOf } from './index.js';

export async function getT() {
  const lang = await getLang();
  return { t: makeT(lang), lang, locale: localeOf(lang) };
}
