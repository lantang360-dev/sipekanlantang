# 🚀 SIPEKAN - Panduan Deploy ke Vercel

## Sistem Informasi Pelayanan Besukan Lapas Kelas IIA Bontang

---

## ⚠️ Hal Penting Sebelum Deploy

SIPEKAN menggunakan **PostgreSQL** sebagai database (bukan SQLite), karena Vercel adalah platform serverless yang tidak mendukung file-based database. Anda perlu menyediakan database PostgreSQL terlebih dahulu.

**Rekomendasi database gratis:**
- [Neon](https://neon.tech) — PostgreSQL serverless, gratis 0.5 GB (REKOMENDASI)
- [Supabase](https://supabase.com) — PostgreSQL gratis 500 MB
- [Vercel Postgres](https://vercel.com/storage/postgres) — Integrasi langsung dengan Vercel

---

## 📋 Langkah-langkah Deploy

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
# Ekstrak sipekan-v3.zip ke folder sipekan
unzip sipekan-v3.zip
cd sipekan

# Inisialisasi Git
git init
git add .
git commit -m "Initial commit: SIPEKAN v1.0.0"

# Tambahkan remote GitHub (ganti URL dengan repo Anda)
git remote add origin https://github.com/USERNAME/sipekan.git
git branch -M main
git push -u origin main
```

### LANGKAH 3: Deploy ke Vercel

1. Buka **https://vercel.com** → Sign up / Login (bisa pakai GitHub)
2. Klik **"Add New"** → **"Project"**
3. Pilih repository **"sipekan"** dari daftar GitHub
4. **Framework Preset**: Next.js (otomatis terdeteksi)
5. **Build & Development Settings**:
   - **Build Command**: Biarkan default (Vercel akan otomatis menjalankan `npm run vercel-build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
6. **Environment Variables** — Tambahkan:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-XXXX.neon.tech/neondb?sslmode=require` |
   | `SEED_SECRET` | `ganti-dengan-secret-kuat-anda` |

7. Klik **"Deploy"** 🎉
8. Tunggu proses build selesai (biasanya 2-3 menit)

> **Catatan penting**: Jangan gunakan `prisma migrate deploy` di build command.
> Gunakan `prisma db push` karena lebih kompatibel dengan Neon PostgreSQL
> dan menghindari error `migration_lock.toml`.
> Script `vercel-build` di package.json sudah dikonfigurasi: `prisma db push --accept-data-loss && next build`

### LANGKAH 4: Seed Database

Setelah deploy berhasil, buka terminal dan jalankan:

```bash
# Ganti dengan URL Vercel Anda dan SEED_SECRET yang sudah ditentukan
curl "https://NAMA-PROJECT.vercel.app/api/seed?secret=ganti-dengan-secret-kuat-anda"
```

Jika berhasil, akan muncul response:
```json
{"success":true,"officers":3,"services":3,"note":"Passwords are hashed with bcrypt"}
```

### LANGKAH 5: Ganti Password Default!

⚠️ **SANGAT PENTING**: Setelah deploy, segera ganti password default!

| Username | Password Default | Role |
|----------|-----------------|------|
| admin | admin123 | admin |
| petugas1 | petugas123 | petugas |
| petugas2 | petugas123 | petugas |

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
2. Jalankan `prisma db push` (sync schema ke database)
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

### Build gagal: "Added required column without default value"
```
Error: Added the required column `updatedAt` to the `MediaItem` table without a default value.
```
**Solusi**: Pastikan semua kolom `updatedAt` di schema.prisma memiliki `@default(now())`:
```prisma
updatedAt DateTime @default(now()) @updatedAt
```
Versi terbaru (sipekan-v3) sudah memperbaiki masalah ini.

### Build gagal: "P1001: Can't reach database server"
- Periksa DATABASE_URL di Vercel → Settings → Environment Variables
- Pastikan format: `postgresql://user:pass@host/db?sslmode=require`
- Pastikan database Neon tidak suspended (Neon auto-suspend setelah 5 menit tidak aktif)

### Build gagal: "P3019 migration_lock.toml"
**Solusi**: Gunakan `prisma db push` BUKAN `prisma migrate deploy`.
Script `vercel-build` sudah menggunakan `prisma db push`.

### Build gagal: "Command npm run build exited with 1"
Pastikan:
1. `next.config.ts` TIDAK ada `output: "standalone"`
2. `prisma` ada di `devDependencies`, BUKAN `dependencies`
3. Ada script `postinstall: "prisma generate"` di package.json
4. Ada script `vercel-build` di package.json

### Runtime error: "PrismaClient is not configured for this runtime"
- Pastikan `prisma generate` dijalankan saat build
- Pastikan ada `postinstall` script di package.json

### Data hilang setelah deploy
- Neon free tier akan suspend database setelah tidak aktif
- Data TIDAK hilang, database hanya "tidur"
- Akses pertama setelah suspend akan sedikit lambat (cold start ~1 detik)

---

## 📁 Struktur File untuk Vercel

```
sipekan/
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema (provider = "postgresql")
│   └── seed.ts              # Seed script (TypeScript)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/             # Backend API routes
│   ├── components/
│   │   ├── sipekan/         # App components
│   │   └── ui/              # UI components
│   ├── hooks/
│   ├── lib/
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts
│   └── store/
│       └── sipekan-store.ts
├── public/
├── .env.example
├── package.json             # Vercel-ready config
├── next.config.ts           # Without standalone output
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.mjs
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
