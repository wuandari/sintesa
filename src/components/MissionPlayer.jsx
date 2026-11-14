'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/client.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const PAIR_COLORS = ['#2f7be8', '#f97316', '#16a34a', '#8b5cf6', '#e11d48', '#0891b2', '#ca8a04'];
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const partOf = (materialName) => String(materialName || '').split('__')[0];

export default function MissionPlayer({ mission, content, modelUrl, isCustom, canQuiz, assigned, done: doneInit, passed: passedInit, bestScore }) {
  const { t } = useT();
  const router = useRouter();
  const viewerRef = useRef(null);
  const down = useRef(null);
  const origEmissive = useRef(new Map());
  const [modelError, setModelError] = useState(false);
  const [tab, setTab] = useState('misi');
  const [pop, setPop] = useState(null);
  const [picks, setPicks] = useState({});
  const [final, setFinal] = useState(null);
  const [passed, setPassed] = useState(passedInit);
  const [done, setDone] = useState(doneInit);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  // permainan hubungkan komponen
  const [sel, setSel] = useState(null);          // id komponen yang sedang dipilih
  const [links, setLinks] = useState({});        // { idKomponen: kunciPilihan }
  const [check, setCheck] = useState(null);      // hasil pemeriksaan dari server
  const n = content?.soal.length ?? 0;
  const parts = content?.parts ?? [];
  const partIds = parts.map((p) => p.id);
  const game = content?.pairs;
  const nameOf = (id) => parts.find((p) => p.id === id)?.name || id;

  useEffect(() => { import('@google/model-viewer').catch(() => setModelError(true)); }, []);

  // Sorot komponen pada model 3D (ubah emissive material yang namanya diawali id komponen).
  function highlight(id) {
    const mats = viewerRef.current?.model?.materials;
    if (!mats) return;
    for (const m of mats) {
      try {
        if (!origEmissive.current.has(m.name)) origEmissive.current.set(m.name, [...(m.emissiveFactor || [0, 0, 0])]);
        const on = id && partOf(m.name) === id;
        m.setEmissiveFactor(on ? [0.2, 0.38, 0.95] : origEmissive.current.get(m.name));
      } catch { /* versi model-viewer tanpa API ini */ }
    }
  }
  useEffect(() => { highlight(sel || pop?.part || null); }, [sel, pop?.part]);

  async function showPart(name) {
    if (!isCustom && !partIds.includes(name)) return;
    setPop({ part: name, loading: true });
    try {
      const res = await post('/api/ar/komponen-info', { mission: mission.slug, part: name });
      const data = await res.json().catch(() => ({}));
      setPop(res.ok ? { part: name, info: data.info, source: data.source } : { part: name, error: t(data.message || 'Gagal memuat info.') });
    } catch { setPop({ part: name, error: t('Tidak bisa terhubung ke server.') }); }
  }
  function onPointerDown(e) { down.current = { x: e.clientX, y: e.clientY }; }
  function onPointerUp(e) {
    const d = down.current; down.current = null; const el = viewerRef.current;
    if (!d || !el || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
    try {
      const r = el.getBoundingClientRect();
      const mat = el.materialFromPoint?.(e.clientX - r.left, e.clientY - r.top);
      const id = isCustom ? mat?.name : partOf(mat?.name);
      if (id && (isCustom || partIds.includes(id))) {
        if (tab === 'misi' && game) { setSel(id); setCheck(null); }
        showPart(id);
      }
    } catch { /* model belum siap */ }
  }

  async function pick(i, a) {
    if (picks[i]) return;
    try {
      const res = await post(`/api/missions/${mission.slug}/check`, { q: i, a });
      const data = await res.json();
      if (!res.ok) return;
      const next = { ...picks, [i]: { a, ...data } };
      setPicks(next);
      if (Object.keys(next).length === n) {
        const answers = Array.from({ length: n }, (_, k) => next[k].a);
        const right = answers.filter((_, k) => next[k].correct).length;
        setFinal({ right, score: Math.round((right / n) * 100) });
        if (canQuiz) {
          const r = await post(`/api/missions/${mission.slug}/quiz`, { answers });
          const d = await r.json().catch(() => ({}));
          if (r.ok && d.passed) setPassed(true);
          router.refresh();
        }
      }
    } catch { /* abaikan */ }
  }

  async function complete() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/missions/${mission.slug}/complete`, { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: t(d.message || 'Gagal.') });
      if (res.ok) { setDone(true); router.refresh(); }
    } catch { setMsg({ ok: false, text: t('Tidak bisa terhubung ke server.') }); }
    setBusy(false);
  }

  // ----- game hubungkan komponen -----
  const colorOf = (id) => PAIR_COLORS[Math.max(0, partIds.indexOf(id)) % PAIR_COLORS.length];
  const numOf = (id) => partIds.indexOf(id) + 1;
  const linkedPartFor = (key) => Object.keys(links).find((id) => links[id] === key);
  function clickPart(id) { setCheck(null); setSel((cur) => (cur === id ? null : id)); }
  function clickOption(key) {
    setCheck(null);
    const owner = linkedPartFor(key);
    if (!sel) { if (owner) setLinks(({ [owner]: _, ...rest }) => rest); return; }
    setLinks((cur) => {
      const next = { ...cur };
      if (owner) delete next[owner];
      next[sel] = key;
      return next;
    });
    setSel(null);
  }
  async function checkLinks() {
    setBusy(true);
    try {
      const res = await post(`/api/missions/${mission.slug}/pairs`, { links });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setCheck(d);
    } catch { /* abaikan */ }
    setBusy(false);
  }
  const resetGame = () => { setLinks({}); setCheck(null); setSel(null); };
  const allLinked = game && Object.keys(links).length === game.parts.length;

  const praise = final ? (final.right === n ? t('Sempurna! 🎉') : final.score >= 60 ? t('Bagus!') : t('Terus berlatih 💪')) : '';

  return (
    <div className="card detail2">
      <div className="d2-head">
        <span className="m-ico" style={{ background: `linear-gradient(135deg, ${mission.gradient[0]}, ${mission.gradient[1]})` }}>{mission.icon}</span>
        <div><div className="kicker">{mission.kicker}</div><h3>{mission.title}</h3></div>
        {done && <span className="chip-done" style={{ marginLeft: 'auto', background: '#e7f9f0' }}>✅ {t('Selesai')}</span>}
      </div>

      <div className="viewer-wrap" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {modelError ? (
          <div className="viewer-fallback">{t('Model 3D tidak bisa dimuat di perangkat ini.')}{partIds.length ? ` ${t('Pilih komponen di bawah untuk belajar.')}` : ''}</div>
        ) : (
          <model-viewer ref={viewerRef} src={modelUrl} alt={`${t('Model 3D')} ${mission.title}`} ar ar-modes="webxr scene-viewer quick-look"
            camera-controls auto-rotate auto-rotate-delay="3000" rotation-per-second="14deg" camera-orbit="28deg 64deg auto" field-of-view="32deg"
            environment-image="neutral" exposure="1.1" shadow-intensity="1" shadow-softness="0.8" interaction-prompt="none"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onError={() => setModelError(true)}>
            <button slot="ar-button" type="button" className="ar-btn">📱 {t('Lihat di AR')}</button>
          </model-viewer>
        )}
        <div className="mode-chip"><i /> {t('Mode 3D aktif — putar & zoom untuk eksplorasi · ketuk bagian model untuk info')}</div>
        {pop && (
          <div className="part-pop" role="dialog" aria-live="polite">
            <button type="button" className="pop-x" aria-label={t('Tutup')} onClick={() => setPop(null)}>✕</button>
            <b>🔎 {nameOf(pop.part)}</b>
            {pop.loading && <p className="muted">{t('Memuat penjelasan…')}</p>}
            {pop.error && <p className="err">{pop.error}</p>}
            {pop.info && <p>{pop.info}</p>}
            {pop.source && <small>{pop.source === 'AI' ? `✨ ${t('Dijelaskan oleh AI')}` : t('Info bawaan')}</small>}
          </div>
        )}
      </div>
      {parts.length > 0 && (
        <div className="part-chips">
          {parts.map((p) => (
            <button key={p.id} type="button" className={`part-chip ${pop?.part === p.id ? 'on' : ''}`} onClick={() => showPart(p.id)}><i style={{ background: p.color }} />{p.name}</button>
          ))}
        </div>
      )}

      <div className="tabs2">
        <button type="button" className={tab === 'misi' ? 'on' : ''} onClick={() => setTab('misi')}>🎯 {t('Misi')}</button>
        {content && <button type="button" className={tab === 'materi' ? 'on' : ''} onClick={() => setTab('materi')}>📖 {t('Materi')} ({content.materi.length})</button>}
        {content && <button type="button" className={tab === 'soal' ? 'on' : ''} onClick={() => setTab('soal')}>📝 {t('Soal')} ({n})</button>}
      </div>

      {tab === 'misi' && (
        <div className="misi-box">
          <b>🎯 {t('Misi')}: {mission.objective}</b>
          <p>{mission.text}</p>
          {mission.tags?.length > 0 && <div className="tags">{mission.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}

          {game && (
            <div className="pair-game">
              <div className="pg-head">
                <b>🔗 {t('Hubungkan Komponen')}</b>
                <span className="muted">{t('Pilih komponen (di sini atau ketuk di model 3D), lalu pilih fungsinya.')}</span>
              </div>
              <div className="pg-cols">
                <div className="pg-col">
                  {game.parts.map((p) => {
                    const key = links[p.id];
                    const res = check?.results?.[p.id];
                    return (
                      <button key={p.id} type="button" onClick={() => clickPart(p.id)}
                        className={`pg-item pg-part ${sel === p.id ? 'sel' : ''} ${key !== undefined ? 'linked' : ''} ${res === true ? 'ok' : res === false ? 'bad' : ''}`}
                        style={{ '--pc': colorOf(p.id) }}>
                        <span className="pg-num">{numOf(p.id)}</span><span className="pg-txt">{p.name}</span>
                        {res === true && <span className="pg-mark">✔</span>}{res === false && <span className="pg-mark">✖</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="pg-col">
                  {game.options.map((o) => {
                    const owner = linkedPartFor(o.key);
                    return (
                      <button key={o.key} type="button" onClick={() => clickOption(o.key)}
                        className={`pg-item pg-opt ${owner ? 'linked' : ''} ${sel && !owner ? 'ready' : ''}`} style={owner ? { '--pc': colorOf(owner) } : undefined}>
                        {owner ? <span className="pg-num">{numOf(owner)}</span> : <span className="pg-num empty">·</span>}
                        <span className="pg-txt">{o.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pg-actions">
                <button type="button" className="btn btn-primary btn-sm" disabled={busy || Object.keys(links).length === 0} onClick={checkLinks}>✅ {t('Periksa')}</button>
                <button type="button" className="btn btn-soft btn-sm" onClick={resetGame}>🔁 {t('Ulangi')}</button>
                {!allLinked && Object.keys(links).length > 0 && !check && <small className="muted">{t('{n} dari {total} sudah dihubungkan.', { n: Object.keys(links).length, total: game.parts.length })}</small>}
              </div>
              {check && (
                <div className={`alert ${check.right === check.total ? 'alert-ok' : 'alert-error'}`} style={{ margin: 0 }}>
                  {check.right === check.total
                    ? `🎉 ${t('Semua benar!')} ${t('{right} dari {total} pasangan tepat.', { right: check.right, total: check.total })}`
                    : t('{right} dari {total} pasangan tepat. Perbaiki yang bertanda ✖ lalu periksa lagi.', { right: check.right, total: check.total })}
                </div>
              )}
              <small className="muted">{t('Permainan ini hanya latihan (tanpa XP).')}</small>
            </div>
          )}

          {canQuiz && (
            <div className="complete-row">
              {assigned ? (
                done ? <div className="alert alert-ok" style={{ margin: 0 }}>✅ {t('Misi ini sudah selesai (+100 XP diterima).')}</div> : (
                  <>
                    <button type="button" className="btn btn-primary" disabled={busy || (!isCustom && !passed)} onClick={complete}>{busy ? '…' : `✅ ${t('Tandai Selesai (+100 XP)')}`}</button>
                    {!isCustom && !passed && <small className="muted">{t('Lulus soal latihan (nilai ≥ 60) dulu agar bisa menandai selesai.')}</small>}
                  </>
                )
              ) : (
                <div className="alert alert-ok" style={{ margin: 0 }}>{t('Ini misi latihan. XP +100 didapat dari materi yang dibagikan gurumu di kelas.')}</div>
              )}
              {msg && <div className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} style={{ margin: 0 }}>{msg.text}</div>}
            </div>
          )}
        </div>
      )}

      {tab === 'materi' && content && (
        <div className="materi2">
          {content.materi.map((m, i) => (
            <div key={m.judul} className="m-card"><span className="num">{i + 1}</span><div><b>{m.judul}</b><p>{m.isi}</p></div></div>
          ))}
        </div>
      )}

      {tab === 'soal' && content && (
        <div className="soal2">
          {bestScore != null && bestScore > 0 && <p className="muted">{t('Nilai terbaikmu:')} <b>{bestScore}</b></p>}
          {content.soal.map((s, i) => {
            const pk = picks[i];
            return (
              <div key={i} className="q2">
                <b>{i + 1}. {s.q}</b>
                {s.o.map((opt, k) => {
                  const cls = pk ? (k === pk.answer ? 'right' : k === pk.a ? 'wrong' : '') : '';
                  return (
                    <button key={k} type="button" disabled={!!pk} className={`opt2 ${cls}`} onClick={() => pick(i, k)}>
                      <span className="letter">{LETTERS[k]}</span>{opt}
                    </button>
                  );
                })}
                {pk && <div className={`fb ${pk.correct ? 'ok' : 'no'}`}>{pk.correct ? `✅ ${t('Benar!')}` : `❌ ${t('Kurang tepat.')}`} {pk.explanation}</div>}
              </div>
            );
          })}
          {final && (
            <div className="score-row">
              <span className="score-pill">🎯 {t('Skor')}: {final.right}/{n} · {praise}</span>
              <button type="button" className="btn btn-soft btn-sm" onClick={() => { setPicks({}); setFinal(null); }}>🔁 {t('Ulangi Kuis')}</button>
            </div>
          )}
          <p className="muted">{t('Kuis ini latihan pemahaman (tidak menambah XP). XP +100 didapat dari misi materi di kelas & tugas guru.')}</p>
        </div>
      )}
    </div>
  );
}
