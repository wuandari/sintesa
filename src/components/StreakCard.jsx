import Flame from './Flame.jsx';
import { streakTier, TIERS } from '@/lib/streakRules.js';
import { getT } from '@/i18n/server.js';

const NAME = { abu: 'Api Kecil', oranye: 'Api Oranye', ungu: 'Api Ungu', biru: 'Api Biru' };
const COLOR_NAME = { oranye: 'oranye', ungu: 'ungu', biru: 'biru' };
const STEPS = [...TIERS].reverse(); // 10, 30, 50

export default async function StreakCard({ count, best }) {
  const { t } = await getT();
  const tier = streakTier(count);
  const record = best > tier.count ? ` · ${t('rekor terbaik {n} hari', { n: best })}` : tier.count > 0 ? ` · ${t('rekor terbaikmu!')}` : '';
  return (
    <div className="card streak-card" style={{ '--sc': tier.color, '--sc-soft': tier.soft }}>
      <div className="streak-main">
        <span className="streak-flame"><Flame count={count} size={56} /></span>
        <div>
          <div className="streak-num">{tier.count} <small>{t('hari berturut-turut')}</small></div>
          <div className="streak-name">{t(NAME[tier.id])}{record}</div>
          <p className="streak-hint">
            {tier.next
              ? t('{n} hari lagi menuju {warna}. Buka Sintesa tiap hari supaya apimu tidak padam.', { n: tier.remaining, warna: t(`api ${COLOR_NAME[tier.next.id]}`) })
              : t('Api biru — tingkat tertinggi! Pertahankan terus. 💙')}
          </p>
        </div>
      </div>
      <div className="streak-steps" aria-hidden="true">
        {STEPS.map((s) => (
          <span key={s.id} className={tier.count >= s.min ? 'on' : ''} style={{ '--c': s.color }}>
            <Flame count={s.min} size={16} /> {s.min} {t('hari')}
          </span>
        ))}
      </div>
    </div>
  );
}
