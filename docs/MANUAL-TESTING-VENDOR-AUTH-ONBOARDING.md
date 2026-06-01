# Manual Testing Vendor Registration, Authentication, and Onboarding

## Tujuan

Memverifikasi bahwa Vendor App mendukung:

- registrasi vendor mandiri
- wizard registrasi 3 langkah
- login khusus role `VENDOR`
- session vendor
- route protection
- redirect berdasarkan status vendor
- onboarding vendor
- resubmission setelah rejected
- integrasi approval dari admin panel

## Prasyarat

1. Jalankan migration terbaru dan generate Prisma client:

```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

2. Pastikan minimal ada 1 kategori vendor.

Jika belum ada kategori, buat dari database atau admin panel sebelum menguji registrasi vendor.

3. Jalankan Vendor App:

```bash
cd apps/vendor
npm run dev
```

4. Jalankan Admin App jika ingin menguji approval/rejection:

```bash
cd apps/admin
npm run dev
```

5. Kredensial admin seed:

- Email: `superadmin@wedding-organizer.local`
- Password: `admin123`

## Data Uji Vendor

Gunakan contoh berikut:

- Owner Name: `Vendor Test Owner`
- Email: `vendor.test@example.com`
- Phone Number: `+6281234567890`
- Password: `vendor123`
- Confirm Password: `vendor123`
- Business Name: `Vendor Test Studio`
- City: `Jakarta`
- Province: `DKI Jakarta`
- Initial Service Name: `Paket Rias Pengantin`
- Initial Service Price: `3500000`
- Initial Portfolio Title: `Wedding Makeup Session`
- Initial Portfolio Media URL: `https://images.unsplash.com/photo-1525258946800-98cfd641d0de`

## Skenario 1: Wizard Registrasi 3 Langkah

1. Buka `/register`.
2. Pastikan ada 3 tab:
   - `Pendaftaran`
   - `Service Awal`
   - `Portfolio Awal`
3. Isi tab `Pendaftaran` dengan data valid.
4. Klik `Lanjut`.
5. Isi tab `Service Awal`.
6. Klik `Lanjut`.
7. Isi tab `Portfolio Awal`.

Ekspektasi:

- perpindahan ke langkah berikutnya hanya berhasil jika langkah saat ini valid
- error validasi tampil per field
- user bisa kembali ke langkah sebelumnya tanpa kehilangan data input

## Skenario 2: Registrasi Vendor Berhasil

1. Buka `/register`.
2. Isi seluruh wizard dengan data valid.
3. Klik `Daftar & Masuk Onboarding`.

Ekspektasi:

- muncul pesan sukses
- data `User` baru dibuat dengan role `VENDOR`
- data `Vendor` baru dibuat dengan status `PENDING_VERIFICATION`
- 1 `Service` awal langsung dibuat untuk vendor tersebut
- 1 `Portfolio` awal langsung dibuat untuk vendor tersebut
- vendor otomatis login
- vendor diarahkan langsung ke `/onboarding`
- audit log `VENDOR_REGISTRATION` tercatat

## Skenario 3: Validasi Registrasi

1. Buka `/register`.
2. Isi `confirmPassword` berbeda dari `password`.
3. Submit form.

Ekspektasi:

- form menolak submit
- muncul error konfirmasi password

Ulangi juga untuk:

- email duplikat
- phone number duplikat
- category kosong
- business name kosong
- service name kosong
- service price negatif
- portfolio media URL tidak valid

Ekspektasi:

- API mengembalikan error yang sesuai
- tidak ada data baru tercipta

## Skenario 4: Login Vendor Berhasil

1. Login di `/login` menggunakan akun vendor yang baru dibuat.

Ekspektasi:

- hanya akun role `VENDOR` yang bisa masuk
- session user berisi `userId`, `vendorId`, `email`, `role`, dan `vendorStatus`
- audit log `VENDOR_LOGIN` tercatat
- vendor dengan status `pending_verification` diarahkan ke `/onboarding`

## Skenario 5: Role Non-Vendor Ditolak

1. Coba login ke Vendor App dengan akun admin.

Ekspektasi:

- login gagal
- user tidak mendapat session vendor
- tetap berada di halaman login dengan pesan error

## Skenario 6: Route Protection Tanpa Login

1. Logout dari Vendor App.
2. Akses langsung:
   - `/dashboard`
   - `/profile`
   - `/services`
   - `/portfolio`
   - `/bookings`
   - `/payments`

Ekspektasi:

- semua route protected redirect ke `/login`

## Skenario 7: Onboarding Setelah Registrasi

1. Login sebagai vendor baru.
2. Pastikan diarahkan ke `/onboarding`.
3. Periksa checklist.

Ekspektasi:

- checklist tampil
- progress checklist tampil
- karena service awal dan portfolio awal sudah dibuat saat registrasi, checklist bisa langsung lengkap jika data pendaftaran valid
- onboarding status dapat langsung menjadi `READY_FOR_REVIEW`
- audit log `VENDOR_ONBOARDING_UPDATE` tercatat setiap update

## Skenario 8: Ready For Review

1. Pastikan vendor memiliki minimal:
   - 1 service
   - 1 portfolio
2. Buka `/onboarding` lagi.
3. Simpan form dengan data lengkap.

Ekspektasi:

- semua checklist menjadi lengkap
- onboarding status menjadi `READY_FOR_REVIEW`
- vendor tetap berada pada status `pending_verification` sampai admin memutuskan

## Skenario 9: Rejected Flow

1. Login ke Admin App.
2. Buka modul vendor management.
3. Reject vendor dan isi alasan penolakan.
4. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor diarahkan ke `/account/rejected`
- alasan reject tampil
- tanggal reject tampil
- tombol `Edit Profile & Resubmit` mengarah ke `/onboarding`

## Skenario 10: Resubmission Setelah Rejected

1. Dari `/account/rejected`, buka `/onboarding`.
2. Perbaiki data onboarding sampai checklist lengkap.
3. Simpan perubahan.

Ekspektasi:

- status vendor dikembalikan ke `pending_verification`
- `rejectionReason` ter-reset
- audit log `VENDOR_RESUBMISSION` tercatat

## Skenario 11: Suspended Flow

1. Login ke Admin App.
2. Suspend vendor.
3. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor diarahkan ke `/account/suspended`
- tidak bisa mengakses `/dashboard`
- tidak bisa mengakses route protected lain

## Skenario 12: Approved Flow

1. Login ke Admin App.
2. Approve vendor yang checklist-nya sudah valid.
3. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor langsung diarahkan ke `/dashboard`
- route `/profile`, `/services`, `/portfolio`, `/bookings`, `/payments` bisa diakses
- route `/onboarding` tidak lagi menjadi landing utama

## Skenario 13: API Contract Check

Periksa endpoint berikut:

- `POST /api/vendor/register`
- `POST /api/vendor/auth/login`
- `POST /api/vendor/auth/logout`
- `GET /api/vendor/auth/me`
- `GET /api/vendor/onboarding`
- `PATCH /api/vendor/onboarding`

Ekspektasi:

- response mengikuti format:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## Skenario 14: Audit Log Check

Periksa modul audit log di Admin App.

Ekspektasi:

- ada log `VENDOR_REGISTRATION`
- ada log `VENDOR_LOGIN`
- ada log `VENDOR_ONBOARDING_UPDATE`
- ada log `VENDOR_RESUBMISSION` saat vendor rejected memperbarui onboarding lengkap

## Catatan Penting

- Jika build vendor dijalankan di environment sandbox ketat, Turbopack bisa gagal karena batasan proses lokal. Di mesin lokal normal, `npm run build` untuk `apps/vendor` harus lolos.
- Jika `npx prisma migrate dev` belum dijalankan setelah perubahan schema vendor, field baru seperti `businessName`, `businessAddress`, `city`, dan `province` belum tersedia di database.
