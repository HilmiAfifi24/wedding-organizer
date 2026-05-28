# Manual Testing - User Management (Admin)

## 1. Persiapan

1. Jalankan migration Prisma:

```bash
cd packages/database
npx prisma migrate dev
```

2. Jalankan seed:

```bash
npx prisma db seed
```

3. Jalankan admin app:

```bash
cd apps/admin
npm run dev
```

4. Login dengan akun super admin dari seed:
- Email: `superadmin@wedding-organizer.local`
- Password: `admin123`

## 2. Smoke Test UI

1. Buka halaman `/users`.
2. Pastikan tabel user muncul.
3. Pastikan sidebar menampilkan menu `Manajemen User` (dari backend permissions).

Expected:
- Halaman dapat dibuka oleh ADMIN.
- Tidak ada error merah pada UI.

## 3. List, Search, Filter, Sort, Pagination

1. Gunakan search dengan nama user.
2. Gunakan search dengan email.
3. Filter role (`USER`, `VENDOR`, `ADMIN`).
4. Filter status (`ACTIVE`, `SUSPENDED`, `DELETED`).
5. Ubah sort (`createdAt`, `updatedAt`, `name`, `email`) dan arah (`asc/desc`).
6. Ubah page size dan navigasi page.

Expected:
- Data berubah sesuai query.
- Soft deleted user tidak tampil pada default list.
- Soft deleted user tampil hanya saat `include deleted` dicentang (dan user punya permission history).

## 4. View Detail & Booking History

1. Klik `Detail` pada salah satu user.
2. Pastikan data profil user tampil.
3. Klik `Muat Riwayat`.

Expected:
- Detail user tampil dengan benar.
- Booking history tampil jika ada data.
- Jika tidak ada data booking, tampil state kosong.
- Jika profil tanpa `canHistory`, API mengembalikan forbidden saat load history.

## 5. Suspend / Unsuspend

1. Pilih user non-admin/self, klik `Suspend` dan konfirmasi.
2. Pastikan status user berubah ke `SUSPENDED`.
3. Klik `Unsuspend` dan konfirmasi.
4. Pastikan status kembali `ACTIVE`.

Expected:
- Toast sukses muncul setelah aksi berhasil.
- Audit log tersimpan untuk suspend dan unsuspend.

## 6. Soft Delete

1. Pilih user non-self, klik `Delete` dan konfirmasi.
2. Pastikan user hilang dari default list.
3. Aktifkan `Tampilkan user terhapus`.
4. Pastikan user deleted muncul dengan status `DELETED`.

Expected:
- `deletedAt` dan `deletedBy` terisi.
- Audit log delete tersimpan.

## 7. Business Rules Validation

1. Login sebagai admin A.
2. Coba suspend akun admin A sendiri.
3. Coba delete akun admin A sendiri.

Expected:
- API menolak dengan message business rule.
- UI menampilkan toast error.

## 8. Auth Rule Validation (Suspended Cannot Login)

1. Suspend akun admin B dari admin A.
2. Logout admin A.
3. Coba login menggunakan admin B.

Expected:
- Login gagal (authorize return null).
- User tetap di halaman login.

## 9. Permission Validation by Endpoint

Siapkan profil akses tanpa permission tertentu pada menu `USER_MANAGEMENT`.

1. `canView = false` -> akses list/detail harus ditolak.
2. `canUpdate = false` -> suspend/unsuspend ditolak.
3. `canDelete = false` -> delete ditolak.
4. `canHistory = false` -> load booking history ditolak.

Expected:
- API return status 403.
- UI menampilkan pesan error.

## 10. API Contract Validation

Cek endpoint berikut via browser devtools / Postman:
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/suspend`
- `PATCH /api/admin/users/:id/unsuspend`
- `DELETE /api/admin/users/:id`

Expected response shape:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 11. Database Validation Query (Opsional)

```sql
SELECT id, email, "suspendedAt", "suspendedBy", "deletedAt", "deletedBy"
FROM "User"
ORDER BY "updatedAt" DESC
LIMIT 20;
```

```sql
SELECT id, "actorId", module, action, "targetId", "createdAt"
FROM "AuditLog"
WHERE module = 'USER_MANAGEMENT'
ORDER BY "createdAt" DESC
LIMIT 50;
```

Expected:
- Kolom suspend/delete ter-update sesuai aksi.
- Audit log tercatat untuk suspend, unsuspend, delete.
