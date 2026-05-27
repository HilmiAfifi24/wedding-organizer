# 🎉 Wedding Organizer Platform — Product Requirement Document (PRD)

## 1. Overview

Wedding Organizer Platform adalah platform monorepo fullstack untuk menghubungkan calon pengantin dengan vendor pernikahan.

Platform terdiri dari:

1. User Application
2. Vendor Portal
3. Admin Dashboard

---

# 2. Product Goals

## User Goals
- Mempermudah pencarian vendor
- Mempermudah booking vendor
- Transparansi status booking

## Vendor Goals
- Mempermudah mendapatkan client
- Mengelola layanan dan booking
- Analytics pendapatan

## Admin Goals
- Monitoring platform
- Mengelola user dan vendor
- Monitoring transaksi

---

# 3. Tech Stack

## Frontend & Backend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- Prisma ORM
- PostgreSQL
- Turbo Monorepo

## Infrastructure
- Vercel
- Neon / Supabase


---

# 4. Fullstack Architecture

```txt
Client Components
        ↓
Server Components
        ↓
Server Actions / Route Handlers
        ↓
Prisma ORM
        ↓
PostgreSQL
```

---

# 5. Monorepo Structure

```txt
wedding-organizer/
│
├── apps/
│   ├── admin/
│   ├── vendor/
│   └── user/
│
├── packages/
│   ├── database/
│   ├── shared-types/
│   ├── shared-utils/
│   └── ui-components/
│
└── docs/
```

---

# 6. Next.js App Structure (Clean Architecture)

```txt
src/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── vendors/
│   │   └── bookings/
│   │
│   ├── dashboard/
│   ├── vendors/
│   └── bookings/
│
├── modules/
│   ├── auth/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   ├── vendors/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   ├── bookings/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   └── dashboard/
│       ├── components/
│       ├── services/
│       └── types/
│
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── repositories/
│   ├── application/
│   │   ├── use-cases/
│   │   └── dto/
│   └── infrastructure/
│       ├── db/
│       ├── http/
│       └── storage/
│
└── shared/
        ├── components/
        ├── hooks/
        ├── lib/
        ├── store/
        ├── styles/
        ├── types/
        └── utils/
```

---

# 7. User Roles

## User
- Register & Login
- Search Vendor
- Booking Vendor
- Review Vendor

## Vendor
- Manage Services
- Manage Portfolio
- Accept / Reject Booking
- Analytics Revenue

## Admin
- Approve Vendor
- Suspend User
- Monitoring Analytics
- Monitoring Bookings

---

# 8. Authentication Module

## Features
- Credentials Login
- Google Login
- JWT Session
- Role-Based Access

## Recommended Stack
- Auth.js / NextAuth
- Prisma Adapter

---

# 9. Vendor Management Module

## Vendor Profile
Fields:
- vendor_name
- description
- category
- location
- contact_info
- price_range

## Vendor Portfolio
- Upload Images
- Upload Videos
- Add Descriptions

## Vendor Services
- Create Service
- Update Service
- Delete Service

---

# 10. Booking System

## Booking Flow

```txt
User memilih vendor
→ User memilih service
→ User menentukan tanggal
→ User submit booking
→ Booking status menjadi "pending_payment"
→ User melakukan pembayaran offline
→ Vendor/Admin melakukan verifikasi pembayaran
→ Booking status berubah menjadi "confirmed"
→ Vendor memproses booking
→ Booking selesai
```

## Booking Status

| Status | Description |
|---|---|
| pending | Menunggu vendor |
| pending_payment | Menunggu pembayaran offline |
| confirmed | Pembayaran sudah diverifikasi |
| rejected | Ditolak vendor |
| completed | Selesai |
| cancelled | Dibatalkan |

---

# 11. Offline Payment Verification

## Payment Flow

Sistem tidak menggunakan payment gateway online.

Pembayaran dilakukan secara offline:
- Transfer bank manual
- DP langsung
- Pembayaran cash

## Verification Flow

```txt
User upload bukti pembayaran
→ Admin/Vendor melakukan verifikasi
→ Jika valid:
   status = confirmed
→ Jika tidak valid:
   status tetap pending_payment
```

## Payment Proof
User dapat upload:
- Screenshot transfer
- Foto bukti pembayaran
- Bukti DP

---

# 12. Review & Rating Module

## Features
- User memberikan review
- User memberikan rating
- Vendor melihat review

## Rules
- Hanya booking completed yang dapat review
- Rating 1–5

---

# 13. Shared Packages

## shared-types
Berisi:
- Interfaces
- Enums
- Shared Types

## shared-utils
Berisi:
- Validation Helpers
- Formatters
- Utility Functions

## ui-components
Berisi reusable components:
- Button
- Card
- Modal
- Table
- Form Components

---

# 14. API Architecture

## Route Handlers

```txt
app/api/*
```

Example:

```txt
app/api/vendors/route.ts
app/api/bookings/route.ts
app/api/auth/login/route.ts
```

---

# 15. Server Actions

Semua form mutation menggunakan Server Actions.

Example:

```ts
"use server"

export async function createBooking(data) {
  // validation
  // prisma query
}
```

---

# 16. Database Architecture

## Main Entities
- User
- Vendor
- Service
- Booking
- Review
- Portfolio
- Category
- PaymentProof

---

# 17. Recommended Stack

## UI
- Tailwind CSS
- Shadcn UI
- Framer Motion

## State Management
- Zustand
- TanStack Query

## Form
- React Hook Form
- Zod

## Upload
- UploadThing / Cloudinary

---

# 18. AI Agent Rules

## IMPORTANT

### 1. Use App Router Only
Jangan gunakan Pages Router.

### 2. Use Server Components by Default
Gunakan Client Component hanya jika perlu.

### 3. Use Server Actions for Mutations
Gunakan Server Actions untuk create/update/delete.

### 4. Prisma Only in Server
Prisma tidak boleh dipanggil di client component.

### 5. Shared Validation
Gunakan:
- Zod
- Shared Schema Validation

### 6. Reusable Components
Semua reusable UI wajib di:
```txt
packages/ui-components
```

### 7. Strict TypeScript
Gunakan:
```json
"strict": true
```

---

# 19. Development Workflow

## Installation

```bash
npm install
```

## Run Development

```bash
npm run dev
```

## Seed Superadmin

```bash
npm run --workspace=database seed
```

## Build Project

```bash
npm run build
```

---

# 20. Recommended Development Order

## Phase 1
- Monorepo Setup
- Prisma Setup
- Authentication
- Shared Packages

## Phase 2
- Vendor CRUD
- Booking System
- Offline Payment Verification
- User Dashboard

## Phase 3
- Reviews
- Notifications
- Analytics Dashboard

---

# 21. Future Features

- Real-time Chat
- Mobile App
- Wedding Checklist Planner
- Vendor Calendar Availability

---

# 22. Final Architecture Decision

Platform menggunakan:

✅ Fullstack Next.js  
✅ Server Actions  
✅ Route Handlers  
✅ Prisma ORM  
✅ PostgreSQL  
✅ Turbo Monorepo  
✅ TypeScript Strict Mode  
✅ Modular Architecture

Tanpa backend Express terpisah.

Tanpa payment gateway online.

---

# 23. Status

| Module | Status |
|---|---|
| Monorepo Setup | ⏳ In Progress |
| Authentication | ⏳ In Progress |
| Booking System | ⏳ In Progress |
| Offline Payment Verification | ⏳ In Progress |

---

# 24. Version

Version: 1.0.0-beta  
Last Updated: May 26, 2026  
Status: In Development
