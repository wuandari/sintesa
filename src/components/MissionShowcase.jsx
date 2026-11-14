'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { missionsFor, mapelLabel } from '@/data/missions.js';
import { useT } from '@/i18n/client.jsx';

export default function MissionShowcase({ loggedIn }) {
  const { t, lang } = useT();
  const MISSIONS = missionsFor(lang);
  const [i, setI] = useState(0);
  const m = MISSIONS[i];
  const [ok, setOk] = useState(true);
  useEffect(() => { import('@google/model-viewer').catch(() => setOk(false)); }, []);
  const grad = (g) => `linear-gradient(135deg, ${g[0]}, ${g[1]})`;

  return (
    <div className="showcase">
      <div className="mission-list">
        {MISSIONS.map((x, k) => (
          <button key={x.slug} className={`mission-item ${k === i ? 'on' : ''}`} onClick={() => setI(k)}>
            <span className="m-ico" style={{ background: grad(x.gradient) }}>{x.icon}</span>
            <div><b>{x.title}</b><span>{t('Kelas 10 RPL ·')}{' '}{mapelLabel(x.category, lang)} · +{x.xp}{' '}{t('XP')}</span></div>
            <span className="go">→</span>
          </button>
        ))}
      </div>

      <div className="card detail">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
          <span className="m-ico" style={{ background: grad(m.gradient) }}>{m.icon}</span>
          <div><div className="kicker">{t('Kelas 10 RPL ·')}{' '}{mapelLabel(m.category, lang)} · +{m.xp}{' '}{t('XP')}</div><h3 style={{ margin: 0 }}>{m.title}</h3></div>
        </div>
        <div className="stage" style={{ position: 'relative' }}>
          {ok ? (
            <model-viewer key={m.slug} src={`/models/${m.slug}.glb`} alt={`Model 3D ${m.title}`} camera-controls auto-rotate camera-orbit="28deg 64deg auto" field-of-view="32deg" environment-image="neutral" exposure="1.1" shadow-intensity="1" interaction-prompt="none"
              style={{ width: '100%', height: '100%', background: 'transparent' }} onError={() => setOk(false)} />
          ) : <span className="big" aria-hidden="true">{m.icon}</span>}
          <div className="stage-chip"><i />{' '}{t('Mode 3D aktif — putar & zoom untuk eksplorasi')}</div>
        </div>
        <div className="mission-box">
          <b>{t('🎯 Misi:')}{' '}{m.objective}</b>
          <p>{m.text}</p>
          <div className="tags">{m.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="box-foot">
            <Link href={loggedIn ? `/ar?m=${m.slug}#misi` : '/register'} className="btn btn-primary">{t('Buka Misi Lengkap (Materi + Soal) →')}</Link>
            <small>{t('Perangkat HP + Chrome/Safari untuk AR penuh')}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
