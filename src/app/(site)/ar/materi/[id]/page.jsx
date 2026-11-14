import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth.js';
import MissionPlayer from '@/components/MissionPlayer.jsx';
import { customSlug, doneSlugs, getCustomFor, openMission } from '@/lib/missions.js';
import { getT } from '@/i18n/server.js';
import { mapelLabel } from '@/data/missions.js';

export const metadata = { title: 'Materi AR — Sintesa' };

export default async function MateriGuru({ params }) {
  const { t, lang } = await getT();
  const { id } = await params;
  const user = await requireUser();
  const m = await getCustomFor(user, id);
  if (!m) notFound();
  const slug = customSlug(m.id);
  const isStudent = user.role === 'MURID';
  let done = false;
  if (isStudent) { done = (await doneSlugs(user.id)).has(slug); if (!done) await openMission(user.id, slug).catch(() => {}); }
  return (
    <main className="wrap page">
      <Link href="/ar" className="back">{t('← Misi AR')}</Link>
      <MissionPlayer
        mission={{ slug, title: m.title, icon: '🧊', gradient: ['#1f78d9', '#8a5cf6'], objective: t('Pelajari model 3D {name}', { name: m.title }), text: m.description || t('Putar dan zoom model 3D, ketuk bagiannya untuk penjelasan.'), tags: [m.subject && mapelLabel(m.subject, lang)].filter(Boolean), kicker: `${m.subject ? mapelLabel(m.subject, lang) : t('Materi guru')} · +100 XP` }}
        content={null}
        modelUrl={m.model_url}
        isCustom
        canQuiz={isStudent}
        assigned={isStudent}
        done={done}
        passed
        bestScore={null}
      />
    </main>
  );
}
