# Manual Testing - Payment Monitoring and Override (Admin)

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

1. Buka `/payments`.
2. Pastikan menu `Monitoring Pembayaran` muncul di sidebar.
3. Pastikan list payment proof tampil tanpa crash.

Expected:
- Halaman dapat diakses untuk admin dengan permission `canView`.

## 3. List, Search, Filter, Sort, Pagination

1. Search berdasarkan:
- booking code
- nama user
- nama vendor

2. Filter:
- payment proof status: `PENDING`, `VERIFIED`, `REJECTED`
- booking status
- vendor
- upload date range

3. Ubah sort:
- `createdAt`
- `updatedAt`
- `status`
- `verifiedAt`

4. Ubah page size dan navigasi page.

Expected:
- Hasil list sesuai query/filter.
- Pagination stabil.

## 4. Detail Payment Proof

1. Klik `Detail`.
2. Pastikan route pindah ke `/payments/:id`.
3. Verifikasi detail menampilkan:
- preview bukti pembayaran
- status payment proof
- status booking terkait
- related booking card
- vendor verification info
- verification history/timeline
- verifier/override metadata

Expected:
- Semua data tampil lengkap dan konsisten.

## 5. Override Reason Validation

1. Pada detail payment proof, klik `Force Verify` atau `Force Reject`.
2. Biarkan kolom reason kosong atau isi < 3 karakter.

Expected:
- Tombol submit disabled.
- Request tidak boleh terkirim tanpa reason valid.

## 6. Force Verify Rule

1. Gunakan payment proof dengan booking status `PENDING_PAYMENT`.
2. Klik `Force Verify`.
3. Isi override reason valid.
4. Submit.

Expected:
- Payment proof status berubah menjadi `VERIFIED`.
- Field `verifiedById`, `verifiedAt`, `verificationNote` terisi.
- Field `overriddenById`, `overriddenAt`, `overrideReason` terisi.
- Booking status berubah menjadi `CONFIRMED`.
- `PaymentProofStatusHistory` tercatat.
- `BookingStatusHistory` tercatat.
- Audit log tercatat.

5. Coba `Force Verify` pada booking dengan status selain `PENDING_PAYMENT`.

Expected:
- Request ditolak.

## 7. Force Reject Rule

1. Gunakan payment proof dengan booking status `PENDING_PAYMENT`.
2. Klik `Force Reject`.
3. Isi override reason valid.
4. Submit.

Expected:
- Payment proof status berubah menjadi `REJECTED`.
- Booking tetap `PENDING_PAYMENT`.
- Field `rejectedById`, `rejectedAt`, `rejectionReason` terisi.
- Field override terisi.
- History dan audit log tercatat.

5. Gunakan payment proof `VERIFIED` dengan booking `CONFIRMED`.
6. Jalankan `Force Reject`.

Expected:
- Payment proof berubah menjadi `REJECTED`.
- Booking kembali ke `PENDING_PAYMENT`.
- Tercatat history booking dan payment proof.

## 8. Permission Validation

Set permission menu `PAYMENT_MONITORING`:

1. `canView = false`
- `/payments` dan `/payments/:id` harus ditolak.

2. `canUpdate = false`
- `PATCH /api/admin/payment-proofs/:id/force-verify`
- `PATCH /api/admin/payment-proofs/:id/force-reject`
- harus ditolak.

3. `canHistory = false`
- `GET /api/admin/payment-proofs/:id/history` harus ditolak.

Expected:
- API return 403.
- UI menampilkan pesan error yang sesuai.

## 9. API Contract Validation

Periksa endpoint:
- `GET /api/admin/payment-proofs`
- `GET /api/admin/payment-proofs/:id`
- `GET /api/admin/payment-proofs/:id/history`
- `PATCH /api/admin/payment-proofs/:id/force-verify`
- `PATCH /api/admin/payment-proofs/:id/force-reject`

Expected:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## 10. Query Validasi DB

```sql
SELECT id, "bookingId", status, "verifiedById", "verifiedAt", "rejectedById", "rejectedAt", "overriddenById", "overriddenAt"
FROM "PaymentProof"
ORDER BY "updatedAt" DESC
LIMIT 100;
```

```sql
SELECT id, "paymentProofId", "previousStatus", "newStatus", "changedById", note, "isOverride", "createdAt"
FROM "PaymentProofStatusHistory"
ORDER BY "createdAt" DESC
LIMIT 100;
```

```sql
SELECT id, module, action, "targetId", "actorId", "createdAt"
FROM "AuditLog"
WHERE module = 'PAYMENT_MONITORING'
ORDER BY "createdAt" DESC
LIMIT 100;
```

Expected:
- Override payment tercatat lengkap.
- Force verify mengubah booking menjadi `CONFIRMED`.
- Force reject mempertahankan atau mengembalikan booking ke `PENDING_PAYMENT`.
