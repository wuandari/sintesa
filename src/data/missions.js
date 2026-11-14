// Enam misi AR Kelas 10 SMK RPL, dibagi ke tiga mapel: Informatika, Dasar-dasar PPLG, Sistem Komputer.
// Teks dasar berbahasa Indonesia; terjemahan Inggris ada di MISSIONS_EN (pakai localizeMission).

export const MAPEL = ['Informatika', 'Dasar-dasar PPLG', 'Sistem Komputer'];
export const MAPEL_EN = { 'Informatika': 'Informatics', 'Dasar-dasar PPLG': 'Software Engineering Basics (PPLG)', 'Sistem Komputer': 'Computer Systems' };
export const mapelLabel = (k, lang = 'id') => (lang === 'en' ? MAPEL_EN[k] || k : k);

export const MISSIONS = [
  {
    slug: 'sistem-komputer', title: 'Sistem Komputer & Cara Kerja', category: 'Sistem Komputer', icon: '🖥️', gradient: ['#6a3fe0', '#c13fb0'], xp: 100,
    objective: 'Jelaskan input–proses–output & raih 100 XP',
    text: 'Putar model meja komputer, amati tiap perangkatnya, lalu hubungkan: keyboard = input, CPU = proses, monitor = output.',
    tags: ['Sistem Komputer', 'Input–Proses–Output'],
  },
  {
    slug: 'perangkat-keras', title: 'Komponen di Dalam Komputer', category: 'Sistem Komputer', icon: '🧩', gradient: ['#0f9d9a', '#2f7be8'], xp: 100,
    objective: 'Kenali fungsi komponen dalam PC & raih 100 XP',
    text: 'Amati motherboard, prosesor, RAM, kartu grafis, SSD, kipas, dan PSU. Ketuk tiap bagian lalu hubungkan dengan fungsinya.',
    tags: ['Hardware', 'Perakitan'],
  },
  {
    slug: 'jaringan-komputer', title: 'Jaringan Komputer & Internet', category: 'Informatika', icon: '🌐', gradient: ['#2f7be8', '#8a5cf6'], xp: 100,
    objective: 'Sebutkan fungsi perangkat jaringan & raih 100 XP',
    text: 'Amati model jaringan sederhana: router, switch, server, kabel UTP, dan laptop. Jelaskan peran masing-masing dalam menghubungkan perangkat.',
    tags: ['Jaringan', 'Internet'],
  },
  {
    slug: 'keamanan-data', title: 'Keamanan Data & Proteksi', category: 'Informatika', icon: '🛡️', gradient: ['#e11d48', '#fb7185'], xp: 100,
    objective: 'Sebutkan 3 praktik keamanan data, raih 100 XP',
    text: 'Lindungi datamu: password kuat, antivirus, firewall, dan backup. Hubungkan tiap perangkat proteksi dengan tugasnya.',
    tags: ['Keamanan', 'Backup'],
  },
  {
    slug: 'algoritma-flowchart', title: 'Algoritma & Flowchart', category: 'Dasar-dasar PPLG', icon: '🔀', gradient: ['#16a34a', '#4ade80'], xp: 100,
    objective: 'Baca simbol flowchart & susun algoritma, raih 100 XP',
    text: 'Latih berpikir komputasional: algoritma sebagai urutan langkah, simbol flowchart 3D, variabel, dan percabangan.',
    tags: ['Algoritma', 'Flowchart'],
  },
  {
    slug: 'alat-programmer', title: 'Alat Kerja Seorang Programmer', category: 'Dasar-dasar PPLG', icon: '💻', gradient: ['#f59e0b', '#f97316'], xp: 100,
    objective: 'Kenali perangkat kerja programmer & raih 100 XP',
    text: 'Kenali meja kerja programmer: laptop, monitor eksternal, keyboard, mouse, flashdisk, dan headset, serta editor kode yang dipakai.',
    tags: ['Pemrograman', 'IDE'],
  },
];

export const MISSIONS_EN = {
  'sistem-komputer': {
    title: 'Computer Systems & How They Work', objective: 'Explain input–process–output & earn 100 XP',
    text: 'Rotate the computer desk model, look at each device, then connect them: keyboard = input, CPU = process, monitor = output.',
    tags: ['Computer Systems', 'Input–Process–Output'],
  },
  'perangkat-keras': {
    title: 'Inside the Computer', objective: 'Recognise PC component functions & earn 100 XP',
    text: 'Look at the motherboard, processor, RAM, graphics card, SSD, fan and PSU. Tap each part, then connect it to its function.',
    tags: ['Hardware', 'PC Assembly'],
  },
  'jaringan-komputer': {
    title: 'Computer Networks & the Internet', objective: 'Name network device functions & earn 100 XP',
    text: 'Look at a simple network: router, switch, server, UTP cables and a laptop. Explain the role each one plays in connecting devices.',
    tags: ['Networking', 'Internet'],
  },
  'keamanan-data': {
    title: 'Data Security & Protection', objective: 'Name 3 data security practices, earn 100 XP',
    text: 'Protect your data: strong passwords, antivirus, a firewall and backups. Connect each protection device to its job.',
    tags: ['Security', 'Backup'],
  },
  'algoritma-flowchart': {
    title: 'Algorithms & Flowcharts', objective: 'Read flowchart symbols & build an algorithm, earn 100 XP',
    text: 'Practise computational thinking: an algorithm as a sequence of steps, 3D flowchart symbols, variables and branching.',
    tags: ['Algorithms', 'Flowcharts'],
  },
  'alat-programmer': {
    title: "A Programmer's Toolkit", objective: "Recognise a programmer's tools & earn 100 XP",
    text: "Get to know a programmer's desk: laptop, external monitor, keyboard, mouse, flash drive and headset, plus the code editor they use.",
    tags: ['Programming', 'IDE'],
  },
};

export function localizeMission(m, lang = 'id') {
  if (lang !== 'en' || !m) return m;
  return { ...m, ...(MISSIONS_EN[m.slug] || {}), categoryLabel: MAPEL_EN[m.category] || m.category };
}
export const missionsFor = (lang = 'id') => MISSIONS.map((m) => localizeMission(m, lang));
