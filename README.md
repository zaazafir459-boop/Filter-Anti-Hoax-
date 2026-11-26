# VeriSMA — Pusat Cek Fakta & Edukasi Anti-Hoaks Siswa SMA

Website responsif bertema literasi digital dan anti-hoaks untuk siswa SMA dengan latar belakang hitam pekat (`#121212`), aksen gradasi pink cerah (`#FF2E93`) dan oranye cerah (`#FF7A00`), ornamen bunga SVG melayang, animasi interaktif, serta integrasi pelaporan ke Google Sheets.

## Daftar Berkas

- `index.html` — Struktur halaman lengkap (Informasi Awal, Simulasi Cek Hoaks, Materi Edukasi & Kuis, Tautan Cek Fakta Nyata, Formulir Lapor Hoaks, dan Modal Login Simulasi).
- `style.css` — Desain responsif gelap (`#121212`), gradasi pink-oranye, ornamen SVG melayang, efek *hover glow*, dan transisi tab mulus.
- `script.js` — Logika login `localStorage` + tombol data contoh siswa, simulasi analisis teks `[SIMULASI PROTOTIPE AI]`, kuis interaktif 5 soal, dan `fetch` POST ke Google Apps Script.
- `README.md` — Dokumentasi proyek dan panduan pemasangan.

## Cara Menjalankan di Komputer atau GitHub Pages

1. Simpan keempat berkas (`index.html`, `style.css`, `script.js`, dan `README.md`) di dalam satu folder yang sama.
2. Untuk melihat langsung di komputer, klik dua kali `index.html` agar terbuka di browser.
3. Untuk mengunggah ke GitHub Pages, unggah semua berkas tersebut langsung ke root repository GitHub Anda, lalu aktifkan **Settings > Pages > Branch: main**.

## Cara Menghubungkan Formulir Lapor ke Google Sheets

1. Buat Google Spreadsheet baru di Google Drive.
2. Buka menu **Ekstensi (Extensions) > Apps Script**, hapus kode bawaan, lalu tempel kode `doPost(e)` Google Apps Script Anda dan simpan.
3. Klik **Terapkan (Deploy) > Deployment baru (New deployment) > Aplikasi web (Web app)**.
4. Pilih **Jalankan sebagai: Saya (Me)** dan **Yang memiliki akses: Siapa saja (Anyone)**, lalu klik **Terapkan**.
5. Salin URL Web App yang diberikan dan ganti `"URL_APPS_SCRIPT_ANDA"` pada baris awal `script.js`.
