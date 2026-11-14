import { requireUser } from '@/lib/auth.js';
import AvatarUpload from '@/components/AvatarUpload.jsx';
import ProfileForm from '@/components/ProfileForm.jsx';
import Flame from '@/components/Flame.jsx';
import { initial, getLevel, computeBadges } from '@/lib/gamification.js';
import { profileData, studentStats } from '@/lib/users.js';
import { visitStreak } from '@/lib/streak.js';
import { getT } from '@/i18n/server.js';

export const metadata = { title: 'Profil — Sintesa' };

const dateOf = (d, locale) => new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

export default async function ProfilPage() {
  const { t, locale } = await getT();
  const user = await requireUser();
  const isStudent = user.role === 'MURID';
  const p = await profileData(user.id);
  const streak = isStudent ? await visitStreak(user.id) : null;
  const stats = isStudent ? await studentStats(user.id) : null;
  const lv = stats ? getLevel(stats.xp) : null;
  const badges = stats ? computeBadges({ xp: stats.xp, missions: stats.missions, tasks: stats.tasks }) : [];
  const earned = badges.filter((b) => b.earned);

  return (
    <main className="wrap page">
      <div className="profile-grid">
        <section className="card panel">
          <div className="profile-head">
            {p.avatar_url
              ? <img src={p.avatar_url} alt={t('Foto profil')} className="avatar avatar-lg avatar-img" />
              : <span className="avatar avatar-lg">{initial(p.name)}</span>}
            <div>
              <div className="nm">{p.name}</div>
              <div className="muted">{p.email}</div>
              <div className="pill-row">
                <span className="pill">{isStudent ? 'Murid' : 'Guru'}</span>
                {isStudent && <span className="pill green">{t('Kelas 10 · SMK RPL')}</span>}
              </div>
            </div>
          </div>
          {p.bio && <p style={{ margin: '0 0 14px', lineHeight: 1.6 }}>“{p.bio}”</p>}
          <ul className="info-list">
            <li><span>{t('Nama')}</span><b>{p.name}</b></li>
            <li><span>{t('Email')}</span><b>{p.email}</b></li>
            {isStudent && <li><span>{t('NIS')}</span><b>{p.nis || '—'}</b></li>}
            <li><span>{t('Peran')}</span><b>{isStudent ? 'Murid' : 'Guru'}</b></li>
            {isStudent && <li><span>{t('Jurusan')}</span><b>{t('Rekayasa Perangkat Lunak (RPL)')}</b></li>}
            <li><span>{t('Bergabung sejak')}</span><b>{dateOf(p.created_at, locale)}</b></li>
          </ul>
        </section>

        <section className="card panel">
          <h3>{t('✏️ Ubah Profil')}</h3>
          <div style={{ margin: '12px 0 18px' }}><ProfileForm name={p.name} nis={p.nis} bio={p.bio} isStudent={isStudent} /></div>
          <h3 style={{ fontSize: 16 }}>{t('📷 Foto Profil')}</h3>
          <div style={{ marginTop: 10 }}><AvatarUpload /></div>
        </section>
      </div>

      {isStudent && (
        <div className="profile-grid" style={{ marginTop: 18 }}>
          <section className="card panel">
            <h3>{t('📈 Progres Belajar')}</h3>
            <div className="mini-stats" style={{ marginTop: 14 }}>
              <div><b>{lv.icon} {lv.level}</b><span>{t(lv.name)}</span></div>
              <div><b>{stats.xp.toLocaleString(locale)}</b><span>{t('Total XP')}</span></div>
              <div><b style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame count={streak.count} size={18} /> {streak.count}</b><span>{t('Streak (rekor')}{' '}{streak.best})</span></div>
            </div>
            <ul className="info-list">
              <li><span>{t('Materi AR selesai')}</span><b>{stats.missions}</b></li>
              <li><span>{t('Tugas dikumpulkan')}</span><b>{p.work.submitted}</b></li>
              <li><span>{t('Tugas sudah dinilai')}</span><b>{p.work.graded}</b></li>
              <li><span>{t('Rata-rata nilai tugas')}</span><b>{p.work.avg_score ?? '—'}</b></li>
              <li><span>{t('File di Library')}</span><b>{p.libraryCount}</b></li>
              <li><span>{t('Badge diraih')}</span><b>{earned.length}/{badges.length}</b></li>
            </ul>
            {earned.length > 0 && (
              <div className="badges" style={{ marginTop: 14 }}>
                {earned.map((b) => <span key={b.id} className="badge earned" title={t(b.hint)}>{b.icon} {t(b.name)}</span>)}
              </div>
            )}
          </section>

          <section className="card panel">
            <h3>{t('🏫 Kelasku')}</h3>
            {p.classes.length === 0 ? (
              <p className="muted" style={{ marginTop: 12 }}>{t('Kamu belum bergabung ke kelas. Masukkan kode kelas dari gurumu lewat menu Kelas di header atau halaman Misi AR.')}</p>
            ) : (
              <div className="class-chips" style={{ marginTop: 14 }}>
                {p.classes.map((c) => (
                  <div key={c.id}><span><b>{c.name}</b><br /><span className="muted">{t('Guru:')}{' '}{c.teacher_name}</span></span><span className="muted">{c.code}</span></div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
