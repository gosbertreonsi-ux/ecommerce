import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

const createAdmin = async () => {
  const email = "admin@ecommerce.local";
  const password = "Admin@12345";

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const role = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      firstName: "System",
      lastName: "Administrator",
      password: hashedPassword,
      roleId: role.id,
      isActive: true,
      emailVerified: true,
      deletedAt: null,
    },
    create: {
      firstName: "System",
      lastName: "Administrator",
      email,
      password: hashedPassword,
      roleId: role.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("");
  console.log("=================================");
  console.log("ADMIN ACCOUNT CREATED");
  console.log("=================================");
  console.log(`ID:       ${admin.id}`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${role.name}`);
  console.log("=================================");
  console.log("");
};

createAdmin()
  .catch((error) => {
    console.error("Failed to create admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });