# Manual Testing - Vendor Management (Admin)

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

1. Buka `/vendors`.
2. Pastikan menu `Manajemen Vendor` muncul di sidebar (dari backend permissions).
3. Pastikan list vendor tampil tanpa crash.

Expected:
- Halaman vendor dapat diakses role admin dengan permission `canView`.

## 3. List, Search, Filter, Sort, Pagination

1. Search dengan nama vendor.
2. Search dengan owner name.
3. Search dengan owner email.
4. Search dengan nama kategori.
5. Filter status:
- `pending_verification`
- `approved`
- `rejected`
- `suspended`
6. Ubah sort (`createdAt`, `updatedAt`, `name`) dan direction.
7. Ubah page size dan navigasi page.

Expected:
- Hasil list sesuai query/filter/sort.
- Vendor soft deleted tidak muncul pada default list.

## 4. Detail Page Vendor

1. Klik tombol `Detail` pada list vendor.
2. Pastikan route pindah ke `/vendors/:id`.
3. Verifikasi data berikut tampil:
- profil vendor
- owner data
- checklist verifikasi
- service preview
- portfolio preview
- audit history

Expected:
- Detail data konsisten dan lengkap.

## 5. Approve Vendor Rule (Checklist)

1. Pilih vendor yang checklist belum lengkap.
2. Klik `Approve` dan konfirmasi.

Expected:
- Request gagal.
- Muncul error bahwa checklist verifikasi belum lengkap.

3. Lengkapi checklist:
- business name ada
- category ada
- phone number valid
- minimal 1 service
- minimal 1 portfolio

4. Klik `Approve` lagi.

Expected:
- Berhasil approve.
- Status berubah jadi `approved`.
- Audit log `APPROVE_VENDOR` tercatat.

## 6. Reject Vendor

1. Klik `Reject` pada vendor.
2. Pastikan modal alasan reject muncul.
3. Isi alasan < 3 karakter.

Expected:
- Tombol submit reject disabled / validasi gagal.

4. Isi alasan valid lalu submit.

Expected:
- Status berubah jadi `rejected`.
- `rejectionReason` tersimpan.
- Audit log `REJECT_VENDOR` tercatat.

## 7. Suspend / Unsuspend Vendor

1. Klik `Suspend` pada vendor.

Expected:
- Status berubah jadi `suspended`.
- Audit log `SUSPEND_VENDOR` tercatat.

2. Klik `Unsuspend` pada vendor yang suspended.

Expected:
- Status kembali ke:
- `approved` jika sebelumnya pernah approved
- `pending_verification` jika belum pernah approved
- Audit log `UNSUSPEND_VENDOR` tercatat.

## 8. Soft Delete Vendor

1. Klik `Delete` dan konfirmasi.

Expected:
- Vendor hilang dari default list.
- Field `deletedAt` dan `deletedBy` terisi.
- Audit log `DELETE_VENDOR` tercatat.

2. Centang `Tampilkan vendor terhapus`.

Expected:
- Vendor deleted muncul kembali.

## 9. Permission Validation

Set profile permission untuk menu `VENDOR_MANAGEMENT`:

1. `canView = false`:
- `/vendors` dan `/vendors/:id` harus ditolak.

2. `canUpdate = false`:
- approve/reject/suspend/unsuspend harus ditolak.

3. `canDelete = false`:
- delete harus ditolak.

4. `canHistory = false`:
- detail dengan history harus ditolak.

Expected:
- API return 403.
- UI menampilkan error message.

## 10. API Contract Validation

Periksa endpoint berikut:
- `GET /api/admin/vendors`
- `GET /api/admin/vendors/:id`
- `PATCH /api/admin/vendors/:id/approve`
- `PATCH /api/admin/vendors/:id/reject`
- `PATCH /api/admin/vendors/:id/suspend`
- `PATCH /api/admin/vendors/:id/unsuspend`
- `DELETE /api/admin/vendors/:id`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 11. Business Rule Cross-check (User App Booking)

1. Pastikan ada vendor status `pending_verification`.
2. Coba booking ke vendor tersebut (jika flow booking tersedia).

Expected:
- Ditolak, vendor belum available.

3. Pastikan vendor status `suspended`.
4. Coba booking ke vendor tersebut.

Expected:
- Ditolak, vendor tidak bisa menerima booking.

## 12. Query Validasi DB (Opsional)

```sql
SELECT id, name, status, "approvedAt", "rejectedAt", "rejectionReason", "suspendedAt", "deletedAt"
FROM "Vendor"
ORDER BY "updatedAt" DESC
LIMIT 50;
```

```sql
SELECT id, module, action, "targetId", "actorId", "createdAt"
FROM "AuditLog"
WHERE module = 'VENDOR_MANAGEMENT'
ORDER BY "createdAt" DESC
LIMIT 100;
```

Expected:
- Data lifecycle vendor terisi sesuai aksi.
- Audit log penting tercatat semua.
