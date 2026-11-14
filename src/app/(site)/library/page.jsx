import Link from 'next/link';
import { requireUser } from '@/lib/auth.js';
import { libraryStats, listLibrary, studentArchives } from '@/lib/library.js';
import DropUploader from '@/components/DropUploader.jsx';
import { DeleteButton } from '@/components/LibraryManager.jsx';
import { fmtDate, fmtSize } from '@/lib/format.js';
import { homeFor } from '@/lib/home.js';
import { firstName } from '@/lib/gamification.js';
import { query } from '@/lib/db.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Library — Sintesa' };
const ICON = { dokumen: '📄', gambar: '🖼️', pdf: '📕', video: '🎬', arsip: '🗜️', lainnya: '📦' };
const CATS = [['semua', '📁 Semua file'], ['gambar', '🖼️ Gambar'], ['pdf', '📕 PDF'], ['dokumen', '📄 Dokumen'], ['video', '🎬 Video'], ['arsip', '🗜️ Arsip']];
const FORMATS = [['🖼️', 'PNG · JPG · WEBP'], ['📕', 'PDF'], ['📘', 'DOC · DOCX'], ['📊', 'PPT · PPTX'], ['📗', 'XLS · XLSX · CSV'], ['🎬', 'MP4 · MP3 · ZIP · TXT']];

export default async function LibraryPage({ searchParams }) {
  const { t, locale } = await getT();
  const user = await requireUser();
  const isStudent = user.role === 'MURID';
  const sp = await searchParams;
  const q = typeof sp?.q === 'string' ? sp.q : '';
  const type = CATS.some(([k]) => k === sp?.type) ? sp.type : 'semua';
  const sort = typeof sp?.sort === 'string' ? sp.sort : 'terbaru';
  const [mine, theirs, stats, taskCount] = await Promise.all([
    listLibrary(user.id, { q, type, sort }),
    isStudent ? [] : studentArchives(user.id, { q, type, sort }),
    libraryStats(user.id),
    isStudent ? 0 : query('SELECT COUNT(*)::int AS n FROM tasks WHERE teacher_id = $1', [user.id]).then((r) => r[0].n),
  ]);
  const files = isStudent ? mine : [...mine.map((f) => ({ ...f, owner_name: null })), ...theirs];
  const total = files.reduce((n, f) => n + f.size, 0);
  const cnt = (t) => files.filter((f) => f.type === t).length;
  const qs = (o) => `/library?${new URLSearchParams({ q, type, sort, ...o }).toString()}`;

  return (
    <main className="wrap page">
      <section className="hero-panel hero-teal">
        <div className="eyebrow">{t('📁 Arsip Library')}</div>
        <h1>{t('Halo,')}{' '}{firstName(user.name)}{t('! Arsip pribadimu tersimpan rapi di sini.')}</h1>
        <p className="lead">{isStudent
          ? 'Simpan file bebas apa pun — foto, PDF, Word, PPT — sebagai arsip murni (tanpa XP). Untuk tugas dari guru (+XP poin guru), kumpulkan di halaman Tugas.'
          : 'Pantau arsip mandiri siswa. Untuk menilai TUGAS (+poin guru), buka halaman Tugas.'}</p>
        <div className="hero-pills">
          <span className="hero-pill">📁 {files.length}{' '}{t('arsip')}</span>
          {isStudent && <span className="hero-pill">📌 {stats.task_files}{' '}{t('file tugas (di /tugas)')}</span>}
          <span className="hero-pill">💾 {fmtSize(total)}</span>
          <span className="hero-pill">🖼️ {cnt('gambar')}{' '}{t('gambar')}</span><span className="hero-pill">📕 {cnt('pdf')}{' '}{t('PDF')}</span>
        </div>
        <div className="hero-actions"><Link href="/tugas" className="btn btn-white">{t('📌 Buka Tugas')}{' '}{isStudent ? t('Guru') : t('& Nilai')} →</Link></div>
      </section>

      <div className="lib-layout">
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          {!isStudent && (
            <div className="card panel"><h3>{t('📌 Penilaian tugas pindah ke /tugas (')}{taskCount}{' '}{t('tugas)')}</h3>
              <p className="sub">{t('Semua file tugas (+poin guru, bisa dinilai) dikumpulkan di halaman Tugas. Di bawah ini hanya arsip mandiri siswa.')}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link href="/tugas" className="btn btn-primary">{t('📌 Buka Tugas & Nilai →')}</Link><Link href={homeFor(user.role)} className="btn btn-soft">{t('Dashboard Guru')}</Link></div>
            </div>
          )}
          <div className="card panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><h3>{t('📁 Simpan Arsip Pribadi')}</h3><span className="chip">{t('0 XP · arsip')}</span></div>
            <p className="sub">{t('Gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4, model 3D (GLB) — maks. 15 MB per file. Arsip tidak menambah XP.')}</p>
            <DropUploader action="/api/library" formats="png · jpg · jpeg · webp · gif · pdf · doc · docx · ppt · pptx · xls · xlsx · csv · txt · zip · mp4 · mp3 · glb · gltf" />
          </div>

          <section>
            <form className="filters2" method="get" action="/library">
              <input name="q" defaultValue={q} className="input" placeholder={t('🔎 Cari nama file, catatan…')} aria-label={t('Cari')} />
              <input type="hidden" name="type" value={type} />
              <select name="sort" defaultValue={sort} className="input" aria-label={t('Urutkan')}>
                <option value="terbaru">{t('Terbaru')}</option><option value="terlama">{t('Terlama')}</option><option value="nama">{t('Nama A–Z')}</option><option value="ukuran">{t('Terbesar')}</option>
              </select>
              <button className="btn btn-soft">{t('Cari')}</button>
            </form>
            <div className="cat-chips" style={{ justifyContent: 'flex-start', margin: '12px 0 18px' }}>
              {CATS.map(([k, label]) => <Link key={k} href={qs({ type: k })} className={`cat-chip ${type === k ? 'on' : ''}`}>{label}</Link>)}
            </div>
            {files.length === 0 ? (
              <div className="card empty" style={{ padding: 44 }}><div style={{ fontSize: 44 }}>📁</div><b style={{ fontSize: 18, color: 'var(--text)' }}>{t('Arsip masih kosong')}</b>
                <p>{t('Simpan arsip pertamamu lewat panel di atas (arsip tanpa XP). Untuk tugas guru (+XP), kumpulkan di halaman Tugas.')}</p></div>
            ) : (
              <div className="lib-grid lib-grid3">
                {files.map((f) => (
                  <article key={f.id} className="card lib-card">
                    {f.type === 'gambar' && !f.name.toLowerCase().endsWith('.svg')
                      ? <a href={f.url} target="_blank" rel="noopener noreferrer"><img src={f.url} alt={f.name} className="lib-thumb" loading="lazy" /></a>
                      : <div className="lib-ico">{ICON[f.type]}</div>}
                    <b title={f.name}>{f.name}</b>
                    {f.note && <span className="muted">📝 {f.note}</span>}
                    <span className="muted">{f.owner_name ? `👤 ${f.owner_name} · ` : ''}{fmtSize(f.size)} · {fmtDate(f.created_at, locale)}</span>
                    <div className="lib-actions">
                      <a className="btn btn-soft btn-sm" href={f.url} target="_blank" rel="noopener noreferrer">{t('Buka')}</a>
                      {!f.owner_name && <DeleteButton url={`/api/library/${f.id}`} confirm={t('Hapus "{name}"?', { name: f.name })} />}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="card panel"><h3 style={{ fontSize: 16 }}>{t('💡 Tentang Arsip')}</h3>
            <div className="about-list">
              <p><b>{t('0 XP')}</b>{' '}{t('— arsip murni penyimpanan')}</p>
              <p>📌 <b>{t('Tugas guru:')}</b>{' '}{t('XP = poin guru, kumpulkan di')}{' '}<Link href="/tugas" className="lnk">{t('/tugas')}</Link></p>
              <p>🧊 <b>{t('Misi AR:')}</b>{' '}{t('XP = +100/materi, mainkan di')}{' '}<Link href="/ar" className="lnk">{t('/ar')}</Link></p>
              <p className="muted">{t('Arsip tidak dinilai guru')}</p></div></div>
          <div className="card panel"><h3 style={{ fontSize: 16 }}>{t('📎 Format didukung')}</h3>
            <div className="about-list">{FORMATS.map(([i, t]) => <p key={t}>{i} {t}</p>)}<p className="muted">{t('Maksimal 15 MB per file. Preview langsung untuk gambar & PDF.')}</p></div></div>
          <Link href="/tugas" className="btn btn-primary" style={{ width: '100%' }}>{t('📌 Ke Halaman Tugas')}</Link>
          <Link href={homeFor(user.role)} className="lnk" style={{ textAlign: 'center' }}>{t('← Kembali ke Beranda')}</Link>
        </aside>
      </div>
    </main>
  );
}
