// Pustaka kecil pembuat model GLB prosedural: primitif (kotak, kotak membulat, silinder, elipsoid, torus),
// tumpukan transformasi, material PBR, dan penulis GLB. Satu mesh, satu primitif per material.
// Konvensi nama material: "<IdKomponen>" atau "<IdKomponen>__<varian>" → id komponen = bagian sebelum "__".

const rad = (d) => (d * Math.PI) / 180;
export const hex = (h) => [1, 3, 5].map((i) => Math.pow(parseInt(h.slice(i, i + 2), 16) / 255, 2.2)); // sRGB → linear

// ---------- matriks 4x4 (kolom-mayor) ----------
const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) for (let k = 0; k < 4; k += 1) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function trs(pos = [0, 0, 0], rot = [0, 0, 0]) {
  const [rx, ry, rz] = rot.map(rad);
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  const Rx = [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1];
  const Ry = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1];
  const Rz = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const R = mul(Ry, mul(Rx, Rz));
  R[12] = pos[0]; R[13] = pos[1]; R[14] = pos[2];
  return R;
}
const tp = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
const td = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

// ---------- geometri ----------
export function boxGeo(w, h, d) {
  const x = w / 2, y = h / 2, z = d / 2;
  const F = [
    [[0, 0, 1], [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]],
    [[0, 0, -1], [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]],
    [[1, 0, 0], [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]],
    [[-1, 0, 0], [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]],
    [[0, 1, 0], [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]],
    [[0, -1, 0], [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]],
  ];
  const p = [], n = [], i = [];
  F.forEach(([nn, vs], f) => { vs.forEach((v) => { p.push(...v); n.push(...nn); }); const b = f * 4; i.push(b, b + 1, b + 2, b, b + 2, b + 3); });
  return { p, n, i };
}

// Kotak dengan sudut membulat (jari-jari r).
export function rboxGeo(w, h, d, r = 0.02) {
  const a = [w / 2, h / 2, d / 2];
  const rr = Math.min(r, ...a.map((v) => v * 0.98));
  const vals = (A) => [-A, -A + rr * 0.45, -A + rr, A - rr, A - rr * 0.45, A];
  const p = [], n = [], idx = [];
  for (let k = 0; k < 3; k += 1) {
    for (const s of [1, -1]) {
      const u = (k + 1) % 3, v = (k + 2) % 3;
      const base = p.length / 3;
      const Lu = vals(a[u]), Lv = vals(a[v]);
      for (let iu = 0; iu < Lu.length; iu += 1) {
        for (let iv = 0; iv < Lv.length; iv += 1) {
          const q = [0, 0, 0]; q[k] = s * a[k]; q[u] = Lu[iu]; q[v] = Lv[iv];
          const c = q.map((val, t) => Math.max(-(a[t] - rr), Math.min(a[t] - rr, val)));
          const nv = norm(q.map((val, t) => val - c[t]));
          p.push(c[0] + nv[0] * rr, c[1] + nv[1] * rr, c[2] + nv[2] * rr);
          n.push(...nv);
        }
      }
      const W = Lv.length;
      const face = [0, 0, 0]; face[k] = s;
      for (let iu = 0; iu < Lu.length - 1; iu += 1) {
        for (let iv = 0; iv < W - 1; iv += 1) {
          const A = base + iu * W + iv, B = A + 1, C = A + W, D = C + 1;
          for (const t of [[A, B, D], [A, D, C]]) {
            const P = t.map((id) => p.slice(id * 3, id * 3 + 3));
            const e1 = P[1].map((x, j) => x - P[0][j]), e2 = P[2].map((x, j) => x - P[0][j]);
            const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
            const nn = t.reduce((acc, id) => acc.map((x, j) => x + n[id * 3 + j]), [0, 0, 0]);
            if (cr[0] * nn[0] + cr[1] * nn[1] + cr[2] * nn[2] >= 0) idx.push(t[0], t[1], t[2]); else idx.push(t[0], t[2], t[1]);
          }
        }
      }
    }
  }
  return { p, n, i: idx };
}

// Silinder / kerucut terpancung sepanjang sumbu Y (r2 = jari-jari atas).
export function cylGeo(r, h, seg = 28, r2 = r) {
  const p = [], n = [], i = [];
  const slope = (r - r2) / h;
  for (let s = 0; s <= seg; s += 1) {
    const t = (s / seg) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
    const nv = norm([c, slope, sn]);
    p.push(c * r, -h / 2, sn * r); n.push(...nv);
    p.push(c * r2, h / 2, sn * r2); n.push(...nv);
  }
  for (let s = 0; s < seg; s += 1) { const a = s * 2; i.push(a, a + 1, a + 3, a, a + 3, a + 2); }
  for (const [y, rr, ny] of [[h / 2, r2, 1], [-h / 2, r, -1]]) {
    if (rr <= 0) continue;
    const c0 = p.length / 3; p.push(0, y, 0); n.push(0, ny, 0);
    for (let s = 0; s <= seg; s += 1) { const t = (s / seg) * Math.PI * 2; p.push(Math.cos(t) * rr, y, Math.sin(t) * rr); n.push(0, ny, 0); }
    for (let s = 0; s < seg; s += 1) { if (ny > 0) i.push(c0, c0 + s + 2, c0 + s + 1); else i.push(c0, c0 + s + 1, c0 + s + 2); }
  }
  return { p, n, i };
}

export function ellGeo(rx, ry, rz, ws = 24, hs = 14) {
  const p = [], n = [], i = [];
  for (let a = 0; a <= hs; a += 1) {
    const th = (a / hs) * Math.PI;
    for (let b = 0; b <= ws; b += 1) {
      const ph = (b / ws) * Math.PI * 2;
      const x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
      p.push(x * rx, y * ry, z * rz);
      n.push(...norm([x / rx, y / ry, z / rz]));
    }
  }
  for (let a = 0; a < hs; a += 1) for (let b = 0; b < ws; b += 1) { const A = a * (ws + 1) + b, B = A + ws + 1; i.push(A, A + 1, B + 1, A, B + 1, B); }
  return { p, n, i };
}

// Busur torus pada bidang XY mengelilingi Z (R = jari-jari busur, r = tebal tabung).
export function torGeo(R, r, arc = Math.PI * 2, seg = 28, tube = 10) {
  const p = [], n = [], i = [];
  for (let s = 0; s <= seg; s += 1) {
    const th = (s / seg) * arc;
    for (let t = 0; t <= tube; t += 1) {
      const ph = (t / tube) * Math.PI * 2;
      const nv = [Math.cos(ph) * Math.cos(th), Math.cos(ph) * Math.sin(th), Math.sin(ph)];
      p.push(R * Math.cos(th) + r * nv[0], R * Math.sin(th) + r * nv[1], r * nv[2]); n.push(...nv);
    }
  }
  for (let s = 0; s < seg; s += 1) for (let t = 0; t < tube; t += 1) { const A = s * (tube + 1) + t, B = A + tube + 1; i.push(A, B + 1, A + 1, A, B, B + 1); }
  return { p, n, i };
}

// ---------- adegan ----------
export class Scene {
  constructor() { this.mats = new Map(); this.prims = new Map(); this.stack = [I()]; }
  mat(name, color, o = {}) { this.mats.set(name, { color, metal: o.metal ?? 0.1, rough: o.rough ?? 0.55, emissive: o.emissive ?? null }); return name; }
  group(opts, fn) { this.stack.push(mul(this.stack[this.stack.length - 1], trs(opts.pos, opts.rot))); fn(); this.stack.pop(); return this; }
  add(geo, mat, o = {}) {
    if (!this.mats.has(mat)) throw new Error(`Material belum didaftarkan: ${mat}`);
    const m = mul(this.stack[this.stack.length - 1], trs(o.pos, o.rot));
    let g = this.prims.get(mat);
    if (!g) { g = { p: [], n: [], i: [] }; this.prims.set(mat, g); }
    const base = g.p.length / 3;
    for (let k = 0; k < geo.p.length; k += 3) {
      g.p.push(...tp(m, geo.p[k], geo.p[k + 1], geo.p[k + 2]));
      g.n.push(...norm(td(m, geo.n[k], geo.n[k + 1], geo.n[k + 2])));
    }
    for (const id of geo.i) g.i.push(base + id);
    return this;
  }
  box(mat, [w, h, d], o) { return this.add(boxGeo(w, h, d), mat, o); }
  rbox(mat, [w, h, d], r, o) { return this.add(rboxGeo(w, h, d, r), mat, o); }
  cyl(mat, r, h, o = {}) { return this.add(cylGeo(r, h, o.seg ?? 28, o.r2 ?? r), mat, o); }
  ell(mat, [rx, ry, rz], o = {}) { return this.add(ellGeo(rx, ry, rz, o.ws, o.hs), mat, o); }
  tor(mat, R, r, arc, o = {}) { return this.add(torGeo(R, r, arc, o.seg, o.tube), mat, o); }
  partIds() { return [...new Set([...this.mats.keys()].map((m) => m.split('__')[0]))]; }

  toGLB() {
    const names = [...this.prims.keys()];
    const chunks = []; const views = []; const acc = []; let off = 0;
    const push = (buf, target) => {
      const pad = (4 - (off % 4)) % 4; if (pad) { chunks.push(Buffer.alloc(pad)); off += pad; }
      views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, target }); chunks.push(buf); off += buf.length; return views.length - 1;
    };
    const primitives = names.map((name, k) => {
      const g = this.prims.get(name);
      const pos = new Float32Array(g.p);
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      for (let t = 0; t < pos.length; t += 3) for (let c = 0; c < 3; c += 1) { min[c] = Math.min(min[c], pos[t + c]); max[c] = Math.max(max[c], pos[t + c]); }
      const a0 = acc.length;
      acc.push({ bufferView: push(Buffer.from(pos.buffer), 34962), componentType: 5126, count: pos.length / 3, type: 'VEC3', min, max });
      acc.push({ bufferView: push(Buffer.from(new Float32Array(g.n).buffer), 34962), componentType: 5126, count: g.n.length / 3, type: 'VEC3' });
      acc.push({ bufferView: push(Buffer.from(new Uint32Array(g.i).buffer), 34963), componentType: 5125, count: g.i.length, type: 'SCALAR' });
      return { attributes: { POSITION: a0, NORMAL: a0 + 1 }, indices: a0 + 2, material: k };
    });
    const bin = Buffer.concat(chunks);
    const json = {
      asset: { version: '2.0', generator: 'sintesa-make-models' },
      scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: 'model', mesh: 0 }],
      meshes: [{ name: 'model', primitives }],
      materials: names.map((name) => {
        const m = this.mats.get(name);
        const o = { name, pbrMetallicRoughness: { baseColorFactor: [...hex(m.color), 1], metallicFactor: m.metal, roughnessFactor: m.rough } };
        if (m.emissive) o.emissiveFactor = hex(m.emissive);
        return o;
      }),
      accessors: acc, bufferViews: views, buffers: [{ byteLength: bin.length }],
    };
    let j = Buffer.from(JSON.stringify(json));
    j = Buffer.concat([j, Buffer.alloc((4 - (j.length % 4)) % 4, 0x20)]);
    const b = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
    const head = Buffer.alloc(12); head.write('glTF', 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + j.length + 8 + b.length, 8);
    const jh = Buffer.alloc(8); jh.writeUInt32LE(j.length, 0); jh.write('JSON', 4);
    const bh = Buffer.alloc(8); bh.writeUInt32LE(b.length, 0); bh.write('BIN\0', 4);
    return Buffer.concat([head, jh, j, bh, b]);
  }
}
