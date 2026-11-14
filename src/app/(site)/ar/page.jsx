import Link from 'next/link';
import { requireUser } from '@/lib/auth.js';
import { MAPEL, mapelLabel, missionsFor } from '@/data/missions.js';
import { getT } from '@/i18n/server.js';
import { CONTENT, publicContent } from '@/data/missionContent.js';
import { assignedSlugsForStudent, classMaterialsForStudent, doneSlugs, openMission, progressFor } from '@/lib/missions.js';
import { homeFor } from '@/lib/home.js';
import MissionPlayer from '@/components/MissionPlayer.jsx';
import JoinClassForm from '@/components/JoinClassForm.jsx';

export const metadata = { title: 'Misi AR — Sintesa' };
const grad = (g) => `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
const STATE = { new: 'Belum dibuka', opened: 'Sudah dibuka', done: '✅ Selesai' };

export default async function ArPage({ searchParams }) {
  const user = await requireUser();
  const { t, lang } = await getT();
  const MISSIONS = missionsFor(lang);
  const sp = await searchParams;
  const isStudent = user.role === 'MURID';
  const kat = MAPEL.includes(sp?.k) ? sp.k : '';
  const list = kat ? MISSIONS.filter((m) => m.category === kat) : MISSIONS;
  const sel = list.find((m) => m.slug === sp?.m) || list[0];

  const [progress, done, assigned, classes] = isStudent
    ? await Promise.all([progressFor(user.id), doneSlugs(user.id), assignedSlugsForStudent(user.id), classMaterialsForStudent(user.id)])
    : [{}, new Set(), new Set(), []];
  if (isStudent && sel && assigned.has(sel.slug) && !progress[sel.slug] && !done.has(sel.slug)) await openMission(user.id, sel.slug).catch(() => {});
  const totalSoal = Object.values(CONTENT).reduce((n, c) => n + c.soal.length, 0);
  const totalMateri = Object.values(CONTENT).reduce((n, c) => n + c.materi.length, 0);
  const href = (m, k = kat) => `/ar?${new URLSearchParams({ ...(k ? { k } : {}), m }).toString()}#misi`;

  return (
    <main className="wrap page">
      <section className="hero-panel">
        <div className="eyebrow">🧊 {t('Misi AR · Kelas 10 RPL SMK')}</div>
        <h1>{t('Pilih misimu, pelajari materinya, jawab soalnya.')}</h1>
        <p className="lead">{t('{n} misi RPL Kelas 10 dari 3 mata pelajaran: Informatika, Dasar-dasar PPLG, dan Sistem Komputer. Tiap misi punya model 3D/AR, materi, soal, dan game hubungkan komponen.', { n: MISSIONS.length })}</p>
        <div className="hero-pills">
          <span className="hero-pill">🧊 {MISSIONS.length} {t('misi AR')}</span><span className="hero-pill">📖 {totalMateri} {t('materi')}</span><span className="hero-pill">📝 {totalSoal} {t('soal latihan')}</span>
        </div>
        <div className="hero-actions">
          <Link href={homeFor(user.role)} className="btn btn-white">📊 {t('Dashboard')}</Link>
          <Link href="/tugas" className="btn btn-white">📌 {t('Tugas')}</Link>
        </div>
      </section>

      <div className="cat-chips" id="misi">
        <Link href="/ar#misi" className={`cat-chip ${!kat ? 'on' : ''}`}>🌐 {t('Semua · Kelas 10 RPL')}</Link>
        {MAPEL.map((c) => <Link key={c} href={`/ar?k=${encodeURIComponent(c)}#misi`} className={`cat-chip ${kat === c ? 'on' : ''}`}>{mapelLabel(c, lang)}</Link>)}
      </div>

      <div className="ar-split">
        <div className="mission-list2">
          {list.map((m) => (
            <Link key={m.slug} href={href(m.slug)} className={`mitem ${sel?.slug === m.slug ? 'on' : ''}`}>
              <span className="m-ico" style={{ background: grad(m.gradient) }}>{m.icon}</span>
              <div className="who"><b>{m.title}</b><small>{t('Kelas 10 RPL')} · {mapelLabel(m.category, lang)} · +{m.xp} XP</small></div>
              <span className="go">{done.has(m.slug) ? '✅' : '→'}</span>
            </Link>
          ))}
        </div>
        {sel && (
          <MissionPlayer
            key={sel.slug}
            mission={{ slug: sel.slug, title: sel.title, icon: sel.icon, gradient: sel.gradient, objective: sel.objective, text: sel.text, tags: sel.tags, kicker: `${t('Kelas 10 RPL')} · ${mapelLabel(sel.category, lang)} · +${sel.xp} XP` }}
            content={publicContent(sel.slug, lang)}
            modelUrl={`/models/${sel.slug}.glb`}
            canQuiz={isStudent}
            assigned={assigned.has(sel.slug)}
            done={done.has(sel.slug)}
            passed={!!progress[sel.slug]?.passed}
            bestScore={progress[sel.slug]?.best_score ?? null}
          />
        )}
      </div>

      {isStudent && (
        <section className="kelasku">
          <span className="eyebrow2">🏫 {t('KELASKU')}</span>
          <h2>{t('Materi AR dari gurumu')}</h2>
          <p className="sec-sub">{t('Gabung kelas dengan kode, lalu buka materi 3D/AR-nya (+100 XP per misi selesai).')}</p>
          <div className="card join-box"><div><b>{t('Gabung Kelas Baru')}</b><div className="muted">{t('Masukkan kode kelas dari gurumu.')}</div></div><JoinClassForm /></div>
          {classes.length === 0 && <div className="card empty">{t('Belum ada kelas. Gabung dengan kode dari gurumu untuk melihat materinya.')}</div>}
          {classes.map((c) => (
            <div key={c.id} className="class-sec">
              <div className="class-sec-head"><div><h3>{c.name}</h3><div className="muted">{t('Guru')}: {c.teacher_name} · {t('Kode')} {c.code}</div></div></div>
              {c.items.length === 0 ? <div className="card empty">{t('Guru belum membagikan materi di kelas ini.')}</div> : (
                <div className="mat-grid">
                  {c.items.map((m) => (
                    <div key={m.slug} className="card mat-card">
                      <div className="mat-top"><div>🧊<small>{t('3D / AR siap')} · +{m.xp ?? 100} XP</small></div></div>
                      <div className="mat-body">
                        <span className="lab">{m.kind === 'custom' ? m.category : mapelLabel(m.category, lang)}</span><b>{m.title}</b>
                        <div className="mat-foot"><span>{t(STATE[m.state])}</span>
                          <Link className="btn btn-primary btn-sm" href={m.kind === 'custom' ? `/ar/materi/${m.slug.slice(2)}` : `/ar?m=${m.slug}#misi`}>{t('Buka Misi')}</Link></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
