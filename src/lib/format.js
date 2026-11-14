export function fmtSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
export function fmtDate(d, locale = 'id-ID') {
  if (!d) return '';
  return new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });
}
export const STATUS = {
  SUBMITTED: { label: 'Dikumpulkan', cls: 'st-blue' },
  GRADED: { label: 'Sudah dinilai', cls: 'st-green' },
  REVISION_REQUESTED: { label: 'Perlu revisi', cls: 'st-orange' },
  NONE: { label: 'Belum dikumpulkan', cls: 'st-gray' },
};
