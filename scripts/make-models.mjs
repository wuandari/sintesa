// Membuat model GLB prosedural (bentuk hardware sungguhan) di public/models/<slug>.glb.
// Ganti file .glb dengan model asli; pertahankan nama material = "<idKomponen>" atau "<idKomponen>__<varian>".
import fs from 'node:fs';
import path from 'node:path';
import { MODELS } from './models/models.mjs';

const out = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'models');
fs.mkdirSync(out, { recursive: true });
for (const [slug, build] of Object.entries(MODELS)) {
  const scene = build();
  const buf = scene.toGLB();
  fs.writeFileSync(path.join(out, `${slug}.glb`), buf);
  console.log(`model ${slug}  ${(buf.length / 1024).toFixed(0)} KB  komponen: ${scene.partIds().filter((p) => p !== 'Meja').join(', ')}`);
}
