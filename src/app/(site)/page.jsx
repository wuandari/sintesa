import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel.jsx';
import MissionShowcase from '@/components/MissionShowcase.jsx';
import Leaderboard from '@/components/Leaderboard.jsx';
import { getCurrentUser, homeFor } from '@/lib/auth.js';
import { leaderboard } from '@/lib/users.js';
import { getT } from '@/i18n/server.js';

const FEATURES = [
  ['⚡', 'XP & Level 1–3', 'Materi +100 XP, tugas guru +poin (bisa sampai 10.000!). Level 3 Master Sintesa adalah MAX — kejar XP setinggi-tingginya tanpa batas.'],
  ['🏅', 'Badge & Pencapaian', 'Kumpulkan 6 badge dan jaga streak harianmu 🔥: oranye 10 hari, ungu 30 hari, biru 50 hari.'],
  ['🏆', 'Leaderboard Kelas', 'Papan peringkat real-time memicu kompetisi sehat antar siswa di setiap kelas.'],
  ['🧊', 'AR Khusus RPL', '6 misi 3D/AR untuk Kelas 10 RPL dari 3 mapel — Informatika, Dasar-dasar PPLG, dan Sistem Komputer — lengkap dengan game hubungkan komponen.'],
  ['📁', 'Library Arsip', 'Simpan file apa pun (gambar, PDF, Word, PPT, Excel, video) sebagai arsip pribadi tanpa XP.'],
  ['🎯', 'Misi Terstruktur', 'Alur jelas: gabung kelas → mainkan misi AR → tandai selesai → kumpulkan tugas → naik level.'],
];

const FILETYPES = [
  ['🖼️', 'Gambar', 'PNG, JPG, WEBP'], ['📕', 'PDF', 'Laporan & modul'], ['📘', 'Word', 'DOC, DOCX'],
  ['📊', 'Presentasi', 'PPT, PPTX'], ['📗', 'Spreadsheet', 'XLS, XLSX, CSV'], ['🎬', 'Media', 'MP4, MP3, ZIP'],
];

export default async function Landing() {
  const { t } = await getT();
  let user = null;
  let board = [];
  try {
    user = await getCurrentUser();
    board = (await leaderboard(5)) || [];
  } catch (err) {
    console.error('landing data error:', err.message);
  }

  return (
    <main>
      <HeroCarousel loggedIn={!!user} dashHref={user ? homeFor(user.role) : '/login'} />

      <section className="section" id="gamifikasi">
        <div className="wrap">
          <div className="section-head">
            <span className="pill">{t('🎮 Sistem Gamifikasi')}</span>
            <h2>{t('Kenapa belajar di Sintesa terasa seperti bermain?')}</h2>
            <p className="lead">{t('Kami memadukan psikologi game dengan pedagogi: progres yang terlihat, hadiah instan, dan tantangan yang pas.')}</p>
          </div>
          <div className="grid-3">
            {FEATURES.map(([e, ti, d]) => (
              <article className="card feature" key={ti}>
                <div className="icon-tile">{e}</div>
                <h3>{t(ti)}</h3>
                <p>{t(d)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="ar" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="pill">{t('🧊 AR Khusus RPL')}</span>
            <h2>{t('6 misi, 6 model 3D untuk Kelas 10 RPL')}</h2>
            <p className="lead">{t('Pilih misi, pelajari modelnya, lalu jawab soalnya untuk meraih XP.')}</p>
          </div>
          <MissionShowcase loggedIn={!!user} />
        </div>
      </section>

      <section className="section" id="leaderboard">
        <div className="wrap split">
          <div>
            <span className="pill">{t('🏆 Leaderboard')}</span>
            <h2>{t('Kompetisi sehat yang bikin nagih')}</h2>
            <p className="lead">{t('XP dari materi & tugas terakumulasi otomatis. Siswa berlomba naik peringkat, guru memantau motivasi kelas.')}</p>
            <div className="notes">
              <div className="note"><b>{t('Real-time:')}</b>{' '}{t('XP masuk detik itu juga setelah materi ditandai selesai.')}</div>
              <div className="note"><b>{t('Adil:')}</b>{' '}{t('semua peran terlihat — progres, submission, dan badge.')}</div>
              <div className="note"><b>{t('Memotivasi:')}</b>{' '}{t('selisih XP kecil antar peringkat memicu “satu misi lagi”.')}</div>
            </div>
            <Link href={user ? homeFor(user.role) : '/register'} className="btn btn-primary">{t('Rebut Peringkatmu →')}</Link>
          </div>
          <div className="card lb-card">
            <div className="lb-head"><span>{t('🏆 Papan Peringkat · Live')}</span><span className="live">{t('● LIVE')}</span></div>
            <Leaderboard rows={board} meId={user?.id} />
            <p className="lb-foot">{t('Selesaikan 1 materi (+100 XP) untuk masuk papan peringkat.')}</p>
          </div>
        </div>
      </section>

      <section className="section" id="cara-kerja">
        <div className="wrap">
          <div className="section-head">
            <span className="pill">{t('🛠️ Cara Kerja')}</span>
            <h2>{t('Dari kelas hingga naik level dalam 3 langkah')}</h2>
            <p className="lead">{t('Alur terstruktur untuk guru dan siswa — tanpa pelatihan khusus.')}</p>
          </div>
          <div className="grid-3 steps">
            <article className="card step"><span className="num">1</span><div className="icon-tile" style={{ background: 'transparent' }}>🧑‍🏫</div><div className="who-tag">{t('GURU')}</div><h3>{t('Buat kelas & tugas')}</h3><p>{t('Buat kelas, dapat kode unik, tugaskan materi AR, lalu buat tugas dengan poin XP sesuai keinginanmu.')}</p></article>
            <article className="card step"><span className="num">2</span><div className="icon-tile" style={{ background: 'transparent' }}>🎓</div><div className="who-tag">{t('SISWA')}</div><h3>{t('Kumpulkan tugas')}</h3><p>{t('Gabung pakai kode, buka halaman Tugas, unggah file per tugas — XP poin guru masuk sekali per tugas.')}</p></article>
            <article className="card step"><span className="num">3</span><div className="icon-tile" style={{ background: 'transparent' }}>📁</div><div className="who-tag">{t('BERSAMA')}</div><h3>{t('Arsipkan di Library')}</h3><p>{t('Simpan file bebas apa pun — foto, PDF, Word — sebagai arsip pribadi (tanpa XP, tanpa nilai).')}</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="tugas-library" style={{ paddingTop: 20 }}>
        <div className="wrap split">
          <div>
            <span className="pill">{t('📌 Tugas vs 📁 Library')}</span>
            <h2>{t('Tugas dan arsip kini terpisah rapi')}</h2>
            <p className="lead">{t('Tidak ada lagi kebingungan: tugas guru punya halaman sendiri dengan XP poin guru, Library khusus arsip pribadi.')}</p>
            <div className="notes">
              <div className="note">📌 <b>{t('Halaman Tugas:')}</b>{' '}{t('kumpulkan per tugas guru → XP = poin guru → dinilai 0–100 + feedback.')}</div>
              <div className="note">📁 <b>{t('Halaman Library:')}</b>{' '}{t('arsip bebas (gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4) → 0 XP, tanpa nilai.')}</div>
              <div className="note"><b>{t('Format bebas:')}</b>{' '}{t('gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4 di kedua halaman.')}</div>
            </div>
            <div className="btn-row">
              <Link href="/tugas" className="btn btn-primary">{t('Buka Tugas →')}</Link>
              <Link href="/library" className="btn btn-outline">{t('Buka Library →')}</Link>
            </div>
          </div>
          <div className="filetypes">
            {FILETYPES.map(([e, ti, s]) => (
              <div className="filetype" key={ti}><div className="e">{e}</div><b>{t(ti)}</b><span>{t(s)}</span></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
