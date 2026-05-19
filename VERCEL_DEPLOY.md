# 🚀 SIPEKAN v4.1 - Panduan Deploy ke Vercel

## Sistem Informasi Pelayanan Besukan Lapas Kelas IIA Bontang

---

## ⚠️ Hal Penting Sebelum Deploy

SIPEKAN v4.1 menggunakan **PostgreSQL** sebagai database (bukan SQLite), karena Vercel adalah platform serverless yang tidak mendukung file-based database. Anda perlu menyediakan database PostgreSQL terlebih dahulu.

**Rekomendasi database gratis:**
- [Neon](https://neon.tech) — PostgreSQL serverless, gratis 0.5 GB (REKOMENDASI)
- [Supabase](https://supabase.com) — PostgreSQL gratis 500 MB
- [Vercel Postgres](https://vercel.com/storage/postgres) — Integrasi langsung dengan Vercel

---

## 📋 Langkah-langkah Deploy Baru

### LANGKAH 1: Buat Database PostgreSQL di Neon

1. Buka **https://neon.tech** → Sign up / Login
2. Klik **"Create Project"**
3. Isi:
   - **Project name**: `sipekan-db`
   - **Region**: Pilih terdekat (Singapore / Tokyo)
4. Klik **"Create Project"**
5. Setelah database dibuat, **copy Connection String** yang muncul, formatnya:
   ```
   postgresql://neondb_owner:AbCdEfGh@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **SIMPAN connection string ini** — akan digunakan di Langkah 3 dan 4

### LANGKAH 2: Push Kode ke GitHub

#### Opsi A: Buat Repository Baru di GitHub

1. Buka **https://github.com/new**
2. Isi:
   - **Repository name**: `sipekan`
   - **Visibility**: Private (rekomendasi, karena ada kode sensitif)
3. Klik **"Create repository"**

#### Upload kode dari komputer Anda:

```bash
# Ekstrak atau copy sipekan-v4 ke folder sipekan
cd sipekan-v4

# Inisialisasi Git
git init
git add .
git commit -m "Initial commit: SIPEKAN v4.1.0"

# Tambahkan remote GitHub (ganti URL dengan repo Anda)
git remote add origin https://github.com/USERNAME/sipekan.git
git branch -M main
git push -u origin main
```

### LANGKAH 3: Setup Database & Migrasi

Di komputer lokal Anda, jalankan:

```bash
# Install dependencies
npm install

# Set DATABASE_URL ke Neon (ganti dengan connection string Anda)
export DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-XXXX.neon.tech/neondb?sslmode=require"

# Generate Prisma Client
npx prisma generate

# Jalankan migrasi ke database Neon
npx prisma migrate deploy

# Seed data awal (admin, petugas, layanan, 3 loket, settings)
npx tsx prisma/seed.ts
```

Atau jika seed lokal tidak bekerja, gunakan API seed setelah deploy:
```bash
# Setelah deploy ke Vercel, panggil endpoint seed
curl "https://NAMA-PROJECT.vercel.app/api/seed?secret=sipekan-seed-2024"
```

### LANGKAH 4: Deploy ke Vercel

1. Buka **https://vercel.com** → Sign up / Login (bisa pakai GitHub)
2. Klik **"Add New"** → **"Project"**
3. Pilih repository **"sipekan"** dari daftar GitHub
4. **Framework Preset**: Next.js (otomatis terdeteksi)
5. **Build & Development Settings**:
   - **Build Command**: `prisma generate && prisma migrate deploy && next build` (sudah di package.json sebagai `vercel-build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
6. **Environment Variables** — Tambahkan:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-XXXX.neon.tech/neondb?sslmode=require` |
   | `SEED_SECRET` | `ganti-dengan-secret-kuat-anda` |

7. Klik **"Deploy"** 🎉
8. Tunggu proses build selesai (biasanya 2-3 menit)

### LANGKAH 5: Seed Database

Setelah deploy berhasil, buka terminal dan jalankan:

```bash
# Ganti dengan URL Vercel Anda dan SEED_SECRET yang sudah ditentukan
curl "https://NAMA-PROJECT.vercel.app/api/seed?secret=ganti-dengan-secret-kuat-anda"
```

Jika berhasil, akan muncul response:
```json
{"success":true,"officers":3,"services":3,"note":"Passwords are hashed with bcrypt"}
```

### LANGKAH 6: Ganti Password Default!

⚠️ **SANGAT PENTING**: Setelah deploy, segera ganti password default!

| Username | Password Default | Role |
|----------|-----------------|------|
| admin | admin123 | admin |
| petugas1 | petugas123 | petugas |
| petugas2 | petugas123 | petugas |

---

## 🔄 Cara Update dari Versi Sebelumnya (v1/v2/v3 → v4.1)

### Jika sudah deploy versi sebelumnya di Vercel:

#### Opsi 1: Update via Git (REKOMENDASI)

```bash
# 1. Download dan ekstrak sipekan-v4-vercel.zip
unzip sipekan-v4-vercel.zip -d sipekan-v4

# 2. Masuk ke folder project yang sudah ada
cd /path/to/sipekan-lama

# 3. Hapus file lama (kecuali .git, .env, node_modules)
# HATI-HATI: backup dulu jika ada perubahan custom!
rm -rf src/ prisma/ public/ package.json next.config.ts tailwind.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs components.json

# 4. Copy semua file v4.1
cp -r /path/to/sipekan-v4/* .
cp /path/to/sipekan-v4/.env.example .
cp /path/to/sipekan-v4/.gitignore .

# 5. Update .env jika ada variable baru
# Tidak ada variable baru di v4.1, DATABASE_URL dan SEED_SECRET tetap sama

# 6. Push ke GitHub — Vercel akan auto-deploy
git add .
git commit -m "Update to SIPEKAN v4.1.0"
git push origin main
```

#### Opsi 2: Deploy Baru (Clean Install)

Jika ingin mulai bersih tanpa data lama:

1. Buka Vercel Dashboard → **Delete** project lama
2. Buat database Neon baru (atau reset yang lama via Neon Dashboard)
3. Ikuti **LANGKAH 1-6** di atas dari awal

### ⚠️ Hal Penting Saat Update:

1. **Database Migration**: Jika versi lama tidak punya tabel `MediaItem`, migrasi otomatis akan menambahkannya saat `prisma migrate deploy` dijalankan saat build Vercel.

2. **Format Antrian**: Antrian lama (B-0001) tetap berfungsi. Antrian baru akan pakai format 3 digit (B-001).

3. **Counter/Loket**: Jika sebelumnya ada 4 loket, hapus loket ke-4 via API:
   ```bash
   # Hapus loket ke-4 (ganti ID dengan ID loket yang mau dihapus)
   curl -X DELETE https://NAMA-PROJECT.vercel.app/api/counters \
     -H "Content-Type: application/json" \
     -d '{"id": "ID-LOKET-4"}'
   ```

4. **Reseed (Opsional)**: Jika ingin reset data awal:
   ```bash
   curl "https://NAMA-PROJECT.vercel.app/api/seed?secret=ganti-dengan-secret-kuat-anda"
   ```
   ⚠️ Reseed akan menambahkan officer/service/setting jika belum ada, tapi TIDAK menghapus data yang sudah ada (kecuali password officer akan di-update).

---

## 🔧 Konfigurasi Lanjutan

### Custom Domain

1. Di Vercel Dashboard → **Settings** → **Domains**
2. Tambahkan domain: `sipekan.example.com`
3. Setup DNS di provider domain Anda:
   ```
   CNAME  sipekan  cname.vercel-dns.com
   ```
4. Tunggu propagasi DNS (5-30 menit)
5. Vercel otomatis setup SSL/HTTPS

### Auto-Deploy

Setiap kali Anda `git push` ke branch `main`, Vercel akan otomatis:
1. Build ulang aplikasi
2. Jalankan `prisma migrate deploy` (migrasi database baru jika ada)
3. Deploy ke production

---

## 🔒 Keamanan

### Environment Variables di Vercel
- **DATABASE_URL**: Jangan pernah share atau commit ke Git
- **SEED_SECRET**: Ganti dari default `sipekan-seed-2024` ke secret yang kuat

### Seed Endpoint Protection
Endpoint `/api/seed` dilindungi oleh `SEED_SECRET`:
```bash
# Akses ditolak tanpa secret
curl https://your-app.vercel.app/api/seed
# → {"error":"Unauthorized. Provide x-seed-secret header or ?secret= query param."}

# Akses diterima dengan secret yang benar
curl "https://your-app.vercel.app/api/seed?secret=your-strong-secret"
# → {"success":true,...}
```

---

## ❓ Troubleshooting

### Build gagal: "Prisma Client could not be generated"
```bash
# Pastikan schema valid
npx prisma validate
# Pastikan DATABASE_URL benar di Vercel Environment Variables
```

### Build gagal: "P1001: Can't reach database server"
- Periksa DATABASE_URL di Vercel → Settings → Environment Variables
- Pastikan format: `postgresql://user:pass@host/db?sslmode=require`
- Pastikan database Neon tidak suspended (Neon auto-suspend setelah 5 menit tidak aktif)

### Runtime error: "PrismaClient is not configured for this runtime"
- Pastikan `prisma generate` dijalankan saat build
- Check build command di Vercel: `prisma generate && prisma migrate deploy && next build`

### Data hilang setelah deploy
- Neon free tier akan suspend database setelah tidak aktif
- Data TIDAK hilang, database hanya "tidur"
- Akses pertama setelah suspend akan sedikit lambat (cold start ~1 detik)

### Migrasi database gagal
```bash
# Cek status migrasi
npx prisma migrate status

# Reset dan ulang (HATI-HATI: hapus semua data!)
npx prisma migrate reset

# Deploy ulang migrasi
npx prisma migrate deploy
```

### Suara panggilan tidak berbunyi di Display Antrian
- Browser memblokir autoplay audio tanpa interaksi user
- **Solusi**: Klik tombol 🔊 (Volume) atau tombol apapun di halaman display terlebih dahulu
- Setelah ada interaksi user, suara akan otomatis berbunyi saat ada panggilan
- **Chime bel** akan berbunyi sebelum pengumuman suara
- Pastikan volume perangkat tidak di-mute

---

## 📁 Struktur File untuk Vercel

```
sipekan-v4/
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema (dengan MediaItem model)
│   ├── seed.ts              # Seed script (3 loket, bcrypt hashing)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 0001_init/
│           └── migration.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/             # Backend API routes
│   │       ├── route.ts
│   │       ├── auth/        # Login petugas
│   │       ├── counters/    # Loket management + panggilan
│   │       │   └── [id]/    # PATCH: call_next, recall, call_manual
│   │       ├── display/     # Display antrian data
│   │       ├── media/       # Video informasi CRUD
│   │       ├── queues/      # Antrian management
│   │       │   └── [id]/    # Queue detail/update
│   │       ├── registrations/ # Pendaftaran online
│   │       │   └── [id]/    # Registration verify/create queue
│   │       ├── seed/        # Database seeding
│   │       ├── services/    # Layanan CRUD
│   │       ├── settings/    # Pengaturan sistem
│   │       └── stats/       # Statistik dashboard
│   ├── components/
│   │   ├── sipekan/         # App components
│   │   │   ├── DashboardPage.tsx       # Beranda (4 kartu glassmorphism)
│   │   │   ├── DisplayAntrianPage.tsx  # Monitor antrian (3 loket + suara)
│   │   │   ├── AntrianPage.tsx         # Ambil antrian
│   │   │   ├── StatusAntrianPage.tsx   # Cek status antrian
│   │   │   ├── PendaftaranPage.tsx     # Daftar online
│   │   │   ├── Header.tsx              # Header (#0a1530)
│   │   │   ├── Footer.tsx              # Footer (#0a1530)
│   │   │   └── ...
│   │   └── ui/              # UI components (shadcn/ui)
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── db.ts            # Prisma client (serverless optimized)
│   │   └── utils.ts
│   └── store/
│       └── sipekan-store.ts # Zustand state management
├── public/
│   ├── logo.svg
│   ├── lapas-building.png
│   └── robots.txt
├── .env.example
├── .gitignore
├── package.json             # Vercel-ready config (v4.1.0)
├── next.config.ts           # Without standalone output
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json
└── VERCEL_DEPLOY.md
```

---

## 💰 Estimasi Biaya

| Layanan | Free Tier | Catatan |
|---------|-----------|---------|
| Vercel | 100 GB bandwidth/bulan | Cukup untuk traffic rendah |
| Neon PostgreSQL | 0.5 GB storage | Cukup untuk ribuan antrian |
| **Total** | **Rp 0/bulan** | 🎉 |

---

## 📞 Bantuan

Jika mengalami masalah:
1. Cek Vercel Dashboard → **Deployments** → klik deployment yang gagal → lihat **Build Logs**
2. Cek Neon Dashboard → pastikan database aktif
3. Pastikan semua Environment Variables sudah benar

---

## 🆕 Changelog v4.1

Perubahan dari v4.0 ke v4.1:

### Perbaikan Panggilan Antrian
- **Fix: call_next sekarang memanggil antrian dari layanan mana pun** — Sebelumnya hanya memanggil antrian yang cocok dengan layanan loket, sekarang fallback ke antrian menunggu dari layanan lain
- **Fix: recall berfungsi meskipun status antrian bukan "dipanggil"** — Mencari berdasarkan currentNum counter
- **Fix: call_manual dengan pencarian fleksibel** — Bisa ketik "B-001" atau "B1" dan tetap ketemu

### Perbaikan Suara Panggilan
- **Chime bel (ding-ding-ding)** menggunakan Web Audio API sebelum pengumuman
- **Pengumuman langsung** dari response API (tidak menunggu polling 3 detik)
- **Spelling angka antrian**: "B-001" dibaca sebagai "B nol nol satu"
- **Inisialisasi speech synthesis** pada klik pertama user (mengatasi blokir browser)

### Perbaikan Visual & UX
- **Tombol panggilan selalu terlihat** tanpa perlu login petugas
- **Pengaturan video selalu terlihat** tanpa perlu login petugas
- **Toast notification** saat memanggil antrian (loading → sukses/error)
- **Feedback visual** saat tombol diklik (active:scale-95)
- **Sound toggle** lebih jelas (highlight saat aktif)

### Format Nomor Antrian
- **3 digit** (B-001, P-012, A-003) — sebelumnya 4 digit (B-0001)
- Antrian lama 4 digit tetap kompatibel dan berfungsi normal

---

## 🆕 Changelog v4.0

Perubahan utama dari versi sebelumnya:

### Visual & Branding
- **Warna dasar Oxford Blue (#0f1d3e)** — Tampilan profesional dan konsisten
- **Header & Footer warna #0a1530** — Nuansa gelap yang elegan
- **Glassmorphism cards di Dashboard** — Efek kaca transparan modern pada kartu statistik

### Display Antrian (Monitor Loket)
- **3 loket** ditampilkan secara simultan di layar monitor
- **Tombol panggilan langsung** di setiap loket:
  - **Berikutnya** → Memanggil antrian berikutnya yang menunggu
  - **Ulangi** → Memanggil ulang nomor antrian yang sama
  - **Manual** → Memasukkan nomor antrian secara manual
- **Suara panggilan**:
  - Chime bel (bell sound) sebelum pengumuman
  - Text-to-Speech (TTS) bahasa Indonesia untuk membacakan nomor antrian

### Pengaturan Video Informasi
- **YouTube** — Embed video YouTube langsung di display
- **Google Drive** — Putar video dari Google Drive
- **URL langsung** — Masukkan URL video apapun
- Kelola daftar video dari halaman pengaturan petugas

### Arsitektur & Database
- **PostgreSQL** via Neon (serverless, cocok untuk Vercel)
- **Prisma ORM** dengan migrasi otomatis saat build
- **bcrypt** password hashing untuk keamanan
- **Seed endpoint** dilindungi SEED_SECRET
