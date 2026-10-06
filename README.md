# SIA-SA FST — Sistem Request Semester Antara Terpusat
### Modul Pengajuan Semester Antara pada Sistem Informasi Akademik
**Fakultas Sains dan Teknologi • UIN Syarif Hidayatullah Jakarta**

[![Platform](https://img.shields.io/badge/Platform-SIA--SA%20FST-003820?style=for-the-badge)](https://github.com/dnnuuyzzo/Sistem-Request-Semester-Antara)
[![Node.js Engine](https://img.shields.io/badge/Node.js-v18%2B%20Express%20REST%20API-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Automated Tests](https://img.shields.io/badge/Automated%20Tests-10%2F10%20PASSED-success?style=for-the-badge&logo=checkmarx)](https://github.com/dnnuuyzzo/Sistem-Request-Semester-Antara)
[![UI Stack](https://img.shields.io/badge/UI%20Stack-TailwindCSS%20%2B%20Modular%20JS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## 📖 Ringkasan Sistem & Latar Belakang

SIA-SA FST adalah sistem perangkat lunak berbasis web terpadu untuk digitalisasi, otomatisasi, dan validasi siklus pengajuan Semester Antara di lingkungan Fakultas Sains dan Teknologi (FST) UIN Syarif Hidayatullah Jakarta.

### Permasalahan yang Dihadapi (Problem Statement):
Sebelum adanya sistem terpusat, pengajuan Semester Antara dikelola secara parsial menggunakan Google Form terpisah dan koordinasi pesan singkat. Hal tersebut menimbulkan kendala:
1. Informasi kuota dan mata kuliah penawaran tidak transparan dan tidak tersinkronisasi.
2. Risiko ketidakabsahan akademik (mahasiswa melanggar batas maksimal 9 SKS atau mengajukan mata kuliah bernilai riwayat A/B yang tidak berhak diulang).
3. Beban administratif Dosen Pembimbing Akademik (DPA) dalam memverifikasi kelayakan riwayat transkrip secara manual.
4. Keterlambatan Program Studi dalam memantau ambang batas minimum pendaftar (**minimal 10 mahasiswa/kelas**) untuk pembukaan kelas dan penugasan dosen pengampu.
5. Keterlambatan penerbitan tagihan Virtual Account (VA) perbankan dan kepastian status pendaftaran mahasiswa.

### Solusi Terpadu: SIA-SA FST
Sistem terintegrasi yang mendigitalkan seluruh siklus 5 tahap Semester Antara:
`Katalog Matkul` ➔ `Pengajuan KRS & Validasi Syarat` ➔ `Review & Approval DPA` ➔ `Monitoring Kuota Prodi` ➔ `Pembayaran VA` ➔ `Terdaftar Resmi & Cetak KRS`.

---

## 👥 Stakeholder & Peran Sistem

| No | Stakeholder | Peran Utama | Kebutuhan yang Diselesaikan |
|:--:|:---|:---|:---|
| **1** | **Mahasiswa** *(Primary User)* | Pemohon & peserta perkuliahan | Katalog resmi, formulir KRS dengan validasi otomatis, live tracking status pengajuan, pembayaran VA perbankan, cetak KRS resmi. |
| **2** | **Dosen Pembimbing Akademik (DPA)** | Verifikator kelayakan akademik | Dasbor periksa transkrip riwayat nilai bimbingan, verifikasi prasyarat, persetujuan resmi (Approve/Reject) dengan catatan arahan belajar. |
| **3** | **Program Studi (Prodi)** | Pengelola operasional penawaran kelas | Monitoring kuota pendaftar secara real-time per mata kuliah (ambang batas min. 10 mhs), penetapan kelas definitif, penugasan dosen pengampu. |
| **4** | **Bagian Keuangan & Bank** | Penerbitan tagihan & rekonsiliasi | Penerbitan tagihan Virtual Account otomatis (Rp 150.000/SKS + Rp 50.000 biaya admin), verifikasi settlement instan, penerbitan invoice resmi. |

---

## 🏗️ Arsitektur Kode Bersih & Modular

Aplikasi dirancang dengan arsitektur **Clean MVC + Service Layer Architecture** yang modular, mudah diuji, dan *zero-external-database-setup* (menggunakan JSON Storage Engine persisten):

```text
Sistem-Request-Semester-Antara/
├── server.js                        # Entry point server HTTP Express (port 3000)
├── package.json                     # Metadata proyek & skrip npm
├── .gitignore                       # Rule pengabaian file log, temporary & zip
├── README.md                        # Dokumentasi komprehensif sistem
├── src/                             # Sumber kode backend
│   ├── app.js                       # Konfigurasi middleware & route Express
│   ├── config/                      # Konfigurasi konstanta & aturan akademik
│   │   ├── academicRules.js         # Batas 9 SKS, nilai C/D/E, kuota min 10 mhs, biaya SKS
│   │   └── index.js                 # Export terpusat konfigurasi
│   ├── database/                    # Engine database & data inisial
│   │   ├── db.js                    # JSON File Storage Engine dengan persistensi otomatis
│   │   └── seedData.json            # Master data matkul, mahasiswa, DPA & transkrip
│   ├── middlewares/                 # Middleware Express
│   │   ├── requestLogger.js         # Logger HTTP request dengan durasi waktu
│   │   └── errorHandler.js          # Global error handling & format respon JSON konsisten
│   ├── services/                    # Business Logic / Aturan Bisnis Akademik
│   │   ├── validationService.js     # Validasi batas SKS, kelayakan nilai lama, bentrok jadwal
│   │   ├── courseService.js         # Filter katalog & kalkulasi kuota kelas
│   │   ├── krsService.js            # Siklus pengajuan KRS & state tracking
│   │   ├── dpaService.js            # Review & approval DPA beserta catatan revisi
│   │   ├── prodiService.js          # Monitoring kuota prodi & pembukaan kelas definitif
│   │   └── paymentService.js        # Kalkulasi tagihan, generate Virtual Account & simulasi bayar
│   ├── controllers/                 # Controller pemroses HTTP request & response
│   │   ├── courseController.js
│   │   ├── krsController.js
│   │   ├── dpaController.js
│   │   ├── prodiController.js
│   │   └── paymentController.js
│   └── routes/                      # Definisi REST API endpoints
│       ├── courseRoutes.js
│       ├── krsRoutes.js
│       ├── dpaRoutes.js
│       ├── prodiRoutes.js
│       └── paymentRoutes.js
├── public/                          # Frontend modular (HTML5, TailwindCSS & Client JS)
│   ├── index.html                   # Single Page Application terpadu
│   ├── css/
│   │   └── styles.css               # Gaya kustom & aturan cetak KRS
│   └── js/
│       └── api.js                   # Client REST API wrapper (fetch HTTP)
├── assets/
│   └── screenshots/                 # Dokumentasi tangkapan layar antarmuka
└── test/
    └── api.test.js                  # Automated integration test suite (10 skenario)
```

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/api/health` | Health check status server backend |
| `GET` | `/api/courses` | Katalog mata kuliah penawaran (support query filter) |
| `GET` | `/api/courses/:code` | Detail mata kuliah beserta silabus dan CPMK |
| `POST` | `/api/krs/validate` | Validasi kelayakan akademik (aturan 9 SKS & nilai C/D/E) |
| `POST` | `/api/krs/submit` | Pengajuan resmi KRS mahasiswa ke DPA |
| `GET` | `/api/krs/status/:nim` | Live status tracking tahapan pendaftaran mahasiswa |
| `GET` | `/api/dpa/pending-requests` | Daftar pengajuan antrean yang menunggu verifikasi DPA |
| `POST` | `/api/dpa/approve` | Persetujuan resmi DPA atas pengajuan KRS |
| `POST` | `/api/dpa/reject` | Pengembalian berkas pengajuan oleh DPA dengan catatan |
| `GET` | `/api/prodi/quota-summary` | Monitoring kuota seluruh kelas penawaran prodi |
| `POST` | `/api/prodi/confirm-classes` | Penetapan pembukaan kelas definitif oleh prodi |
| `GET` | `/api/payments/bill/:nim` | Rincian tagihan faktur dan status Virtual Account |
| `POST` | `/api/payments/simulate-pay` | Simulasi penyelesaian pelunasan VA instan |

---

## 🧪 Pengujian Otomatis (Automated Tests)

Sistem dilengkapi dengan rangkaian pengujian integrasi otomatis tanpa dependensi pihak ketiga. Seluruh aturan akademik diuji secara ketat:

```bash
npm test
```

### Hasil Uji Integrasi (10/10 PASS):
1. `GET /api/health` ➔ Memastikan backend server aktif dan merespon `online`.
2. `GET /api/courses` ➔ Memastikan katalog mengembalikan seluruh daftar mata kuliah penawaran.
3. `GET /api/courses?prodi=Teknik Informatika` ➔ Memastikan filter prodi berfungsi tepat.
4. `POST /api/krs/validate` (Beban 10 SKS) ➔ **Ditolak otomatis** karena melanggar batas maksimal 9 SKS (`MAX_SKS_EXCEEDED`).
5. `POST /api/krs/validate` (Nilai B) ➔ **Ditolak otomatis** karena hanya mata kuliah bernilai C/D/E yang boleh diulang (`INVALID_GRADE_FOR_RETAKE`).
6. `POST /api/krs/submit` ➔ Pengajuan valid diterima dan status beralih ke `MENUNGGU_DPA`.
7. `GET /api/krs/status/:nim` ➔ Memverifikasi data tracking mahasiswa sesuai dengan data pengajuan.
8. `POST /api/dpa/approve` ➔ Persetujuan DPA tercatat dan status melangkah ke `VERIFIKASI_KUOTA`.
9. `POST /api/prodi/confirm-classes` ➔ Prodi menetapkan kelas definitif dan menerbitkan invoice Virtual Account.
10. `POST /api/payments/simulate-pay` ➔ Simulasi bayar VA sukses, tagihan lunas, dan status akhir menjadi `TERDAFTAR_RESMI`.

---

## 🚀 Panduan Menjalankan di Localhost

### Prasyarat
* [Node.js](https://nodejs.org/) versi 18 atau lebih baru.

### Langkah Instalasi & Menjalankan:
1. **Clone Repositori:**
   ```bash
   git clone https://github.com/dnnuuyzzo/Sistem-Request-Semester-Antara.git
   cd Sistem-Request-Semester-Antara
   ```

2. **Jalankan Backend Server:**
   ```bash
   npm start
   ```
   Server akan aktif di:
   ```text
   ==================================================
   SIA-SA FST SERVER BERJALAN DENGAN SUKSES!
   Alamat Lokal : http://localhost:3000
   API Status   : http://localhost:3000/api/health
   Dokumentasi  : http://localhost:3000/api/courses
   ==================================================
   ```

3. **Buka di Browser:**
   Buka peramban (Chrome / Edge / Firefox) dan kunjungi:
   ```text
   http://localhost:3000
   ```

4. **Mode Standalone (Dual-Client Fallback):**
   Aplikasi juga mendukung mode statis tanpa server (misal melalui *Live Server* atau GitHub Pages), di mana antarmuka secara cerdas melakukan fallback ke reaktif *in-memory / localStorage* jika backend tidak terhubung.

---

## ⚖️ Lisensi

Sistem Informasi Akademik Semester Antara (SIA-SA FST)  
Fakultas Sains dan Teknologi • UIN Syarif Hidayatullah Jakarta.  
Hak Cipta © 2026. Lisensi MIT.
