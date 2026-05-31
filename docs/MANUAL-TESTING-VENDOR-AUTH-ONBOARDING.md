# Manual Testing Vendor Registration, Authentication, and Onboarding

## Tujuan

Memverifikasi bahwa Vendor App mendukung:

- registrasi vendor mandiri
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

## Skenario 1: Registrasi Vendor Berhasil

1. Buka `/register`.
2. Isi seluruh field valid.
3. Klik `Daftar Vendor`.

Ekspektasi:

- muncul pesan sukses
- data `User` baru dibuat dengan role `VENDOR`
- data `Vendor` baru dibuat dengan status `PENDING_VERIFICATION`
- setelah jeda singkat, user diarahkan ke `/login`
- audit log `VENDOR_REGISTRATION` tercatat

## Skenario 2: Validasi Registrasi

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

Ekspektasi:

- API mengembalikan error yang sesuai
- tidak ada data baru tercipta

## Skenario 3: Login Vendor Berhasil

1. Login di `/login` menggunakan akun vendor yang baru dibuat.

Ekspektasi:

- hanya akun role `VENDOR` yang bisa masuk
- session user berisi `userId`, `vendorId`, `email`, `role`, dan `vendorStatus`
- audit log `VENDOR_LOGIN` tercatat
- vendor dengan status `pending_verification` diarahkan ke `/onboarding`

## Skenario 4: Role Non-Vendor Ditolak

1. Coba login ke Vendor App dengan akun admin.

Ekspektasi:

- login gagal
- user tidak mendapat session vendor
- tetap berada di halaman login dengan pesan error

## Skenario 5: Route Protection Tanpa Login

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

## Skenario 6: Onboarding Pending Vendor

1. Login sebagai vendor baru.
2. Pastikan diarahkan ke `/onboarding`.
3. Lengkapi field onboarding.

Ekspektasi:

- checklist tampil
- progress checklist tampil
- status onboarding berubah sesuai kelengkapan
- jika service/portfolio belum ada, status tetap `INCOMPLETE`
- audit log `VENDOR_ONBOARDING_UPDATE` tercatat setiap update

## Skenario 7: Ready For Review

1. Pastikan vendor memiliki minimal:
   - 1 service
   - 1 portfolio
2. Buka `/onboarding` lagi.
3. Simpan form dengan data lengkap.

Ekspektasi:

- semua checklist menjadi lengkap
- onboarding status menjadi `READY_FOR_REVIEW`
- vendor tetap berada pada status `pending_verification` sampai admin memutuskan

## Skenario 8: Rejected Flow

1. Login ke Admin App.
2. Buka modul vendor management.
3. Reject vendor dan isi alasan penolakan.
4. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor diarahkan ke `/account/rejected`
- alasan reject tampil
- tanggal reject tampil
- tombol `Edit Profile & Resubmit` mengarah ke `/onboarding`

## Skenario 9: Resubmission Setelah Rejected

1. Dari `/account/rejected`, buka `/onboarding`.
2. Perbaiki data onboarding sampai checklist lengkap.
3. Simpan perubahan.

Ekspektasi:

- status vendor dikembalikan ke `pending_verification`
- `rejectionReason` ter-reset
- audit log `VENDOR_RESUBMISSION` tercatat

## Skenario 10: Suspended Flow

1. Login ke Admin App.
2. Suspend vendor.
3. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor diarahkan ke `/account/suspended`
- tidak bisa mengakses `/dashboard`
- tidak bisa mengakses route protected lain

## Skenario 11: Approved Flow

1. Login ke Admin App.
2. Approve vendor yang checklist-nya sudah valid.
3. Login kembali ke Vendor App dengan akun vendor tersebut.

Ekspektasi:

- vendor langsung diarahkan ke `/dashboard`
- route `/profile`, `/services`, `/portfolio`, `/bookings`, `/payments` bisa diakses
- route `/onboarding` tidak lagi menjadi landing utama

## Skenario 12: API Contract Check

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

## Skenario 13: Audit Log Check

Periksa modul audit log di Admin App.

Ekspektasi:

- ada log `VENDOR_REGISTRATION`
- ada log `VENDOR_LOGIN`
- ada log `VENDOR_ONBOARDING_UPDATE`
- ada log `VENDOR_RESUBMISSION` saat vendor rejected memperbarui onboarding lengkap

## Catatan Penting

- Jika build vendor dijalankan di environment sandbox ketat, Turbopack bisa gagal karena batasan proses lokal. Di mesin lokal normal, `npm run build` untuk `apps/vendor` harus lolos.
- Jika `npx prisma migrate dev` belum dijalankan setelah perubahan schema vendor, field baru seperti `businessName`, `businessAddress`, `city`, dan `province` belum tersedia di database.
