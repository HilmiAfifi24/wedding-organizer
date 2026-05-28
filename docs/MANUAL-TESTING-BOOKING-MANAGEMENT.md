# Manual Testing - Booking Management (Admin)

## 1. Persiapan

1. Jalankan migration terbaru:

```bash
cd packages/database
npx prisma migrate dev
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Jalankan seed:

```bash
npx prisma db seed
```

4. Jalankan admin app:

```bash
cd apps/admin
npm run dev
```

5. Login sebagai super admin:
- Email: `superadmin@wedding-organizer.local`
- Password: `admin123`

## 2. Smoke Test Halaman

1. Buka `/bookings`.
2. Pastikan menu `Manajemen Booking` muncul di sidebar.
3. Pastikan list booking tampil tanpa crash.

Expected:
- Halaman booking dapat diakses untuk admin dengan permission `canView`.

## 3. List, Search, Filter, Sort, Pagination

1. Search berdasarkan:
- id booking
- nama user
- email user
- nama vendor
- nama service
- catatan booking

2. Filter status:
- `PENDING`
- `PENDING_PAYMENT`
- `CONFIRMED`
- `REJECTED`
- `COMPLETED`
- `CANCELLED`

3. Filter tanggal booking (`bookedFrom`, `bookedTo`).
4. Filter vendor dengan nama vendor.
5. Filter user dengan nama/email user.
6. Ubah sort (`bookedAt`, `createdAt`, `updatedAt`, `status`) dan direction.
7. Ubah page size dan navigasi page.

Expected:
- Hasil list sesuai filter dan query.
- Pagination stabil dan tidak blink/error.

## 4. Detail Booking

1. Klik `Detail` dari list booking.
2. Pastikan route pindah ke `/bookings/:id`.
3. Verifikasi detail menampilkan:
- informasi booking
- user information
- vendor information
- service information
- payment proof
- booking timeline/history

Expected:
- Semua data tampil konsisten.
- Jika permission history tidak ada, detail tetap tampil tetapi timeline ditolak dengan error yang jelas.

## 5. State Transition Rules

Uji transisi berikut:

1. `PENDING -> PENDING_PAYMENT`
2. `PENDING -> REJECTED`
3. `PENDING_PAYMENT -> CONFIRMED`
4. `PENDING_PAYMENT -> CANCELLED`
5. `CONFIRMED -> COMPLETED`
6. `CONFIRMED -> CANCELLED`

Expected:
- Semua transisi valid berhasil.
- Timeline `BookingStatusHistory` tercatat.
- Audit log `BOOKING_MANAGEMENT` tercatat.

## 6. Invalid Transition Rules

1. Coba ubah `PENDING` langsung ke `CONFIRMED`.
2. Coba ubah `COMPLETED` ke status lain.
3. Coba ubah `CANCELLED` ke status lain.
4. Coba ubah `REJECTED` ke status lain.

Expected:
- Request ditolak.
- Muncul error transition invalid/final state.

## 7. Suspended Vendor Rule

1. Pilih booking milik vendor yang statusnya `suspended`.
2. Coba ubah:
- ke `PENDING_PAYMENT`
- ke `CONFIRMED`
- ke `COMPLETED`

Expected:
- Request ditolak dengan pesan `Suspended vendor cannot process booking`.

3. Coba ubah booking vendor suspended ke `REJECTED` atau `CANCELLED`.

Expected:
- Tetap boleh, karena aksi ini menghentikan proses booking.

## 8. Booking Validity Rule

1. Gunakan booking yang user atau vendor-nya sudah soft deleted/nonaktif.
2. Coba ubah status booking.

Expected:
- Request ditolak dengan pesan bahwa booking harus terkait user/vendor valid.

## 9. Permission Validation

Set permission menu `BOOKING_MANAGEMENT`:

1. `canView = false`
- `/bookings` dan `/bookings/:id` harus ditolak.

2. `canUpdate = false`
- `PATCH /api/admin/bookings/:id/status` harus ditolak.

3. `canHistory = false`
- `GET /api/admin/bookings/:id/history` harus ditolak.

Expected:
- API return 403.
- UI menampilkan pesan error yang sesuai.

## 10. API Contract Validation

Periksa endpoint:
- `GET /api/admin/bookings`
- `GET /api/admin/bookings/:id`
- `PATCH /api/admin/bookings/:id/status`
- `GET /api/admin/bookings/:id/history`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 11. Audit Log dan Status History

Jalankan query berikut:

```sql
SELECT id, "bookingId", "previousStatus", "newStatus", "changedById", note, "createdAt"
FROM "BookingStatusHistory"
ORDER BY "createdAt" DESC
LIMIT 100;
```

```sql
SELECT id, module, action, "targetId", "actorId", "createdAt"
FROM "AuditLog"
WHERE module = 'BOOKING_MANAGEMENT'
ORDER BY "createdAt" DESC
LIMIT 100;
```

Expected:
- Tiap update status membuat 1 row `BookingStatusHistory`.
- Audit log penting tercatat untuk change/cancel/reject/complete.
