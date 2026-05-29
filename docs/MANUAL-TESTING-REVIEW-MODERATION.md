# Manual Testing - Review Moderation (Admin)

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

1. Buka `/reviews`.
2. Pastikan menu `Moderasi Review` muncul di sidebar.
3. Pastikan daftar review tampil tanpa crash.

Expected:
- Halaman dapat diakses untuk admin dengan permission `canView`.

## 3. List, Search, Filter, Sort, Pagination

1. Search review berdasarkan:
- reviewer name
- vendor name
- review content

2. Filter:
- status review: `VISIBLE`, `HIDDEN`, `DELETED`
- rating 1-5
- vendor
- created date range

3. Ubah sort:
- `createdAt`
- `updatedAt`
- `rating`
- `status`

4. Ubah page size dan navigasi page.

Expected:
- Hasil list sesuai query/filter.
- Pagination stabil.

## 4. Detail Review

1. Klik `Detail`.
2. Pastikan route pindah ke `/reviews/:id`.
3. Verifikasi detail menampilkan:
- isi review
- rating
- related booking
- related user
- related vendor
- moderation metadata
- moderation history timeline

Expected:
- Semua data tampil lengkap.

## 5. Hide Review

1. Pilih review `VISIBLE`.
2. Klik `Hide`.
3. Coba submit tanpa reason atau reason < 3 karakter.

Expected:
- Tombol submit disabled.

4. Isi reason valid lalu submit.

Expected:
- Status review berubah menjadi `HIDDEN`.
- `hiddenAt`, `hiddenById`, `moderationReason` terisi.
- Audit log dan moderation history tercatat.
- Review tidak muncul di user app/vendor public listing.

## 6. Unhide Review

1. Pilih review `HIDDEN`.
2. Klik `Unhide`.
3. Submit.

Expected:
- Status review kembali menjadi `VISIBLE`.
- `hiddenAt` dan `hiddenById` menjadi `null`.
- Audit log dan moderation history tercatat.

## 7. Soft Delete Review

1. Pilih review `VISIBLE` atau `HIDDEN`.
2. Klik `Delete`.
3. Coba submit tanpa reason valid.

Expected:
- Tombol submit disabled.

4. Isi reason valid lalu submit.

Expected:
- Status review berubah menjadi `DELETED`.
- `deletedAt`, `deletedById`, `moderationReason` terisi.
- Review tidak muncul di user app/vendor public listing.
- Audit log dan moderation history tercatat.

## 8. Business Rule Validation

1. Coba buat review untuk booking yang statusnya bukan `COMPLETED`.

Expected:
- Backend menolak create review.

2. Coba hide review yang statusnya `DELETED`.

Expected:
- Request ditolak.

3. Coba unhide review yang statusnya `DELETED`.

Expected:
- Request ditolak.

## 9. Permission Validation

Set permission menu `REVIEW_MODERATION`:

1. `canView = false`
- `/reviews` dan `/reviews/:id` harus ditolak.

2. `canUpdate = false`
- `PATCH /api/admin/reviews/:id/hide`
- `PATCH /api/admin/reviews/:id/unhide`
- harus ditolak.

3. `canDelete = false`
- `DELETE /api/admin/reviews/:id` harus ditolak.

4. `canHistory = false`
- `GET /api/admin/reviews/:id/history` harus ditolak.

Expected:
- API return 403.
- UI menampilkan pesan error yang sesuai.

## 10. API Contract Validation

Periksa endpoint:
- `GET /api/admin/reviews`
- `GET /api/admin/reviews/:id`
- `PATCH /api/admin/reviews/:id/hide`
- `PATCH /api/admin/reviews/:id/unhide`
- `DELETE /api/admin/reviews/:id`
- `GET /api/admin/reviews/:id/history`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 11. Query Validasi DB

```sql
SELECT id, "bookingId", rating, status, "hiddenAt", "deletedAt", "moderationReason", "createdAt"
FROM "Review"
ORDER BY "updatedAt" DESC
LIMIT 100;
```

```sql
SELECT id, "reviewId", action, reason, "actorId", "createdAt"
FROM "ReviewModerationHistory"
ORDER BY "createdAt" DESC
LIMIT 100;
```

```sql
SELECT id, module, action, "targetId", "actorId", "createdAt"
FROM "AuditLog"
WHERE module = 'REVIEW_MODERATION'
ORDER BY "createdAt" DESC
LIMIT 100;
```

Expected:
- Hide/unhide/delete tercatat lengkap.
- Hidden/deleted review tidak muncul secara publik.
