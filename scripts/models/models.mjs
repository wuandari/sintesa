// Enam model misi. Id komponen (nama material sebelum "__") harus sama dengan parts[].id di src/data/missionContent.js.
import { Scene } from './lib.mjs';
import { monitor, keyboard, mouse, speaker, cpuCase, router, switchDev, server, laptop, usb, headset, cable, shear, boxGeo } from './assets.mjs';

const range = (n) => Array.from({ length: n }, (_, k) => k);
function table(s, w, d, { x = 0, z = 0, color = '#e4e9f2' } = {}) {
  s.mat('Meja', color, { metal: 0.05, rough: 0.8 });
  s.rbox('Meja', [w, 0.08, d], 0.03, { pos: [x, -0.04, z] });
}

export function sistemKomputer() {
  const s = new Scene(); table(s, 3.2, 1.45, { x: 0.3, z: 0.05 });
  monitor(s, 'Monitor', { pos: [0, 0, -0.3] });
  keyboard(s, 'Keyboard', { pos: [0, 0, 0.4] });
  mouse(s, 'Mouse', { pos: [0.78, 0, 0.4], rot: [0, -8, 0] });
  speaker(s, 'Speaker', { pos: [-0.95, 0, -0.35] });
  speaker(s, 'Speaker', { pos: [0.95, 0, -0.35] });
  cpuCase(s, 'CPU', { pos: [1.5, 0, -0.1], rot: [0, -14, 0] });
  return s;
}

export function perangkatKeras() {
  const s = new Scene(); table(s, 4.0, 2.0, { x: -0.3, z: 0.05 });
  s.mat('Motherboard__pcb', '#0f6d3f', { metal: 0.2, rough: 0.45 });
  s.mat('Motherboard__heatsink', '#9aa3b4', { metal: 0.85, rough: 0.3 });
  s.mat('Motherboard__slot', '#1b1f27', { metal: 0.2, rough: 0.5 });
  s.mat('Motherboard__kapasitor', '#c9ced8', { metal: 0.9, rough: 0.3 });
  s.mat('Motherboard__emas', '#e3b94d', { metal: 0.95, rough: 0.25 });
  s.mat('Motherboard__sata', '#e8452f', { metal: 0.1, rough: 0.5 });
  s.mat('Motherboard__baterai', '#cfd5df', { metal: 0.9, rough: 0.3 });
  s.mat('Motherboard__konektor', '#e9edf3', { metal: 0.1, rough: 0.5 });
  const B = [-0.55, 0, 0]; // pusat PCB
  s.group({ pos: B }, () => {
    s.rbox('Motherboard__pcb', [1.35, 0.03, 1.35], 0.012, { pos: [0, 0.015, 0] });
    // jalur tembaga
    range(10).forEach((k) => s.box('Motherboard__emas', [0.5, 0.0015, 0.006], { pos: [-0.35, 0.031, -0.5 + k * 0.1 + (k % 2) * 0.02] }));
    // slot RAM (4)
    range(4).forEach((k) => s.box('Motherboard__slot', [0.022, 0.026, 0.62], { pos: [0.2 + k * 0.05, 0.043, -0.18] }));
    // slot PCIe
    [0.3, 0.52].forEach((z) => { s.box('Motherboard__slot', [0.8, 0.026, 0.026], { pos: [-0.2, 0.043, z + 0.12] }); });
    // pendingin chipset + VRM
    s.rbox('Motherboard__heatsink', [0.2, 0.03, 0.2], 0.01, { pos: [0.28, 0.045, 0.45] });
    range(4).forEach((k) => s.box('Motherboard__heatsink', [0.16, 0.02, 0.005], { pos: [0.28, 0.07, 0.38 + k * 0.045] }));
    s.rbox('Motherboard__heatsink', [0.3, 0.05, 0.07], 0.01, { pos: [-0.22, 0.055, -0.5] });
    s.rbox('Motherboard__heatsink', [0.07, 0.05, 0.3], 0.01, { pos: [-0.62, 0.055, -0.18] });
    // kapasitor
    range(8).forEach((k) => s.cyl('Motherboard__kapasitor', 0.022, 0.05, { pos: [-0.62 + (k % 4) * 0.055, 0.055, 0.18 + Math.floor(k / 4) * 0.06], seg: 16 }));
    // SATA dan konektor daya 24 pin, baterai CMOS
    range(3).forEach((k) => s.box('Motherboard__sata', [0.05, 0.03, 0.03], { pos: [0.5, 0.045, 0.2 + k * 0.05] }));
    s.box('Motherboard__konektor', [0.05, 0.05, 0.14], { pos: [0.6, 0.055, -0.45] });
    s.cyl('Motherboard__baterai', 0.04, 0.012, { pos: [-0.05, 0.036, 0.45] });
    // panel I/O di sisi belakang
    s.box('Motherboard__heatsink', [0.5, 0.1, 0.025], { pos: [-0.3, 0.07, -0.655] });
    range(5).forEach((k) => s.box('Motherboard__slot', [0.05, 0.035, 0.03], { pos: [-0.5 + k * 0.08, 0.07, -0.668] }));
    // Prosesor + heatsink, Kipas pendingin di atasnya
    s.mat('Prosesor__soket', '#d6dbe4', { metal: 0.6, rough: 0.35 });
    s.mat('Prosesor__chip', '#c3cad6', { metal: 0.9, rough: 0.25 });
    s.mat('Prosesor__heatsink', '#aeb7c6', { metal: 0.9, rough: 0.3 });
    s.mat('Prosesor__pipa', '#c9772e', { metal: 0.95, rough: 0.25 });
    s.rbox('Prosesor__soket', [0.3, 0.014, 0.3], 0.01, { pos: [-0.22, 0.037, -0.1] });
    s.rbox('Prosesor__chip', [0.22, 0.016, 0.22], 0.01, { pos: [-0.22, 0.05, -0.1] });
    range(14).forEach((k) => s.box('Prosesor__heatsink', [0.34, 0.1, 0.008], { pos: [-0.22, 0.12, -0.26 + k * 0.025] }));
    range(2).forEach((k) => s.cyl('Prosesor__pipa', 0.011, 0.34, { pos: [-0.22, 0.09 + k * 0.03, -0.08 + k * 0.05], rot: [0, 0, 90], seg: 12 }));
    s.mat('Kipas__rangka', '#161a22', { metal: 0.3, rough: 0.5 });
    s.mat('Kipas__bilah', '#3f93f0', { metal: 0.2, rough: 0.4 });
    s.mat('Kipas__hub', '#0f1218', { metal: 0.4, rough: 0.4 });
    fan(s, 'Kipas', [-0.22, 0.19, -0.1], 0.36);
  });
  // RAM (dua keping berdiri di slot)
  s.mat('RAM__pcb', '#0e5a36', { metal: 0.2, rough: 0.45 });
  s.mat('RAM__chip', '#15181f', { metal: 0.3, rough: 0.5 });
  s.mat('RAM__pelindung', '#e5483a', { metal: 0.8, rough: 0.3 });
  s.mat('RAM__emas', '#e3b94d', { metal: 0.95, rough: 0.25 });
  [0, 2].forEach((k) => {
    const x = B[0] + 0.2 + k * 0.05;
    s.box('RAM__pcb', [0.012, 0.13, 0.56], { pos: [x, 0.115, -0.18] });
    s.box('RAM__emas', [0.013, 0.014, 0.52], { pos: [x, 0.056, -0.18] });
    s.box('RAM__pelindung', [0.02, 0.07, 0.5], { pos: [x, 0.145, -0.18] });
    range(4).forEach((c) => s.box('RAM__chip', [0.016, 0.04, 0.09], { pos: [x - 0.009, 0.095, -0.38 + c * 0.13] }));
  });
  // VGA / kartu grafis
  s.mat('VGA__bodi', '#171a22', { metal: 0.4, rough: 0.4 });
  s.mat('VGA__pcb', '#222833', { metal: 0.3, rough: 0.5 });
  s.mat('VGA__bilah', '#9aa3b4', { metal: 0.6, rough: 0.35 });
  s.mat('VGA__led', '#48f090', { emissive: '#2fd978' });
  s.mat('VGA__emas', '#e3b94d', { metal: 0.95, rough: 0.25 });
  s.mat('VGA__braket', '#b9c0cd', { metal: 0.85, rough: 0.3 });
  s.group({ pos: [1.05, 0, 0.5], rot: [0, -12, 0] }, () => {
    s.rbox('VGA__bodi', [1.0, 0.11, 0.3], 0.025, { pos: [0, 0.075, 0] });
    s.box('VGA__pcb', [0.95, 0.02, 0.24], { pos: [-0.02, 0.012, 0] });
    s.box('VGA__braket', [0.01, 0.13, 0.3], { pos: [-0.5, 0.075, 0] });
    s.box('VGA__emas', [0.4, 0.004, 0.02], { pos: [-0.1, 0.0, 0.17] });
    [-0.25, 0.22].forEach((x) => {
      s.cyl('VGA__bodi', 0.115, 0.012, { pos: [x, 0.134, 0], seg: 32 });
      range(7).forEach((k) => s.box('VGA__bilah', [0.09, 0.006, 0.026], { pos: [x + Math.cos((k / 7) * Math.PI * 2) * 0.05, 0.142, Math.sin((k / 7) * Math.PI * 2) * 0.05], rot: [0, -((k / 7) * 360), 0] }));
      s.cyl('VGA__led', 0.02, 0.008, { pos: [x, 0.144, 0], seg: 16 });
    });
  });
  // SSD
  s.mat('SSD__bodi', '#c7ccd6', { metal: 0.8, rough: 0.3 });
  s.mat('SSD__label', '#2f6df0', { metal: 0.1, rough: 0.4 });
  s.mat('SSD__konektor', '#e3b94d', { metal: 0.95, rough: 0.25 });
  s.mat('SSD__hitam', '#14171d', { metal: 0.2, rough: 0.5 });
  s.group({ pos: [1.05, 0, -0.5], rot: [0, 14, 0] }, () => {
    s.rbox('SSD__bodi', [0.4, 0.04, 0.28], 0.012, { pos: [0, 0.02, 0] });
    s.box('SSD__label', [0.3, 0.004, 0.12], { pos: [-0.02, 0.042, 0] });
    s.box('SSD__hitam', [0.06, 0.03, 0.06], { pos: [0.22, 0.02, 0.05] });
    range(4).forEach((k) => s.box('SSD__konektor', [0.012, 0.012, 0.012], { pos: [0.23 + (k - 1.5) * 0.0, 0.02, 0.025 + k * 0.014] }));
  });
  // PSU
  s.mat('PSU__bodi', '#1c2029', { metal: 0.5, rough: 0.4 });
  s.mat('PSU__kisi', '#0a0c10', { metal: 0.3, rough: 0.6 });
  s.mat('PSU__label', '#f2b233', { metal: 0.1, rough: 0.4 });
  s.mat('PSU__kabel', '#14171d', { metal: 0.1, rough: 0.6 });
  s.mat('PSU__konektor', '#f3f5f9', { metal: 0.1, rough: 0.5 });
  s.group({ pos: [-1.8, 0, -0.55], rot: [0, 18, 0] }, () => {
    s.rbox('PSU__bodi', [0.6, 0.34, 0.42], 0.02, { pos: [0, 0.17, 0] });
    s.cyl('PSU__kisi', 0.14, 0.01, { pos: [0, 0.345, 0], seg: 28 });
    range(6).forEach((k) => s.box('PSU__bodi', [0.26, 0.012, 0.012], { pos: [0, 0.352, -0.09 + k * 0.036] }));
    s.box('PSU__label', [0.22, 0.004, 0.1], { pos: [0.18, 0.342, 0.12] });
    s.box('PSU__kisi', [0.22, 0.1, 0.01], { pos: [0, 0.17, 0.215] });
    cable(s, 'PSU__kabel', [[0.18, 0.1, 0.21], [0.18, 0.012, 0.21], [0.18, 0.012, 0.62]], 0.016);
    cable(s, 'PSU__kabel', [[0.08, 0.1, 0.21], [0.08, 0.012, 0.21], [0.08, 0.012, 0.5]], 0.016);
    s.box('PSU__konektor', [0.07, 0.03, 0.06], { pos: [0.18, 0.015, 0.64] });
    s.box('PSU__konektor', [0.05, 0.03, 0.05], { pos: [0.08, 0.015, 0.52] });
  });
  return s;
}

function fan(s, id, pos, size = 0.36) {
  s.group({ pos }, () => {
    s.rbox(`${id}__rangka`, [size, 0.035, size], 0.03, { pos: [0, 0, 0] });
    range(7).forEach((k) => {
      const a = (k / 7) * 360;
      s.group({ rot: [0, a, 0] }, () => s.box(`${id}__bilah`, [0.1, 0.008, 0.045], { pos: [0.065, 0.012, 0], rot: [0, 0, 8] }));
    });
    s.cyl(`${id}__hub`, 0.05, 0.03, { pos: [0, 0.01, 0], seg: 24 });
  });
}

export function jaringanKomputer() {
  const s = new Scene(); table(s, 4.0, 1.95, { x: -0.05, z: 0.05 });
  s.mat('Kabel__utp', '#2f8cf0', { metal: 0.1, rough: 0.5 });
  s.mat('Kabel__kuning', '#f2b233', { metal: 0.1, rough: 0.5 });
  s.mat('Kabel__rj45', '#d9dee8', { metal: 0.1, rough: 0.35 });
  router(s, 'Router', { pos: [0, 0, -0.55] });
  switchDev(s, 'Switch', { pos: [0, 0, 0.15] });
  server(s, 'Server', { pos: [-1.55, 0, -0.1], rot: [0, 18, 0] });
  laptop(s, 'Laptop', { pos: [1.5, 0, 0.1], rot: [0, -25, 0], screen: 'code' });
  // awan Internet
  s.mat('Internet__awan', '#f4f8ff', { metal: 0, rough: 0.7, emissive: '#6f86a8' });
  s.mat('Internet__tiang', '#8b93a3', { metal: 0.8, rough: 0.3 });
  const cy = 1.35;
  [[-0.32, 0, 0.2], [0, 0.1, 0.27], [0.34, 0, 0.21], [0.12, -0.05, 0.18], [-0.12, -0.04, 0.2]].forEach(([x, y, r]) => s.ell('Internet__awan', [r, r * 0.92, r * 0.9], { pos: [x, cy + y, -0.55], ws: 20, hs: 12 }));
  s.cyl('Internet__tiang', 0.014, 0.82, { pos: [0, 0.78, -0.62] });
  // kabel UTP biru dan kuning
  cable(s, 'Kabel__utp', [[0, 0.05, -0.36], [0, 0.012, -0.3], [0, 0.012, 0.02], [0, 0.04, 0.0]], 0.012);
  cable(s, 'Kabel__kuning', [[-0.35, 0.036, 0.33], [-0.35, 0.012, 0.6], [-1.2, 0.012, 0.6], [-1.2, 0.012, 0.3], [-1.4, 0.04, 0.3]], 0.012);
  cable(s, 'Kabel__utp', [[0.35, 0.036, 0.33], [0.35, 0.012, 0.6], [1.15, 0.012, 0.6], [1.15, 0.012, 0.3]], 0.012);
  [[0, 0.05, -0.36], [-0.35, 0.036, 0.33], [0.35, 0.036, 0.33]].forEach((p) => s.box('Kabel__rj45', [0.03, 0.026, 0.03], { pos: p }));
  return s;
}

export function keamananData() {
  const s = new Scene(); table(s, 3.6, 1.9, { x: 0.02, z: -0.02 });
  laptop(s, 'Laptop', { pos: [0, 0, 0.35], screen: 'login' });
  // gembok
  s.mat('Gembok__badan', '#e0b13a', { metal: 0.95, rough: 0.25 });
  s.mat('Gembok__gelang', '#cfd5df', { metal: 0.95, rough: 0.2 });
  s.mat('Gembok__lubang', '#14171d', { metal: 0.2, rough: 0.5 });
  s.group({ pos: [-1.35, 0, 0.25], rot: [0, 12, 0] }, () => {
    s.rbox('Gembok__badan', [0.6, 0.46, 0.22], 0.05, { pos: [0, 0.23, 0] });
    s.tor('Gembok__gelang', 0.17, 0.04, Math.PI, { pos: [0, 0.46, 0], seg: 28, tube: 12 });
    s.cyl('Gembok__gelang', 0.04, 0.06, { pos: [-0.17, 0.48, 0] }); s.cyl('Gembok__gelang', 0.04, 0.06, { pos: [0.17, 0.48, 0] });
    s.cyl('Gembok__lubang', 0.045, 0.02, { pos: [0, 0.27, 0.112], rot: [90, 0, 0], seg: 20 });
    s.box('Gembok__lubang', [0.03, 0.12, 0.02], { pos: [0, 0.2, 0.112] });
  });
  // perisai
  s.mat('Perisai__badan', '#2f7be8', { metal: 0.5, rough: 0.3 });
  s.mat('Perisai__tepi', '#cfd5df', { metal: 0.95, rough: 0.22 });
  s.mat('Perisai__lambang', '#f4f8ff', { emissive: '#9fb6d6', rough: 0.3 });
  s.group({ pos: [1.4, 0, 0.35], rot: [0, -14, 0] }, () => {
    s.rbox('Perisai__tepi', [0.66, 0.36, 0.08], 0.04, { pos: [0, 0.92, 0] });
    s.ell('Perisai__tepi', [0.33, 0.45, 0.04], { pos: [0, 0.72, 0], ws: 28, hs: 16 });
    s.rbox('Perisai__badan', [0.56, 0.32, 0.09], 0.035, { pos: [0, 0.92, 0] });
    s.ell('Perisai__badan', [0.28, 0.4, 0.05], { pos: [0, 0.74, 0], ws: 28, hs: 16 });
    s.box('Perisai__lambang', [0.05, 0.26, 0.04], { pos: [0.05, 0.78, 0.07], rot: [0, 0, -38] });
    s.box('Perisai__lambang', [0.05, 0.14, 0.04], { pos: [-0.1, 0.72, 0.07], rot: [0, 0, 42] });
    s.cyl('Perisai__tepi', 0.22, 0.03, { pos: [0, 0.015, 0] });
    s.cyl('Perisai__tepi', 0.03, 0.34, { pos: [0, 0.18, -0.02] });
  });
  // firewall: dinding bata + api
  s.mat('Firewall__bata', '#b8472f', { metal: 0.05, rough: 0.85 });
  s.mat('Firewall__bata2', '#9c3a27', { metal: 0.05, rough: 0.85 });
  s.mat('Firewall__api', '#ffb347', { emissive: '#ff7a1a', rough: 0.4 });
  s.mat('Firewall__api2', '#ffd36b', { emissive: '#ffb030', rough: 0.4 });
  s.group({ pos: [-0.6, 0, -0.62] }, () => {
    range(5).forEach((r) => range(6).forEach((c) => {
      const off = r % 2 ? 0.075 : 0;
      s.rbox((r + c) % 3 ? 'Firewall__bata' : 'Firewall__bata2', [0.145, 0.07, 0.12], 0.008, { pos: [-0.375 + c * 0.152 + off, 0.036 + r * 0.075, 0] });
    }));
    [[-0.28, 0.22], [-0.05, 0.3], [0.2, 0.24], [0.36, 0.2]].forEach(([x, h], k) => {
      s.cyl('Firewall__api', 0.07, h, { pos: [x, 0.38 + h / 2, 0.02], r2: 0.0, seg: 14 });
      s.cyl('Firewall__api2', 0.04, h * 0.6, { pos: [x, 0.38 + h * 0.3, 0.05], r2: 0.0, seg: 12 });
    });
  });
  // backup drive + awan
  s.mat('Backup__bodi', '#9aa3b4', { metal: 0.85, rough: 0.3 });
  s.mat('Backup__hitam', '#14171d', { metal: 0.3, rough: 0.5 });
  s.mat('Backup__led', '#4ab4ff', { emissive: '#2f9aff' });
  s.mat('Backup__kabel', '#14171d', { metal: 0.1, rough: 0.6 });
  s.group({ pos: [0.82, 0, 0.5], rot: [0, -8, 0] }, () => {
    s.rbox('Backup__bodi', [0.5, 0.08, 0.34], 0.022, { pos: [0, 0.04, 0] });
    s.rbox('Backup__hitam', [0.46, 0.012, 0.3], 0.01, { pos: [0, 0.085, 0] });
    s.box('Backup__led', [0.07, 0.006, 0.012], { pos: [-0.17, 0.092, 0.12] });
    cable(s, 'Backup__kabel', [[0.26, 0.04, 0.0], [0.4, 0.012, 0.0], [0.4, 0.012, 0.35]], 0.012);
  });
  return s;
}

export function algoritmaFlowchart() {
  const s = new Scene(); table(s, 3.0, 4.2, { x: 0.6, z: -0.1, color: '#e9eef8' });
  s.mat('Terminal__plat', '#2fb872', { metal: 0.1, rough: 0.4 });
  s.mat('Proses__plat', '#2f7be8', { metal: 0.1, rough: 0.4 });
  s.mat('Keputusan__plat', '#f59a2c', { metal: 0.1, rough: 0.4 });
  s.mat('InputOutput__plat', '#8b5cf6', { metal: 0.1, rough: 0.4 });
  s.mat('Alur__panah', '#394255', { metal: 0.3, rough: 0.45 });
  const H = 0.09;
  const capsule = (id, x, z, w, d) => {
    s.box(`${id}__plat`, [w - d, H, d], { pos: [x, H / 2, z] });
    [-1, 1].forEach((sg) => s.cyl(`${id}__plat`, d / 2, H, { pos: [x + sg * (w - d) / 2, H / 2, z], seg: 28 }));
  };
  const arrow = (x, z0, z1) => {
    s.box('Alur__panah', [0.045, 0.04, Math.abs(z1 - z0) - 0.1], { pos: [x, 0.02, (z0 + z1) / 2 - 0.04] });
    s.cyl('Alur__panah', 0.075, 0.12, { pos: [x, 0.03, z1 - 0.06], rot: [90, 0, 0], r2: 0, seg: 14 });
  };
  const arrowX = (z, x0, x1) => {
    s.box('Alur__panah', [Math.abs(x1 - x0) - 0.1, 0.04, 0.045], { pos: [(x0 + x1) / 2 - 0.04, 0.02, z] });
    s.cyl('Alur__panah', 0.075, 0.12, { pos: [x1 - 0.06, 0.03, z], rot: [0, 0, -90], r2: 0, seg: 14 });
  };
  const arrowXneg = (z, x0, x1) => {
    s.box('Alur__panah', [Math.abs(x0 - x1) - 0.1, 0.04, 0.045], { pos: [(x0 + x1) / 2 + 0.04, 0.02, z] });
    s.cyl('Alur__panah', 0.075, 0.12, { pos: [x1 + 0.06, 0.03, z], rot: [0, 0, 90], r2: 0, seg: 14 });
  };
  capsule('Terminal', 0, -1.8, 0.9, 0.34);
  arrow(0, -1.63, -1.32);
  s.add(shear(boxGeo(0.7, H, 0.34), 0.35), 'InputOutput__plat', { pos: [0, H / 2, -1.15] });
  arrow(0, -0.98, -0.62);
  s.rbox('Proses__plat', [0.8, H, 0.36], 0.025, { pos: [0, H / 2, -0.45] });
  arrow(0, -0.27, 0.1);
  s.rbox('Keputusan__plat', [0.5, H, 0.5], 0.03, { pos: [0, H / 2, 0.45], rot: [0, 45, 0] });
  arrowX(0.45, 0.4, 1.0);
  s.rbox('Proses__plat', [0.8, H, 0.36], 0.025, { pos: [1.3, H / 2, 0.45] });
  
  arrow(0, 0.78, 1.34);
  capsule('Terminal', 0, 1.55, 0.9, 0.34);
  arrow(1.3, 0.65, 1.38);
  arrowXneg(1.55, 1.3, 0.5);
  return s;
}

export function alatProgrammer() {
  const s = new Scene(); table(s, 4.0, 1.9, { x: 0.15, z: 0.05 });
  laptop(s, 'Laptop', { pos: [-1.25, 0, 0.0], rot: [0, 20, 0], screen: 'code' });
  monitor(s, 'Monitor', { pos: [0.4, 0, -0.5], variant: 'editor' });
  keyboard(s, 'Keyboard', { pos: [0.4, 0, 0.3] });
  mouse(s, 'Mouse', { pos: [1.15, 0, 0.32], rot: [0, -8, 0] });
  usb(s, 'Flashdisk', { pos: [-0.35, 0, 0.62], rot: [0, 28, 0] });
  headset(s, 'Headset', { pos: [1.7, 0, -0.45], rot: [0, -30, 0] });
  return s;
}

export const MODELS = {
  'sistem-komputer': sistemKomputer,
  'perangkat-keras': perangkatKeras,
  'jaringan-komputer': jaringanKomputer,
  'keamanan-data': keamananData,
  'algoritma-flowchart': algoritmaFlowchart,
  'alat-programmer': alatProgrammer,
};
