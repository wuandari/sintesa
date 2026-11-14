import { getLevel, initial } from '@/lib/gamification.js';
import { getT } from '@/i18n/server.js';

const MEDAL = ['🥇', '🥈', '🥉'];

// Daftar peringkat murid. rows: [{ id, name, xp }]
export default async function Leaderboard({ rows, meId, emptyText = 'Belum ada murid terdaftar.' }) {
  const { t, locale } = await getT();
  if (!rows.length) return <div className="empty">{t(emptyText)}</div>;
  return (
    <div>
      {rows.map((r, i) => {
        const lv = getLevel(r.xp);
        return (
          <div key={r.id} className={`lb-row ${r.id === meId ? 'me' : ''}`}>
            <span className="rank">{i < 3 ? MEDAL[i] : `#${i + 1}`}</span>
            <span className="avatar avatar-grad">{initial(r.name)}</span>
            <div className="who"><b>{r.name}{r.id === meId ? ` (${t('kamu')})` : ''}</b><span>{t('Lv.')}{lv.level} · {t(lv.name)}</span></div>
            <span className="xp">{r.xp.toLocaleString(locale)}{' '}{t('XP')}</span>
          </div>
        );
      })}
    </div>
  );
}
