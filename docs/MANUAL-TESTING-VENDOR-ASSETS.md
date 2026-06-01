# Manual Testing Vendor Services and Portfolio

## Tujuan

Memverifikasi bahwa vendor yang sudah `approved` dapat mengelola modul:

- `Services`
- `Portfolio`

dengan alur CRUD yang lengkap, aman, dan konsisten dengan backend.

## Prasyarat

1. Jalankan Vendor App:

```bash
cd apps/vendor
npm run dev
```

2. Pastikan ada akun vendor dengan status `approved`.

3. Login sebagai vendor tersebut.

## Skenario 1: Services Page Load

1. Buka `/services`.

Ekspektasi:

- halaman tampil normal
- ringkasan metrik layanan tampil
- form tambah/edit layanan tampil
- daftar layanan tampil

## Skenario 2: Tambah Service

1. Isi:
   - nama layanan
   - harga
   - deskripsi
2. Klik `Tambah Layanan`.

Ekspektasi:

- service baru masuk ke daftar
- toast sukses tampil
- metrik total layanan ter-update

## Skenario 3: Edit Service

1. Klik `Edit` pada salah satu layanan.
2. Ubah nama, harga, deskripsi, atau status aktif.
3. Klik `Simpan Perubahan`.

Ekspektasi:

- data layanan berubah di daftar
- toast sukses tampil
- waktu update berubah

## Skenario 4: Hapus Service

1. Klik `Hapus` pada salah satu layanan.

Ekspektasi:

- layanan hilang dari daftar
- toast sukses tampil
- metrik total layanan berkurang

## Skenario 5: Search dan Filter Service

1. Isi kolom pencarian layanan.
2. Ubah filter ke:
   - `Semua Status`
   - `Aktif`
   - `Nonaktif`

Ekspektasi:

- daftar layanan menyesuaikan pencarian
- filter status bekerja benar
- empty state tampil jika tidak ada hasil

## Skenario 6: Portfolio Page Load

1. Buka `/portfolio`.

Ekspektasi:

- halaman tampil normal
- metrik total/image/video tampil
- form tambah/edit portfolio tampil
- preview ringkas tampil saat media URL diisi

## Skenario 7: Tambah Portfolio

1. Isi:
   - judul
   - media type
   - media URL
   - deskripsi
2. Klik `Tambah Portfolio`.

Ekspektasi:

- item portfolio baru masuk ke grid
- toast sukses tampil
- metrik portfolio ter-update

## Skenario 8: Edit Portfolio

1. Klik `Edit` pada salah satu item portfolio.
2. Ubah judul, media type, media URL, atau deskripsi.
3. Klik `Simpan Perubahan`.

Ekspektasi:

- item portfolio berubah di grid
- preview baru tampil sesuai data terbaru
- toast sukses tampil

## Skenario 9: Hapus Portfolio

1. Klik `Hapus` pada salah satu item portfolio.

Ekspektasi:

- item hilang dari grid
- toast sukses tampil
- metrik portfolio berkurang

## Skenario 10: Search dan Filter Portfolio

1. Isi kolom pencarian portfolio.
2. Ubah filter media ke:
   - `Semua Media`
   - `IMAGE`
   - `VIDEO`

Ekspektasi:

- grid portfolio menyesuaikan pencarian
- filter media bekerja benar
- empty state tampil jika tidak ada hasil

## Skenario 11: Access Rule

1. Login sebagai vendor `approved`.
2. Akses `/services` dan `/portfolio`.

Ekspektasi:

- dua halaman dapat diakses normal
- vendor bisa melakukan CRUD penuh

## Skenario 12: API Contract

Periksa endpoint berikut:

- `GET /api/vendor/services`
- `POST /api/vendor/services`
- `PATCH /api/vendor/services/:id`
- `DELETE /api/vendor/services/:id`
- `GET /api/vendor/portfolio`
- `POST /api/vendor/portfolio`
- `PATCH /api/vendor/portfolio/:id`
- `DELETE /api/vendor/portfolio/:id`

Ekspektasi:

- response mengikuti format:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```
