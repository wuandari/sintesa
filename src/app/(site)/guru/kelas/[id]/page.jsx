import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth.js';
import { classStudents, getClassForTeacher } from '@/lib/classes.js';
import { getLevel, initial } from '@/lib/gamification.js';
import { missionsFor, mapelLabel } from '@/data/missions.js';
import { assignedForClass, customForClass, customSlug } from '@/lib/missions.js';
import { tasksForClass } from '@/lib/tasks.js';
import AssignMissions from '@/components/AssignMissions.jsx';
import CustomMaterialForm from '@/components/CustomMaterialForm.jsx';
import TaskForm from '@/components/TaskForm.jsx';
import { DeleteButton } from '@/components/LibraryManager.jsx';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Kelas — Sintesa' };

export default async function KelasPage({ params }) {
  const { t, lang } = await getT();
  const MISSIONS = missionsFor(lang);
  const { id } = await params;
  const user = await requireUser(['GURU', 'ADMIN']);
  const cls = await getClassForTeacher(id, user.id);
  if (!cls) notFound();
  const [students, assigned, tasks, custom] = await Promise.all([classStudents(cls.id), assignedForClass(cls.id), tasksForClass(cls.id), customForClass(cls.id)]);
  const inClass = MISSIONS.filter((m) => assigned.includes(m.slug));

  return (
    <main className="wrap page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <Link href="/guru" className="back">{t('← Dashboard Guru')}</Link>
          <h1 style={{ fontSize: 40, letterSpacing: -1.2, marginTop: 10 }}>{cls.name}</h1>
          <p style={{ color: 'var(--muted)' }}>{cls.description || t('Belum ada deskripsi.')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div className="code-box"><small>{t('KODE KELAS')}</small><b>{cls.code}</b></div>
          <a href="#library-materi" className="btn btn-primary" style={{ borderRadius: 18 }}>{t('📚 Library Kelas')}</a>
        </div>
      </div>

      <div className="manage-grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <section className="card panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{t('🧊 Materi AR di Kelas')}</h3><span className="chip">{inClass.length + custom.length}{' '}{t('materi')}</span></div>
          <p className="sub">{t('Materi yang tampil sebagai misi untuk siswa.')}</p>
          {inClass.length + custom.length === 0 ? <div className="empty">{t('Belum ada materi. Pilih dari Library Materi AR di bawah.')}</div> : (
            <div className="mat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {inClass.map((m) => (
                <div key={m.slug} className="card mat-card"><div className="mat-top" style={{ height: 90 }}>🧊</div>
                  <div className="mat-body"><span className="lab">{t('SMK ·')}{' '}{mapelLabel(m.category, lang)}</span><b>{m.title}</b><span style={{ color: '#0c7a4c', fontWeight: 800, fontSize: 12 }}>{t('+100 XP per penyelesaian')}</span></div></div>
              ))}
              {custom.map((m) => (
                <div key={m.id} className="card mat-card"><div className="mat-top" style={{ height: 90 }}>🧊</div>
                  <div className="mat-body"><span className="lab">{m.subject ? mapelLabel(m.subject, lang) : t('Materi guru')}</span><b>{m.title}</b>
                    <div className="mat-foot"><span style={{ color: '#0c7a4c', fontWeight: 800, fontSize: 12 }}>{t('+100 XP per penyelesaian')}</span>
                      <span style={{ display: 'flex', gap: 6 }}><Link className="btn btn-soft btn-sm" href={`/ar/materi/${m.id}`}>{t('Lihat')}</Link><DeleteButton url={`/api/materi/${m.id}`} confirm={t('Hapus materi "{name}"?', { name: m.title })} /></span></div></div></div>
              ))}
            </div>
          )}
        </section>
        <section className="card panel">
          <h3>{t('Siswa Bergabung')}</h3>
          <p className="sub">{t('Bagikan kode di atas agar siswa bisa masuk kelas.')}</p>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#1f4fbf' }}>{students.length}</div>
          <p className="sub">{t('siswa terdaftar')}</p>
          <div style={{ maxHeight: 340, overflow: 'auto' }}>
            {students.length === 0 ? <div className="empty">{t('Belum ada siswa yang bergabung.')}</div> : students.map((s) => (
              <div className="student-row" key={s.id}>
                <span className="avatar avatar-grad">{initial(s.name)}</span>
                <div className="who"><b>{s.name}</b><span>{s.email}</span></div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#2a3fa8' }}>{t('Lv.')}{getLevel(s.xp).level} · {s.xp}{' '}{t('XP')}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="manage-grid" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}>
        <section className="card panel"><h3>{t('🎯 Buat Tugas Kelas')}</h3><p className="sub">{t('Hasilnya dikumpulkan siswa di halaman Tugas.')}</p><TaskForm classes={[{ id: cls.id, name: `${cls.name} · ${cls.code}` }]} /></section>
        <section className="card panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>{t('📌 Tugas di Kelas (')}{tasks.length})</h3><Link href="/tugas" className="btn btn-soft btn-sm">{t('Buka Tugas →')}</Link></div>
          <p className="sub">{t('Nilai file yang masuk di halaman Tugas.')}</p>
          {tasks.length === 0 ? <div className="empty">{t('Belum ada tugas untuk kelas ini.')}</div> : (
            <div className="mat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {tasks.map((tk) => (
                <Link key={tk.id} href={`/tugas/${tk.id}`} className="card t-card" style={{ padding: 14 }}>
                  <div className="t-top"><b>{tk.title}</b><span className="xp-badge">+{tk.points}{' '}{t('XP')}</span></div>
                  <span className="muted">{tk.submitted}{' '}{t('file masuk')}</span><span className="lnk" style={{ fontSize: 13 }}>{t('Nilai submission →')}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section id="library-materi" className="card panel">
        <h3>{t('📚 Library Materi AR')}</h3><p className="sub">{t('Pilih materi yang ingin dibagikan ke kelas sebagai misi.')}</p>
        <AssignMissions classId={cls.id} assigned={assigned} missions={MISSIONS.map(({ slug, title, category, text }) => ({ slug, title, category: mapelLabel(category, lang), text }))} />
        <h3 style={{ marginTop: 30 }}>{t('➕ Tambah Materi AR Sendiri')}</h3>
        <p className="sub">{t('Unggah model 3D (.glb) buatanmu. Siswa bisa memutar, mengetuk bagiannya (penjelasan AI), dan menandai selesai (+100 XP).')}</p>
        <div style={{ maxWidth: 560 }}><CustomMaterialForm classId={cls.id} /></div>
      </section>
    </main>
  );
}
