# SIPEKAN Update v4.4

## Perubahan: Tab Display Antrian di Panel Petugas

### File yang berubah (4 file):

1. **src/components/sipekan/PetugasDashboardPage.tsx** ← PERUBAHAN UTAMA
   - Ditambahkan tab navigasi besar: "Pendaftaran", "Display Antrian", "Rekapitulasi"
   - Klik tab "Display Antrian" → otomatis buka halaman display layar penuh
   - Tombol Display kecil di header dihapus, diganti tab yang jelas

2. **src/components/sipekan/Header.tsx**
   - Menu "Display Antrian" dihapus dari navigasi publik (hanya bisa diakses via login petugas)

3. **src/app/page.tsx**
   - Auth guard: Display Antrian hanya bisa diakses jika sudah login petugas

4. **src/components/sipekan/DisplayAntrianPage.tsx**
   - Tombol X kembali ke Panel Petugas (bukan Dashboard publik)
   - Fix suara video (YouTube postMessage API, sound enable overlay)

### Cara update:

```powershell
# Salin file dari zip ke proyek Vercel:
Copy-Item -Path src\* -Destination H:\WebApp\sipekan-vercel\src\ -Recurse -Force

# Deploy:
npx prisma db push --accept-data-loss
npx next build
```

### Alur baru:
1. Login Petugas → Muncul Panel Petugas dengan 3 TAB besar
2. Tab "Pendaftaran" → Kelola pendaftaran besukan
3. Tab "Display Antrian" → Buka layar display antrian (full screen)
4. Tab "Rekapitulasi" → Buka halaman rekap data
