# Manual Testing - Dashboard Overview (Admin)

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

## 2. Redirect dan Landing Page

1. Buka `/login`.
2. Login sebagai admin.
3. Pastikan setelah login diarahkan ke `/dashboard`.
4. Buka `/`.

Expected:
- `/` melakukan redirect ke `/dashboard`.
- Dashboard menjadi landing page utama admin.

## 3. Smoke Test Dashboard

1. Buka `/dashboard`.
2. Pastikan halaman tampil tanpa crash.
3. Pastikan card KPI, chart, recent activity, pending actions, dan quick actions tampil sesuai permission akun.

Expected:
- Halaman memuat ringkasan operasional.
- Tidak ada query error di UI.

## 4. KPI Summary Cards

Verifikasi card berikut bila permission modul tersedia:
- Total Users
- Total Vendors
- Pending Vendor Verification
- Active Vendors
- Suspended Vendors
- Total Bookings
- Pending Payments
- Completed Bookings
- Cancelled Bookings
- Total Reviews

Expected:
- Angka tampil.
- Tombol/link `Buka` mengarah ke modul yang benar.

## 5. Time Range Filter

1. Ubah filter:
- Today
- Last 7 Days
- Last 30 Days
- Last 90 Days

Expected:
- Section booking, payment, dan review berubah mengikuti range.
- Ada indikator refresh/loading ringan saat data diperbarui.
- Dashboard tidak blank saat refresh.

## 6. Booking Overview

Verifikasi:
- status cards
- bar chart
- pie chart

Status yang harus muncul:
- `PENDING`
- `PENDING_PAYMENT`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `REJECTED`

Expected:
- Total dan distribusi status sesuai data booking pada range aktif.

## 7. Vendor Overview

Verifikasi:
- vendor status cards
- pie chart
- top vendors by bookings
- top vendors by ratings

Expected:
- Status vendor sesuai data aktif.
- Link top vendor membuka `/vendors/:id`.

## 8. Payment Overview

Verifikasi:
- pending verification
- verified
- rejected
- chart distribusi

Expected:
- Angka sesuai `PaymentProof` pada range aktif.

## 9. Review Overview

Verifikasi:
- total reviews in range
- visible reviews
- hidden reviews
- deleted reviews
- average rating
- rating distribution chart

Expected:
- Distribusi rating 1-5 tampil benar.
- Average rating konsisten dengan data review di periode aktif.

## 10. Recent Audit Logs Widget

1. Pastikan maksimal 10 record terbaru tampil.
2. Klik salah satu item.

Expected:
- Menampilkan actor, action, module, timestamp.
- Klik membuka `/audit-logs/:id`.

## 11. Pending Actions Widget

Verifikasi item yang mungkin tampil:
- vendor menunggu verifikasi
- pembayaran pending
- booking perlu perhatian
- review perlu moderasi lanjutan

Expected:
- Item hanya muncul jika count > 0 dan permission modul tersedia.
- Tombol CTA menuju modul yang relevan.

## 12. Quick Actions Widget

Verifikasi shortcut:
- Manage Users
- Manage Vendors
- Manage Bookings
- Manage Payments
- Moderate Reviews
- View Audit Logs

Expected:
- Item hanya tampil jika permission modul tersedia.
- Semua link bisa dibuka.

## 13. Permission Validation

Uji dengan mematikan permission per menu:

1. `DASHBOARD.canView = false`
- `/dashboard` harus gagal memuat overview.

2. `USER_MANAGEMENT.canView = false`
- widget users hilang
- quick action users hilang

3. `VENDOR_MANAGEMENT.canView = false`
- widget vendor hilang
- KPI vendor hilang

4. `BOOKING_MANAGEMENT.canView = false`
- widget booking hilang

5. `PAYMENT_MONITORING.canView = false`
- widget payment hilang

6. `REVIEW_MODERATION.canView = false`
- widget review hilang

7. `AUDIT_LOG_DASHBOARD.canView/canHistory = false`
- recent activities hilang
- quick action audit log hilang

Expected:
- Widget tersembunyi total, bukan disabled.

## 14. API Contract Validation

Periksa endpoint:
- `GET /api/admin/dashboard/overview`
- `GET /api/admin/dashboard/bookings`
- `GET /api/admin/dashboard/vendors`
- `GET /api/admin/dashboard/payments`
- `GET /api/admin/dashboard/reviews`
- `GET /api/admin/dashboard/recent-activities`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 15. Query Validasi DB

```sql
SELECT status, COUNT(*) 
FROM "Booking"
GROUP BY status;
```

```sql
SELECT status, COUNT(*)
FROM "Vendor"
WHERE "deletedAt" IS NULL
GROUP BY status;
```

```sql
SELECT status, COUNT(*)
FROM "PaymentProof"
GROUP BY status;
```

```sql
SELECT status, COUNT(*), AVG(rating)
FROM "Review"
GROUP BY status;
```

```sql
SELECT id, module, action, "targetId", "actorId", "createdAt"
FROM "AuditLog"
ORDER BY "createdAt" DESC
LIMIT 10;
```

Expected:
- Angka dashboard konsisten dengan data utama.
- Recent activities mengikuti 10 audit log terbaru.
