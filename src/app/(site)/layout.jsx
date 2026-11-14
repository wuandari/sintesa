import Header from '@/components/Header.jsx';
import { getCurrentUser } from '@/lib/auth.js';
import { classesForStudent, classesForTeacher } from '@/lib/classes.js';
import { activeTaskCount } from '@/lib/tasks.js';
import { visitStreak } from '@/lib/streak.js';
import { getT } from '@/i18n/server.js';

// Semua halaman di grup ini bergantung pada sesi login, jadi selalu dirender per permintaan.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const { t } = await getT();
  let user = null;
  let classes = [];
  let taskCount = 0;
  let streak = null;
  try {
    user = await getCurrentUser();
    if (user) {
      classes = user.role === 'MURID' ? await classesForStudent(user.id) : await classesForTeacher(user.id);
      if (user.role === 'MURID') {
        taskCount = await activeTaskCount(user.id);
        streak = (await visitStreak(user.id)).count;
      }
    }
  } catch (err) {
    console.error('layout error:', err.message);
  }

  return (
    <>
      <Header
        user={user ? { name: user.name, role: user.role, avatarUrl: user.avatar_url } : null}
        classes={classes.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
        taskCount={taskCount}
        streak={streak}
      />
      {children}
      <footer className="site-footer">
        <div className="wrap">© {new Date().getFullYear()}{' '}{t('Sintesa · Belajar · Bermain · Berkreasi')}</div>
      </footer>
    </>
  );
}
