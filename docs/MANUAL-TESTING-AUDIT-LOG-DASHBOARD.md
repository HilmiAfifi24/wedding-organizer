# Manual Testing - Audit Log Dashboard (Admin)

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

1. Buka `/audit-logs`.
2. Pastikan menu `Audit Log` muncul di sidebar.
3. Pastikan daftar audit log tampil tanpa crash.

Expected:
- Halaman dapat diakses untuk admin dengan permission `canView` dan `canHistory`.
- Tidak ada tombol edit atau delete.

## 3. List, Search, Filter, Sort, Pagination

1. Search audit log berdasarkan:
- actor name
- actor email
- module
- action
- target ID

2. Filter:
- module
- action
- actor
- date range

3. Ubah sort direction:
- `desc`
- `asc`

4. Ubah page size dan navigasi page.

Expected:
- Hasil list sesuai query/filter.
- Pagination stabil.
- Audit log tetap read-only.

## 4. Detail Audit Log

1. Klik `Detail`.
2. Pastikan route pindah ke `/audit-logs/:id`.
3. Verifikasi detail menampilkan:
- metadata audit log
- related actor
- request context
- related target bila ada
- beforeData
- afterData

Expected:
- Semua data tampil lengkap.
- Nilai JSON ditampilkan dalam format yang mudah dibaca.

## 5. Sanitization Validation

1. Cari audit log yang memiliki `beforeData` atau `afterData`.
2. Periksa field yang sensitif seperti:
- `password`
- `token`
- `secret`
- `cookie`
- `authorization`
- `session`

Expected:
- Nilai sensitif tidak tampil apa adanya.
- Field sensitif ditampilkan sebagai `[REDACTED]`.

## 6. Related Target Validation

1. Buka audit log dari modul:
- `USER_MANAGEMENT`
- `VENDOR_MANAGEMENT`
- `BOOKING_MANAGEMENT`
- `PAYMENT_MONITORING`
- `REVIEW_MODERATION`

2. Klik `Buka Target` atau `Lihat Entity Terkait` bila tersedia.

Expected:
- Link target hanya muncul jika route bisa diinferensikan.
- Route mengarah ke halaman admin yang relevan.

## 7. Permission Validation

Set permission menu `AUDIT_LOG_DASHBOARD`:

1. `canView = false`
- `/audit-logs` dan `/audit-logs/:id` harus ditolak.

2. `canHistory = false`
- `GET /api/admin/audit-logs`
- `GET /api/admin/audit-logs/:id`
- harus ditolak.

Expected:
- API return 403.
- UI menampilkan pesan error yang sesuai.

## 8. API Contract Validation

Periksa endpoint:
- `GET /api/admin/audit-logs`
- `GET /api/admin/audit-logs/:id`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 9. Read-Only Validation

1. Pastikan tidak ada endpoint mutasi untuk audit log di UI admin.
2. Coba cari tombol:
- edit
- delete
- restore

Expected:
- Tidak ada aksi mutasi audit log dari UI.

## 10. Query Validasi DB

```sql
SELECT id, "actorId", module, action, "targetId", "ipAddress", "createdAt"
FROM "AuditLog"
ORDER BY "createdAt" DESC
LIMIT 100;
```

```sql
SELECT id, module, action, "targetId", "beforeData", "afterData"
FROM "AuditLog"
ORDER BY "createdAt" DESC
LIMIT 20;
```

Expected:
- Audit log tersimpan konsisten.
- Data sensitif tidak lagi tersimpan mentah untuk log baru yang dibuat setelah hardening repository.
