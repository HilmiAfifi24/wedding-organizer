const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "superadmin@wedding-organizer.local";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Super Admin", role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  console.log("Seeded superadmin:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
