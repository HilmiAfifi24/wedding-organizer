
# 🏛️ PRD Admin Dashboard — Wedding Organizer (Improved Version)

Version: 3.0.0  
Last Updated: May 27, 2026  
Owner: Product + Engineering (Admin App)

---

# 1. Executive Summary

Dokumen ini adalah Product Requirement Document (PRD) khusus untuk aplikasi Admin Dashboard pada platform Wedding Organizer.

Admin Dashboard berfungsi sebagai:
- pusat kontrol operasional platform,
- sistem governance,
- moderasi,
- monitoring transaksi,
- dan access management.

Dokumen ini dirancang agar:
- scalable,
- AI-agent friendly,
- clean architecture compliant,
- dan siap dikembangkan secara modular menggunakan Fullstack Next.js.

---

# 2. Product Goals

## Primary Goals

### 1. Operational Control
Memberikan admin kontrol penuh terhadap aktivitas platform.

### 2. Governance & Security
Menjaga kualitas ekosistem user-vendor melalui:
- verification,
- moderation,
- audit,
- dan permission management.

### 3. Scalable Access Management
Mendukung sistem RBAC granular yang scalable untuk banyak role operasional.

### 4. Reliable Booking Operations
Menjamin alur booking dan pembayaran tetap konsisten sesuai business rule.

---

# 3. Platform Roles

## 3.1 Global Platform Roles

| Role | Description |
|---|---|
| USER | Mencari vendor, booking, review |
| VENDOR | Mengelola bisnis vendor |
| ADMIN | Mengelola platform end-to-end |

---

## 3.2 Admin Operational Roles

Semua admin memiliki `role = ADMIN`.

Hak akses detail ditentukan menggunakan:

### AccessProfile
Contoh:
- Super Admin
- Finance
- CS Operations
- Vendor Verification
- Moderator

### AccessPermission
Permission granular per menu:
- view
- insert
- update
- delete
- history
- custom events

---

# 4. Scope

## 4.1 In Scope

### Authentication & Session
- Admin login
- JWT session
- Route protection

### Access Control
- Menu Management
- Profile Management
- Permission Matrix
- User Access Assignment

### Operational Modules
- User Management
- Vendor Management
- Booking Monitoring
- Payment Verification
- Review Moderation
- Audit Logs

---

## 4.2 Out of Scope

- Payment gateway online
- Real-time chat
- Native mobile admin app
- AI recommendation system

---

# 5. Information Architecture

```txt
Dashboard

Administration
├── Menu Management
├── Profile Management
└── Admin Users

Operations
├── Users
├── Vendors
├── Bookings
├── Payments
└── Reviews

Governance
└── Audit Logs
```

---

# 6. Feature Modules

## 6.1 Authentication & Session

### Features
- Login admin menggunakan email/password
- JWT session
- Protected route
- Logout

### Rules
- Hanya `role = ADMIN` yang dapat mengakses admin app
- Session invalid otomatis logout

---

## 6.2 Access Control (RBAC)

### Menu Management

#### Features
- CRUD menu
- Parent-child hierarchy
- Sorting
- Active/inactive menu

#### Rules
- Menu tidak boleh menjadi parent dirinya sendiri
- Menu system tertentu tidak boleh dihapus

---

### Profile Management

#### Features
- CRUD access profile
- isSystem protection

#### Rules
- Profile `isSystem = true` tidak boleh dihapus

---

### Permission Matrix

```ts
type Permission = {
  canView: boolean
  canInsert: boolean
  canUpdate: boolean
  canDelete: boolean
  canHistory: boolean
  customEvents: string[]
}
```

---

## 6.3 User Management

### Features
- List users
- Search/filter user
- Suspend/unsuspend user
- User detail
- Booking history

---

## 6.4 Vendor Management

### Features
- Vendor listing
- Approve vendor
- Reject vendor
- Suspend vendor
- Vendor detail
- Service & portfolio preview

### Vendor Verification Checklist
- business_name tersedia
- minimal 1 service
- minimal 1 portfolio
- phone number valid
- category valid

---

## 6.5 Booking Management

### Booking Status

```ts
type BookingStatus =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
```

### Booking State Transition Rules

```txt
PENDING
├── PENDING_PAYMENT
└── REJECTED

PENDING_PAYMENT
├── CONFIRMED
└── CANCELLED

CONFIRMED
├── COMPLETED
└── CANCELLED
```

---

## 6.6 Offline Payment Verification

### Payment Flow

```txt
User booking
→ Status = PENDING_PAYMENT
→ User upload payment proof
→ Admin verify payment
→ Status = CONFIRMED
```

### Verification Rules
- verifiedById wajib terisi
- verifiedAt wajib terisi

---

## 6.7 Review Moderation

### Features
- List review
- Filter spam review
- Hide review
- Delete review

---

## 6.8 Audit Logs

### Audit Log Structure

```ts
type AuditLog = {
  id: string
  actorId: string
  module: string
  action: string
  targetId: string
  beforeData?: unknown
  afterData?: unknown
  createdAt: Date
}
```

---

# 7. Data Models

## Core Models
- User
- Vendor
- Service
- Booking
- PaymentProof
- Review
- Category
- Portfolio

## Governance Models
- AuditLog

---

# 8. Soft Delete Policy

```ts
deletedAt?: Date
deletedBy?: string
```

Models:
- User
- Vendor
- Booking
- Review
- Service

---

# 9. API Architecture

```txt
/api/admin/*
```

### Example Endpoints

```txt
/api/admin/users/*
/api/admin/vendors/*
/api/admin/bookings/*
/api/admin/payment-proofs/*
/api/admin/reviews/*
/api/admin/audit-logs/*
```

---

# 10. Clean Architecture Guideline

```txt
core/
├── domain/
├── application/
└── infrastructure/

modules/
└── [feature]/

app/
└── routing/
```

### Main Rules
- UI tidak boleh akses Prisma langsung
- Route handler tidak boleh contain business logic
- Validation wajib sebelum mutation

---

# 11. Non Functional Requirements

## Security
- JWT session
- RBAC validation
- input sanitization

## Performance
- server-side pagination
- indexed query

## Maintainability
- strict TypeScript
- reusable components
- modular architecture

---

# 12. UX Standards

Semua halaman wajib memiliki:
- search
- filter
- sorting
- pagination
- loading state
- empty state
- error state

---

# 13. Release Plan

## Phase A
- login
- RBAC
- user/vendor listing

## Phase B
- booking management
- payment verification
- review moderation

## Phase C
- audit logs
- analytics
- governance

---

# 14. Acceptance Criteria

- hanya ADMIN bisa login
- permission memengaruhi menu user
- booking mengikuti state rules
- endpoint response konsisten

---

# 15. Final Architecture Decision

Admin Dashboard menggunakan:

✅ Fullstack Next.js  
✅ App Router  
✅ Server Actions  
✅ Route Handlers  
✅ Prisma ORM  
✅ PostgreSQL  
✅ Turbo Monorepo  
✅ Clean Architecture  
✅ RBAC Granular  
✅ Offline Payment Verification  
✅ Audit Logging  
✅ Soft Delete Policy  

---

# 16. Version

Version: 3.0.0  
Last Updated: May 27, 2026  
Status: Production-Ready Architecture
