/**
 * One-time setup for a fresh production database.
 * Requires DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD in the environment.
 * NEVER provides a default public admin password or seeds example products.
 * Run manually only after `npx prisma migrate deploy`.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { RoleName } from "@prisma/client";
import prisma from "../src/config/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !email.includes("@") || !password || password.length < 16) {
    throw new Error("Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters");
  }

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    create: { name: RoleName.ADMIN },
    update: {},
  });
  await prisma.role.upsert({
    where: { name: RoleName.CUSTOMER },
    create: { name: RoleName.CUSTOMER },
    update: {},
  });

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      firstName: "Store",
      lastName: "Administrator",
      email,
      password: hash,
      roleId: adminRole.id,
    },
    update: { password: hash, roleId: adminRole.id },
  });
  console.log("Customer and admin roles ready; production admin account configured.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
