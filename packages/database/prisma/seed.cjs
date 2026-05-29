const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const adminEmail = "superadmin@wedding-organizer.local";
const adminPassword = "admin123";

const accessMenus = [
  {
    code: "DASHBOARD",
    name: "Dashboard",
    path: "/dashboard",
    sortOrder: 10,
    parentCode: null,
  },
  {
    code: "ACCESS_CONTROL",
    name: "Administrasi Akses",
    path: "/access-control",
    sortOrder: 20,
    parentCode: null,
  },
  {
    code: "USER_MANAGEMENT",
    name: "Manajemen User",
    path: "/users",
    sortOrder: 30,
    parentCode: null,
  },
  {
    code: "VENDOR_MANAGEMENT",
    name: "Manajemen Vendor",
    path: "/vendors",
    sortOrder: 40,
    parentCode: null,
  },
  {
    code: "BOOKING_MANAGEMENT",
    name: "Manajemen Booking",
    path: "/bookings",
    sortOrder: 50,
    parentCode: null,
  },
  {
    code: "PAYMENT_MONITORING",
    name: "Monitoring Pembayaran",
    path: "/payments",
    sortOrder: 60,
    parentCode: null,
  },
  {
    code: "REVIEW_MODERATION",
    name: "Moderasi Review",
    path: "/reviews",
    sortOrder: 70,
    parentCode: null,
  },
  {
    code: "AUDIT_LOG_DASHBOARD",
    name: "Audit Log",
    path: "/audit-logs",
    sortOrder: 80,
    parentCode: null,
  },
];

async function seedSuperAdminProfile() {
  const superAdminProfile = await prisma.accessProfile.upsert({
    where: { code: "SUPER_ADMIN" },
    update: {
      name: "Super Admin",
      description: "Full access to all admin features",
      isSystem: true,
    },
    create: {
      code: "SUPER_ADMIN",
      name: "Super Admin",
      description: "Full access to all admin features",
      isSystem: true,
    },
  });

  return superAdminProfile;
}

async function seedMenus() {
  for (const menu of accessMenus) {
    await prisma.accessMenu.upsert({
      where: { code: menu.code },
      update: {
        name: menu.name,
        path: menu.path,
        sortOrder: menu.sortOrder,
        isActive: true,
      },
      create: {
        code: menu.code,
        name: menu.name,
        path: menu.path,
        sortOrder: menu.sortOrder,
        isActive: true,
      },
    });
  }

  const menuByCode = await prisma.accessMenu.findMany({
    where: { code: { in: accessMenus.map((menu) => menu.code) } },
    select: { id: true, code: true },
  });

  const idByCode = new Map(menuByCode.map((menu) => [menu.code, menu.id]));

  for (const menu of accessMenus) {
    const parentId = menu.parentCode ? idByCode.get(menu.parentCode) ?? null : null;

    await prisma.accessMenu.update({
      where: { code: menu.code },
      data: {
        parentId,
      },
    });
  }

  return menuByCode;
}

async function seedAdminUser(superAdminProfileId) {
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Super Admin",
      role: "ADMIN",
      passwordHash,
      accessProfileId: superAdminProfileId,
    },
    create: {
      email: adminEmail,
      name: "Super Admin",
      role: "ADMIN",
      passwordHash,
      accessProfileId: superAdminProfileId,
    },
  });

  return admin;
}

async function seedPermissions(superAdminProfileId, menus) {
  await prisma.accessPermission.deleteMany({
    where: {
      accessProfileId: superAdminProfileId,
    },
  });

  if (menus.length === 0) return;

  await prisma.accessPermission.createMany({
    data: menus.map((menu) => ({
      accessProfileId: superAdminProfileId,
      accessMenuId: menu.id,
      canView: true,
      canInsert: true,
      canUpdate: true,
      canUpsert: true,
      canDelete: true,
      canHistory: true,
      customEvents: [],
    })),
  });
}

async function main() {
  const superAdminProfile = await seedSuperAdminProfile();
  const menus = await seedMenus();
  const admin = await seedAdminUser(superAdminProfile.id);
  await seedPermissions(superAdminProfile.id, menus);

  console.log("Seeded admin auth + RBAC core:");
  console.log("- Email:", admin.email);
  console.log("- Password:", adminPassword);
  console.log("- Access Profile:", superAdminProfile.code);
  console.log("- Menus:", menus.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
