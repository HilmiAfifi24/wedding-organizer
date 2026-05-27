const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "superadmin@wedding-organizer.local";
  const passwordHash = bcrypt.hashSync("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      name: "Super Admin", 
      role: "ADMIN",
      passwordHash: passwordHash
    },
    create: {
      email: adminEmail,
      name: "Super Admin",
      role: "ADMIN",
      passwordHash: passwordHash
    },
  });

  console.log("Seeded superadmin with password:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
