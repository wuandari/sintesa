// Benda-benda hardware prosedural. Titik asal tiap benda = tengah dasarnya (y = 0 menempel di meja), depan = +z.
import { boxGeo, rboxGeo } from './lib.mjs';

const range = (n) => Array.from({ length: n }, (_, k) => k);

export function monitor(s, id, o = {}) {
  const w = o.w ?? 1.2, h = o.h ?? 0.7, editor = o.variant === 'editor';
  s.mat(`${id}__bodi`, '#12151b', { metal: 0.45, rough: 0.35 });
  s.mat(`${id}__kaki`, '#8b93a3', { metal: 0.85, rough: 0.28 });
  s.mat(`${id}__layar`, editor ? '#1a2033' : '#1b56d6', { emissive: editor ? '#222c46' : '#2160e8', rough: 0.15 });
  s.mat(`${id}__jendela`, '#f4f7fd', { emissive: '#d4dcee', rough: 0.2 });
  s.mat(`${id}__bar`, '#3f93f0', { emissive: '#3a8de8', rough: 0.2 });
  s.mat(`${id}__gelap`, '#0f1422', { emissive: '#151b2e', rough: 0.2 });
  s.mat(`${id}__hijau`, '#6fdc9c', { emissive: '#4cc986', rough: 0.2 });
  s.mat(`${id}__oranye`, '#ffb566', { emissive: '#f59a3c', rough: 0.2 });
  s.mat(`${id}__ungu`, '#b48cff', { emissive: '#9a6cf0', rough: 0.2 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__kaki`, [0.5, 0.025, 0.3], 0.01, { pos: [0, 0.0125, 0] });
    s.rbox(`${id}__kaki`, [0.1, 0.34, 0.045], 0.012, { pos: [0, 0.19, -0.04] });
    const y = 0.03 + 0.31 + h / 2;
    s.rbox(`${id}__bodi`, [w, h, 0.055], 0.022, { pos: [0, y, 0], rot: [-4, 0, 0] });
    s.group({ pos: [0, y, 0], rot: [-4, 0, 0] }, () => {
      const z = 0.0285, sw = w - 0.07, sh = h - 0.07;
      s.box(`${id}__layar`, [sw, sh, 0.004], { pos: [0, 0, z] });
      if (!editor) {
        s.box(`${id}__jendela`, [sw * 0.55, sh * 0.62, 0.003], { pos: [-sw * 0.08, sh * 0.06, z + 0.0035] });
        s.box(`${id}__bar`, [sw * 0.55, sh * 0.08, 0.003], { pos: [-sw * 0.08, sh * 0.06 + sh * 0.27, z + 0.007] });
        range(4).forEach((k) => s.box(`${id}__gelap`, [sw * (0.38 - k * 0.04), 0.012, 0.003], { pos: [-sw * 0.16 - (0.0 + k * 0.0), sh * 0.06 + sh * 0.12 - k * sh * 0.1, z + 0.007] }));
        s.box(`${id}__bar`, [sw, sh * 0.07, 0.003], { pos: [0, -sh / 2 + sh * 0.035, z + 0.0035] });
        range(4).forEach((k) => s.box(`${id}__jendela`, [0.04, sh * 0.045, 0.003], { pos: [-sw * 0.46 + k * 0.06, -sh / 2 + sh * 0.035, z + 0.007] }));
      } else {
        s.box(`${id}__gelap`, [sw * 0.18, sh, 0.003], { pos: [-sw * 0.41, 0, z + 0.0035] });
        const cols = [`${id}__hijau`, `${id}__oranye`, `${id}__bar`, `${id}__ungu`, `${id}__jendela`];
        range(9).forEach((k) => {
          const len = sw * (0.18 + ((k * 37) % 7) * 0.05); const ind = (k % 3) * 0.06;
          s.box(cols[k % cols.length], [len, 0.014, 0.003], { pos: [-sw * 0.28 + ind + len / 2, sh * 0.36 - k * sh * 0.085, z + 0.0035] });
        });
        range(7).forEach((k) => s.box(`${id}__jendela`, [0.03, 0.01, 0.003], { pos: [-sw * 0.41, sh * 0.38 - k * 0.055, z + 0.007] }));
      }
    });
  });
}

export function keyboard(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#222733', { metal: 0.3, rough: 0.5 });
  s.mat(`${id}__tombol`, '#e3e8f1', { metal: 0.05, rough: 0.5 });
  s.mat(`${id}__aksen`, '#3f93f0', { metal: 0.05, rough: 0.45 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [1.0, 0.035, 0.34], 0.012, { pos: [0, 0.0175, 0], rot: [0, 0, 0] });
    const pitch = 0.067, kw = 0.056;
    range(4).forEach((r) => {
      const n = r === 0 ? 14 : r === 3 ? 12 : 13;
      range(n).forEach((c) => {
        const wide = r === 3 && c === 11 ? 1 : 0;
        const x = (c - (n - 1) / 2) * pitch;
        const accent = (r === 0 && c === 0) || (r === 2 && c === n - 1);
        s.rbox(accent ? `${id}__aksen` : `${id}__tombol`, [kw + wide * 0.03, 0.02, kw], 0.009, { pos: [x + wide * 0.015, 0.045, -0.115 + r * pitch] });
      });
    });
    s.rbox(`${id}__tombol`, [0.42, 0.02, kw], 0.009, { pos: [0, 0.045, -0.115 + 4 * pitch - 0.0] });
  });
}

export function mouse(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#2f6df0', { metal: 0.2, rough: 0.3 });
  s.mat(`${id}__tombol`, '#1f4fc0', { metal: 0.2, rough: 0.35 });
  s.mat(`${id}__roda`, '#10131a', { metal: 0.4, rough: 0.4 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.ell(`${id}__bodi`, [0.05, 0.026, 0.08], { pos: [0, 0.012, 0] });
    s.box(`${id}__roda`, [0.003, 0.004, 0.06], { pos: [0, 0.037, -0.03] });
    s.box(`${id}__roda`, [0.1, 0.002, 0.002], { pos: [0, 0.0372, -0.005], rot: [0, 0, 0] });
    s.cyl(`${id}__roda`, 0.009, 0.016, { pos: [0, 0.034, -0.045], rot: [0, 0, 90], seg: 16 });
  });
}

export function speaker(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#1d2129', { metal: 0.2, rough: 0.5 });
  s.mat(`${id}__cincin`, '#9aa3b4', { metal: 0.85, rough: 0.3 });
  s.mat(`${id}__kerucut`, '#0d0f14', { metal: 0.1, rough: 0.7 });
  s.mat(`${id}__led`, '#47ff9a', { emissive: '#32e384' });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.26, 0.5, 0.26], 0.035, { pos: [0, 0.25, 0] });
    s.cyl(`${id}__cincin`, 0.062, 0.012, { pos: [0, 0.38, 0.131], rot: [90, 0, 0] });
    s.cyl(`${id}__kerucut`, 0.052, 0.014, { pos: [0, 0.38, 0.134], rot: [90, 0, 0] });
    s.cyl(`${id}__cincin`, 0.105, 0.012, { pos: [0, 0.2, 0.131], rot: [90, 0, 0] });
    s.cyl(`${id}__kerucut`, 0.09, 0.016, { pos: [0, 0.2, 0.134], rot: [90, 0, 0] });
    s.ell(`${id}__cincin`, [0.03, 0.03, 0.014], { pos: [0, 0.2, 0.14] });
    s.cyl(`${id}__led`, 0.008, 0.006, { pos: [0.09, 0.07, 0.132], rot: [90, 0, 0], seg: 12 });
  });
}

export function cpuCase(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#2c323e', { metal: 0.6, rough: 0.4 });
  s.mat(`${id}__panel`, '#171a21', { metal: 0.3, rough: 0.5 });
  s.mat(`${id}__kisi`, '#3a4150', { metal: 0.5, rough: 0.5 });
  s.mat(`${id}__tombol`, '#52ffa0', { emissive: '#2fe688' });
  s.mat(`${id}__led`, '#4ab4ff', { emissive: '#2f9aff' });
  s.mat(`${id}__kaca`, '#0b1220', { metal: 0.9, rough: 0.08 });
  s.mat(`${id}__port`, '#b9c0cc', { metal: 0.8, rough: 0.3 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.36, 0.8, 0.72], 0.03, { pos: [0, 0.4, 0] });
    s.rbox(`${id}__panel`, [0.34, 0.78, 0.02], 0.015, { pos: [0, 0.4, 0.365] });
    range(8).forEach((k) => s.box(`${id}__kisi`, [0.26, 0.012, 0.012], { pos: [0, 0.12 + k * 0.032, 0.38] }));
    range(2).forEach((k) => s.rbox(`${id}__bodi`, [0.27, 0.045, 0.012], 0.008, { pos: [0, 0.66 - k * 0.07, 0.378] }));
    s.cyl(`${id}__tombol`, 0.026, 0.014, { pos: [0, 0.52, 0.38], rot: [90, 0, 0], seg: 20 });
    s.box(`${id}__led`, [0.14, 0.008, 0.008], { pos: [0, 0.46, 0.38] });
    range(2).forEach((k) => s.box(`${id}__port`, [0.036, 0.012, 0.01], { pos: [-0.06 + k * 0.12, 0.42, 0.38] }));
    s.rbox(`${id}__kaca`, [0.006, 0.6, 0.52], 0.002, { pos: [0.18, 0.4, 0.02] });
    s.cyl(`${id}__kisi`, 0.1, 0.01, { pos: [0.184, 0.46, 0.1], rot: [0, 0, 90], seg: 24 });
  });
}

export function router(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#f3f5f9', { metal: 0.1, rough: 0.35 });
  s.mat(`${id}__aksen`, '#2f7be8', { metal: 0.2, rough: 0.35 });
  s.mat(`${id}__antena`, '#14171d', { metal: 0.3, rough: 0.45 });
  s.mat(`${id}__led`, '#48f090', { emissive: '#2fd978' });
  s.mat(`${id}__port`, '#222833', { metal: 0.3, rough: 0.5 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.66, 0.07, 0.36], 0.024, { pos: [0, 0.035, 0] });
    s.box(`${id}__aksen`, [0.66, 0.006, 0.02], { pos: [0, 0.062, 0.176] });
    range(5).forEach((k) => s.cyl(`${id}__led`, 0.009, 0.004, { pos: [-0.2 + k * 0.1, 0.072, 0.09], seg: 12 }));
    range(4).forEach((k) => s.box(`${id}__port`, [0.05, 0.026, 0.01], { pos: [-0.15 + k * 0.1, 0.03, -0.18] }));
    [-0.26, 0, 0.26].forEach((x, k) => {
      s.ell(`${id}__antena`, [0.022, 0.022, 0.022], { pos: [x, 0.075, -0.13] });
      s.cyl(`${id}__antena`, 0.011, 0.4, { pos: [x + (k - 1) * 0.04, 0.27, -0.13], rot: [0, 0, -(k - 1) * 9], seg: 14 });
      s.ell(`${id}__antena`, [0.013, 0.013, 0.013], { pos: [x + (k - 1) * 0.078, 0.466, -0.13] });
    });
  });
}

export function switchDev(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#6d7686', { metal: 0.7, rough: 0.35 });
  s.mat(`${id}__panel`, '#1f242e', { metal: 0.4, rough: 0.45 });
  s.mat(`${id}__port`, '#0a0c10', { metal: 0.2, rough: 0.6 });
  s.mat(`${id}__emas`, '#e3b94d', { metal: 0.9, rough: 0.25 });
  s.mat(`${id}__led`, '#48f090', { emissive: '#2fd978' });
  s.mat(`${id}__ledo`, '#ffb347', { emissive: '#f59a2c' });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.92, 0.09, 0.34], 0.012, { pos: [0, 0.045, 0] });
    s.rbox(`${id}__panel`, [0.84, 0.07, 0.01], 0.006, { pos: [0, 0.045, 0.172] });
    range(8).forEach((k) => {
      const x = -0.32 + k * 0.09;
      s.box(`${id}__port`, [0.05, 0.034, 0.012], { pos: [x, 0.036, 0.176] });
      s.box(`${id}__emas`, [0.036, 0.004, 0.006], { pos: [x, 0.026, 0.182] });
      s.box(k % 3 === 0 ? `${id}__ledo` : `${id}__led`, [0.012, 0.007, 0.006], { pos: [x, 0.066, 0.178] });
    });
    [-0.5, 0.5].forEach((x) => s.box(`${id}__bodi`, [0.04, 0.09, 0.2], { pos: [x, 0.045, 0.06] }));
  });
}

export function server(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#262b34', { metal: 0.6, rough: 0.4 });
  s.mat(`${id}__panel`, '#1a1e26', { metal: 0.4, rough: 0.45 });
  s.mat(`${id}__slot`, '#3b4352', { metal: 0.5, rough: 0.45 });
  s.mat(`${id}__led`, '#48f090', { emissive: '#2fd978' });
  s.mat(`${id}__ledb`, '#4ab4ff', { emissive: '#2f9aff' });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.46, 1.05, 0.5], 0.02, { pos: [0, 0.525, 0] });
    range(5).forEach((u) => {
      const y = 0.14 + u * 0.19;
      s.rbox(`${id}__panel`, [0.4, 0.15, 0.02], 0.008, { pos: [0, y, 0.255] });
      range(4).forEach((k) => s.box(`${id}__slot`, [0.07, 0.1, 0.012], { pos: [-0.12 + k * 0.08, y, 0.266] }));
      s.cyl(u % 2 ? `${id}__ledb` : `${id}__led`, 0.007, 0.006, { pos: [0.17, y + 0.05, 0.27], rot: [90, 0, 0], seg: 10 });
    });
  });
}

export function laptop(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#b9c0cd', { metal: 0.85, rough: 0.28 });
  s.mat(`${id}__area`, '#262b35', { metal: 0.3, rough: 0.5 });
  s.mat(`${id}__tombol`, '#dfe4ee', { metal: 0.05, rough: 0.5 });
  s.mat(`${id}__layar`, '#1a2033', { emissive: '#222c46', rough: 0.15 });
  s.mat(`${id}__hijau`, '#6fdc9c', { emissive: '#4cc986' });
  s.mat(`${id}__oranye`, '#ffb566', { emissive: '#f59a3c' });
  s.mat(`${id}__bar`, '#3f93f0', { emissive: '#3a8de8' });
  s.mat(`${id}__ungu`, '#b48cff', { emissive: '#9a6cf0' });
  s.mat(`${id}__putih`, '#f4f7fd', { emissive: '#d4dcee' });
  const login = o.screen === 'login';
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.7, 0.024, 0.48], 0.01, { pos: [0, 0.012, 0.0] });
    s.box(`${id}__area`, [0.64, 0.003, 0.26], { pos: [0, 0.0245, -0.05] });
    range(4).forEach((r) => range(12).forEach((c) => s.rbox(`${id}__tombol`, [0.044, 0.008, 0.044], 0.005, { pos: [-0.296 + c * 0.0538, 0.0295, -0.155 + r * 0.056] })));
    s.rbox(`${id}__area`, [0.19, 0.004, 0.11], 0.004, { pos: [0, 0.0255, 0.175] });
    s.group({ pos: [0, 0.024, -0.235], rot: [-103, 0, 0] }, () => {
      s.rbox(`${id}__bodi`, [0.7, 0.014, 0.46], 0.01, { pos: [0, 0, 0.23] });
      s.box(`${id}__layar`, [0.64, 0.003, 0.4], { pos: [0, -0.0085, 0.235] });
      if (login) {
        s.box(`${id}__putih`, [0.24, 0.003, 0.2], { pos: [0, -0.0105, 0.24] });
        s.box(`${id}__bar`, [0.16, 0.003, 0.034], { pos: [0, -0.0125, 0.31] });
        range(5).forEach((k) => s.cyl(`${id}__layar`, 0.011, 0.003, { pos: [-0.06 + k * 0.03, -0.0125, 0.24], seg: 12 }));
        s.cyl(`${id}__hijau`, 0.03, 0.003, { pos: [0, -0.0125, 0.17], seg: 20 });
      } else {
        const cols = [`${id}__hijau`, `${id}__oranye`, `${id}__bar`, `${id}__ungu`, `${id}__putih`];
        range(8).forEach((k) => {
          const len = 0.1 + ((k * 37) % 7) * 0.05;
          s.box(cols[k % cols.length], [len, 0.003, 0.016], { pos: [-0.2 + (k % 3) * 0.05 + len / 2, -0.0105, 0.07 + k * 0.04] });
        });
      }
    });
  });
}

export function usb(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#e8452f', { metal: 0.1, rough: 0.35 });
  s.mat(`${id}__konektor`, '#c9d0db', { metal: 0.95, rough: 0.25 });
  s.mat(`${id}__hitam`, '#14171d', { metal: 0.2, rough: 0.5 });
  s.mat(`${id}__led`, '#48f090', { emissive: '#2fd978' });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.rbox(`${id}__bodi`, [0.1, 0.026, 0.05], 0.011, { pos: [0, 0.013, 0] });
    s.rbox(`${id}__konektor`, [0.056, 0.014, 0.036], 0.004, { pos: [0.078, 0.013, 0] });
    s.box(`${id}__hitam`, [0.04, 0.003, 0.016], { pos: [0.078, 0.021, 0] });
    s.tor(`${id}__konektor`, 0.012, 0.004, Math.PI * 2, { pos: [-0.055, 0.013, 0], rot: [90, 0, 0], seg: 18, tube: 8 });
    s.cyl(`${id}__led`, 0.006, 0.004, { pos: [0.02, 0.027, 0], seg: 12 });
  });
}

export function headset(s, id, o = {}) {
  s.mat(`${id}__bodi`, '#1c2029', { metal: 0.3, rough: 0.45 });
  s.mat(`${id}__bantal`, '#2f6df0', { metal: 0.05, rough: 0.6 });
  s.mat(`${id}__stand`, '#8b93a3', { metal: 0.85, rough: 0.28 });
  s.group({ pos: o.pos, rot: o.rot }, () => {
    s.cyl(`${id}__stand`, 0.1, 0.016, { pos: [0, 0.008, 0] });
    s.cyl(`${id}__stand`, 0.013, 0.36, { pos: [0, 0.19, 0] });
    s.tor(`${id}__bodi`, 0.16, 0.013, Math.PI, { pos: [0, 0.23, 0], seg: 30, tube: 10 });
    [-1, 1].forEach((sg) => {
      s.cyl(`${id}__bodi`, 0.07, 0.045, { pos: [sg * 0.17, 0.23, 0], rot: [0, 0, 90] });
      s.cyl(`${id}__bantal`, 0.075, 0.03, { pos: [sg * 0.145, 0.23, 0], rot: [0, 0, 90] });
    });
    s.cyl(`${id}__bodi`, 0.008, 0.12, { pos: [-0.2, 0.18, 0.04], rot: [20, 0, 0], seg: 10 });
    s.ell(`${id}__bodi`, [0.014, 0.014, 0.014], { pos: [-0.2, 0.12, 0.08] });
  });
}

// Kabel dari ruas-ruas bersumbu lurus (x / y / z) dengan sambungan bulat.
export function cable(s, mat, pts, r = 0.012) {
  for (let k = 0; k < pts.length - 1; k += 1) {
    const [a, b] = [pts[k], pts[k + 1]];
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(...d); if (len < 1e-6) continue;
    const mid = a.map((v, j) => (v + b[j]) / 2);
    const ax = Math.abs(d[0]) > 1e-6 ? 'x' : Math.abs(d[1]) > 1e-6 ? 'y' : 'z';
    s.cyl(mat, r, len, { pos: mid, rot: ax === 'x' ? [0, 0, 90] : ax === 'z' ? [90, 0, 0] : [0, 0, 0], seg: 12 });
    s.ell(mat, [r, r, r], { pos: b, ws: 10, hs: 6 });
  }
  s.ell(mat, [r, r, r], { pos: pts[0], ws: 10, hs: 6 });
}

export function shear(geo, k) { // x += k * z (untuk jajar genjang)
  const p = geo.p.slice(), n = geo.n.slice();
  for (let i = 0; i < p.length; i += 3) { p[i] += k * p[i + 2]; n[i + 2] -= k * n[i]; }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return { p, n, i: geo.i };
}
export { boxGeo, rboxGeo };
