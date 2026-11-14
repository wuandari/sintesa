# Sintesa — platform belajar AR + gamifikasi (Kelas 10 RPL)

Next.js 15 (App Router) + PostgreSQL (`pg`). Satu aplikasi berisi halaman dan API.

## Fitur

**Murid:** dashboard gamifikasi (level, XP, 6 badge, leaderboard) · halaman Misi AR (daftar misi + detail: model 3D, ketuk
komponen → penjelasan AI, tab Misi/Materi/Soal dengan umpan balik per soal) · "Kelasku": materi yang dibagikan guru +
gabung kelas · Tugas dari guru (kumpul file, lihat nilai & feedback) · Library arsip pribadi (seret-lepas, cari, filter, 0 XP) ·
foto profil.

**Aturan XP misi:** soal latihan **tidak** memberi XP. XP +100 (sekali per misi) didapat dengan menekan **Tandai Selesai**
pada materi yang dibagikan guru ke kelas murid; misi bawaan wajib lulus latihan (≥60) dulu, materi buatan guru langsung bisa ditandai.

**Guru:** buat kelas + kode · buat tugas (poin XP 1–10.000, lampiran, tenggat) · nilai 0–100 + feedback per file atau
minta revisi · bagikan misi AR ke kelas (+ Tugaskan) · **unggah materi AR sendiri (model .glb)** · pantau arsip siswa · lihat leaderboard.

**Tiga revisi khusus:**
1. **Revisi tugas mengurangi XP**: tiap unggah ulang setelah pengumpulan pertama memotong 20% dari poin tugas,
   sisa XP tugas itu minimal 20% (poin 100 → 100, 80, 60, 40, 20, 20…). Murid diberi peringatan sebelum unggah ulang.
2. **Ikon mata** (tampil/sembunyi password) di login dan daftar.
3. **Popup AI**: ketuk bagian model 3D (atau pilih chip komponen) → kotak info singkat. Memakai Anthropic API bila
   `ANTHROPIC_API_KEY` diisi (hasil disimpan sebagai cache); tanpa kunci memakai penjelasan bawaan.

## Menjalankan di laptop

1. Pasang **Node.js 20+**.
2. Di Neon, buat **Project baru yang kosong** (mis. `sintesa-baru`). Jangan memakai branch dari project lama: branch menyalin tabel lama dan bisa bentrok dengan migrasi. **Jangan pernah memakai database situs yang sedang online.**
3. Salin `.env.example` → `.env`, isi `DATABASE_URL` dan `AUTH_SECRET` (lainnya opsional).
4. Jalankan:

```bash
npm install
npm run db:migrate                                          # membuat tabel
npm run guru:buat -- "Nama Guru" guru@email.com passwordku  # akun guru (pendaftaran publik hanya murid)
npm run db:demo                                             # opsional: 5 murid + kelas demo
npm run dev                                                 # http://localhost:3000
```

Akun demo: `guru.demo@sintesa.test`, `murid1..5.demo@sintesa.test`, password `demo1234`, kode kelas `KELAS-DEMO1`.

## Deploy ke Vercel

Import repo, isi `DATABASE_URL`, `AUTH_SECRET`, dan (disarankan) `BLOB_READ_WRITE_TOKEN` (Vercel → Storage → Blob).
Tanpa Blob, file hanya tersimpan di disk lokal sehingga **tidak awet di Vercel**. Jalankan `npm run db:migrate`
dari laptop dengan `DATABASE_URL` database tujuan.

## Yang baru di v3

- **Streak api** 🔥: naik +1 tiap hari murid membuka Sintesa (hari WIB), reset ke 1 bila sehari bolong. Warna: 10 hari oranye, 30 hari ungu, 50 hari biru. Hanya penyemangat.
- **Total XP & Riwayat XP** di halaman murid (rincian materi/tugas, 15 perolehan terakhir) dan **profil lengkap** (nama, NIS, bio, kelas, statistik, badge).
- **3 mata pelajaran** untuk Kelas 10 RPL: Informatika, Dasar-dasar PPLG, Sistem Komputer — 6 misi, semuanya punya model 3D/AR. Materi buatan guru wajib memilih salah satu dari 3 mapel.
- **Model 3D hardware** (monitor, CPU, keyboard, mouse, motherboard, RAM, router, laptop, dll.), dibuat prosedural: `node scripts/make-models.mjs`.
- **Game "Hubungkan Komponen"**: pilih komponen lalu fungsinya; dicek di server (`/api/missions/[slug]/pairs`), kunci tidak dikirim ke browser.
- **Alih bahasa ID/EN** (tombol di header, cookie `sintesa_lang`): antarmuka, materi, soal, dan info komponen. Kamus ada di `src/i18n/en.js` (kunci = teks Indonesia; yang belum ada tampil Indonesia).

## Mengganti model 3D

`public/models/<slug>.glb` dibuat oleh `scripts/models/*.mjs`. Timpa dengan model sendiri; **nama material pada GLB harus
`<IdKomponen>` atau `<IdKomponen>__varian`** (mis. `Monitor`, `Monitor__layar`; bagian sebelum `__` yang dibaca) sesuai `id` komponen di
`src/data/missionContent.js` agar ketukan pada model memunculkan info. Materi, soal, dan teks komponen juga diedit di file tersebut.

## Tes

```bash
npm test            # 50 tes logika + database
npm run build && npm run test:e2e   # 42 tes alur HTTP (daftar → misi → tandai selesai → tugas → revisi → nilai → library)
```
Tes memakai Postgres tertanam; atau isi `TEST_DATABASE_URL` dengan database **kosong khusus tes**.

## Asumsi & keterbatasan jujur

- Dibangun dari 42 screenshot dokumentasi; detail kecil (teks, jarak, isi slide 2–3 carousel) bisa berbeda dari situs asli.
- Model 3D dibuat dengan kode (bentuk sederhana mirip aslinya), bukan hasil modeling profesional.
- Judul tab browser (metadata) masih berbahasa Indonesia; pesan server ber-angka bisa tetap Indonesia.
- Guru melihat arsip pribadi siswa di kelasnya (sesuai dokumentasi: "Pantau arsip mandiri siswa").
- Konten materi/soal ditulis otomatis (tinjau oleh guru sebelum dipakai).
- File lokal (tanpa Blob) hanya bisa dibuka setelah login, tetapi tidak dibatasi per pemilik; dengan Blob, URL bersifat publik-tak-tertebak.
- Pembatas percobaan (login, unggah, AI) disimpan di memori server; di Vercel serverless sifatnya per-instance.
- Belum diuji langsung di Neon/Vercel/Anthropic API asli (diuji dengan Postgres lokal).
