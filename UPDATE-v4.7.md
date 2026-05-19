# SIPEKAN Update v4.7

## Fix: Header tab error saat login & tidak login

### Masalah sebelumnya:
- Saat login: Tab "Display Antrian" tidak ada di header
- Saat di halaman petugas: Tidak ada tab yang aktif/highlight di header
- Tombol officer hanya ke petugas-dashboard, tidak ada opsi lain
- Tidak ada tombol logout yang jelas

### Perbaikan:

1. **src/components/sipekan/Header.tsx** ← PERUBAHAN UTAMA
   - 2 set navigasi:
     * Belum login: Beranda, Ambil Antrian, Pendaftaran, Informasi, Cek Antrian + "Login Petugas"
     * Sudah login: Beranda, Ambil Antrian, Pendaftaran, Informasi, Cek Antrian, **Display Antrian** + nama officer + tombol Logout
   - Tab "Display Antrian" muncul di header SETELAH login
   - Klik "Display Antrian" saat belum login → otomatis ke halaman Login
   - Tombol Logout terpisah (ikon merah) di samping nama officer
   - Mobile menu juga diperbaiki dengan logout terpisah

2. **src/components/sipekan/DashboardPage.tsx**
   - Panel Petugas kuning muncul di dashboard setelah login
   - 3 tombol: Display Antrian, Pendaftaran, Rekapitulasi

3. **src/components/sipekan/PetugasDashboardPage.tsx**
   - 3 tab besar di panel petugas
   - Background gelap agar terlihat

4. **src/app/page.tsx**
   - Background gelap untuk halaman petugas
   - Auth guard untuk display-antrian

5. **src/components/sipekan/DisplayAntrianPage.tsx**
   - Tombol X kembali ke Panel Petugas
   - Fix suara video

### Cara update:
```powershell
Copy-Item -Path src\* -Destination H:\WebApp\sipekan-vercel\src\ -Recurse -Force
npx prisma db push --accept-data-loss
npx next build
```
