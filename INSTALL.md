# SIPEKAN v4.8 - Panduan Instalasi

## Sistem Antrian Lapas Kelas IIA Bontang (Kemenkumham)

---

## Persyaratan Sistem

- **Node.js** v18+ atau **Bun** v1+
- **PostgreSQL** database (Neon, Supabase, atau lokal)
- **Git** (opsional)

---

## Cara Instalasi dengan CMD/Terminal

### Langkah 1: Ekstrak File ZIP

```bash
# Windows (PowerShell/CMD)
Expand-Archive sipekan-v4.8.zip -DestinationPath sipekan-v4.8
cd sipekan-v4.8

# Linux/Mac
unzip sipekan-v4.8.zip
cd sipekan-v4.8
```

### Langkah 2: Install Dependencies

```bash
# Menggunakan Bun (direkomendasikan)
bun install

# atau menggunakan npm
npm install

# atau menggunakan pnpm
pnpm install
```

### Langkah 3: Konfigurasi Environment

Buat file `.env` di root folder:

```bash
# Buat file .env
touch .env
```

Isi file `.env` dengan konfigurasi berikut:

```env
# Database - PostgreSQL (Neon / Supabase / Lokal)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Contoh Neon:
# DATABASE_URL="postgresql://neondb_owner:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Langkah 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Jalankan seed untuk data awal (user admin, layanan, loket)
npx prisma db seed
```

### Langkah 5: Jalankan Aplikasi

```bash
# Mode Development
bun run dev
# atau
npm run dev

# Mode Production
bun run build
bun start
# atau
npm run build
npm start
```

Aplikasi akan berjalan di **http://localhost:3000**

---

## Login Petugas

| Field  | Nilai      |
|--------|-----------|
| NIP    | admin     |
| Password | admin123 |

---

## Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Import repository dari GitHub
4. Tambahkan environment variable `DATABASE_URL`
5. Klik **Deploy**

File `vercel.json` sudah tersedia untuk konfigurasi build.

---

## Deploy ke Server (VPS/Dedicated)

### Menggunakan PM2

```bash
# Install PM2
npm install -g pm2

# Build project
npm run build

# Jalankan dengan PM2
pm2 start npm --name "sipekan" -- start

# Auto restart saat reboot
pm2 startup
pm2 save
```

### Menggunakan Docker

```bash
# Build image
docker build -t sipekan-v4.8 .

# Jalankan container
docker run -d -p 3000:3000 --env-file .env --name sipekan sipekan-v4.8
```

---

## Fitur SIPEKAN v4.8

- Dashboard Antrian real-time
- Pendaftaran pengunjung dengan upload foto KTP/Identitas
- Display Antrian dengan video & suara panggilan
- Panel Petugas (panggil, proses, selesaikan antrian)
- Rekapitulasi & Statistik
- Manajemen Layanan & Loket
- Autentikasi Petugas
- Responsive design (mobile & desktop)
- Tema Oxford Blue dengan glassmorphism

---

## Changelog v4.8

- Perbaikan Header tab (login & non-login state)
- Update persyaratan dokumen: "KTP/Identitas Lainnya Asli"
- Sinkronisasi foto verifikasi pendaftaran
- Perbaikan visibilitas dark background
- Perbaikan akses Display Antrian
- Cross-origin fix untuk preview panel
- Stabilitas dev server

---

## ⚠️ PENTING: SQLite vs PostgreSQL

SIPEKAN v4.8 menggunakan **PostgreSQL** sebagai database.

**Jika Anda mendapat error:**
```
Error: the URL must start with the protocol `file:`.
```
**Artinya:** Prisma schema masih menggunakan `provider = "sqlite"` tapi `.env` Anda berisi URL PostgreSQL.

**Solusi:** Pastikan `prisma/schema.prisma` menggunakan PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"   // ← BUKAN "sqlite"
  url      = env("DATABASE_URL")
}
```

Dan pastikan `.env` menggunakan URL PostgreSQL:
```env
# ✅ BENAR - PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# ❌ SALAH - SQLite (tidak didukung di v4.8)
# DATABASE_URL="file:./dev.db"
```

---

## Troubleshooting

### Error: the URL must start with the protocol `file:`
- **Penyebab:** Schema Prisma masih `sqlite` tapi `.env` berisi URL `postgresql://`
- **Solusi:** Ubah `provider = "sqlite"` menjadi `provider = "postgresql"` di `prisma/schema.prisma`

### Error: P1012 - Schema validation
- Pastikan `DATABASE_URL` di `.env` dimulai dengan `postgresql://`
- Pastikan `provider` di schema adalah `"postgresql"`

### Error: Database connection failed
- Pastikan `DATABASE_URL` benar di file `.env`
- Pastikan database PostgreSQL aktif
- Untuk Neon: pastikan IP tidak diblokir

### Error: Prisma Client not found
```bash
npx prisma generate
```

### Error: Port 3000 sudah digunakan
```bash
# Ganti port
PORT=3001 npm run dev
```

### Reset Database
```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

© 2025 Lapas Kelas IIA Bontang - Kemenkumham
