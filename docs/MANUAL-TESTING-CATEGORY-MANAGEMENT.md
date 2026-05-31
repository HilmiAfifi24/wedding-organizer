# Manual Testing Category Management

## Tujuan

Memastikan admin dapat mengelola kategori vendor dan data kategori tersebut langsung dipakai oleh Vendor App saat registrasi dan onboarding.

## Prasyarat

1. Jalankan seed terbaru agar menu `Manajemen Kategori` masuk ke access menu Super Admin:

```bash
cd packages/database
npx prisma db seed
```

2. Jalankan Admin App dan Vendor App.

3. Login admin dengan:

- Email: `superadmin@wedding-organizer.local`
- Password: `admin123`

## Skenario 1: Menu Kategori Muncul di Sidebar

1. Login ke Admin App.
2. Periksa sidebar.

Ekspektasi:

- muncul menu `Manajemen Kategori`
- route `/categories` bisa diakses

## Skenario 2: Tambah Kategori

1. Buka `/categories`.
2. Isi nama kategori, misalnya `Photography`.
3. Klik `Tambah Kategori`.

Ekspektasi:

- kategori baru masuk ke tabel
- toast sukses muncul
- data tersimpan di tabel `Category`

## Skenario 3: Validasi Nama Duplikat

1. Tambahkan kategori dengan nama yang sama.

Ekspektasi:

- request ditolak
- muncul pesan `Category name already exists`

## Skenario 4: Edit Kategori

1. Klik `Edit` pada salah satu kategori.
2. Ubah nama kategori.
3. Klik `Simpan Perubahan`.

Ekspektasi:

- nama kategori terbarui di tabel
- toast sukses muncul

## Skenario 5: Hapus Kategori yang Belum Dipakai

1. Pilih kategori yang belum dipakai vendor.
2. Klik `Hapus`.
3. Konfirmasi hapus.

Ekspektasi:

- kategori terhapus dari tabel
- toast sukses muncul

## Skenario 6: Hapus Kategori yang Sudah Dipakai Vendor

1. Pastikan ada vendor yang memakai kategori tersebut.
2. Coba hapus kategori.

Ekspektasi:

- request ditolak
- muncul pesan bahwa kategori tidak bisa dihapus karena sudah dipakai vendor

## Skenario 7: Integrasi ke Vendor Registration

1. Buka Vendor App `/register`.
2. Cek dropdown category.

Ekspektasi:

- kategori yang dibuat dari Admin App tampil di dropdown

## Skenario 8: Integrasi ke Vendor Onboarding

1. Login vendor dengan status `pending_verification` atau `rejected`.
2. Buka `/onboarding`.
3. Cek dropdown category.

Ekspektasi:

- kategori yang dibuat atau diubah dari Admin App tampil konsisten di onboarding

## Skenario 9: Audit Log

Periksa Audit Log di Admin App.

Ekspektasi:

- ada log `CREATE_CATEGORY`
- ada log `UPDATE_CATEGORY`
- ada log `DELETE_CATEGORY`
