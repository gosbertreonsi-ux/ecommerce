import "dotenv/config";

import bcrypt from "bcrypt";

import {
  RoleName,
} from "@prisma/client";

import prisma from "../src/config/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // =========================================================
  // ROLES
  // =========================================================

  const adminRole =
    await prisma.role.upsert({
      where: {
        name: RoleName.ADMIN,
      },

      update: {},

      create: {
        name: RoleName.ADMIN,
      },
    });

  const customerRole =
    await prisma.role.upsert({
      where: {
        name: RoleName.CUSTOMER,
      },

      update: {},

      create: {
        name: RoleName.CUSTOMER,
      },
    });

  console.log("✅ Roles created");

  // =========================================================
  // ADMIN USER
  // =========================================================

  const password =
    await bcrypt.hash(
      "Admin123!",
      10,
    );

  await prisma.user.upsert({
    where: {
      email: "admin@ecommerce.com",
    },

    update: {},

    create: {
      firstName: "System",
      lastName: "Administrator",
      email: "admin@ecommerce.com",
      password,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Admin account created");

  // =========================================================
  // CATEGORIES
  // =========================================================

  const electronics =
    await prisma.category.upsert({
      where: {
        slug: "electronics",
      },

      update: {},

      create: {
        name: "Electronics",
        slug: "electronics",
        description:
          "Phones, computers, accessories and electronic devices.",
      },
    });

  const fashion =
    await prisma.category.upsert({
      where: {
        slug: "fashion",
      },

      update: {},

      create: {
        name: "Fashion",
        slug: "fashion",
        description:
          "Clothing, shoes and fashion accessories.",
      },
    });

  const home =
    await prisma.category.upsert({
      where: {
        slug: "home-living",
      },

      update: {},

      create: {
        name: "Home & Living",
        slug: "home-living",
        description:
          "Products for your home and everyday living.",
      },
    });

  console.log("✅ Categories created");

  // =========================================================
  // BRANDS
  // =========================================================

  const samsung =
    await prisma.brand.upsert({
      where: {
        slug: "samsung",
      },

      update: {},

      create: {
        name: "Samsung",
        slug: "samsung",
        description:
          "Samsung electronics and mobile devices.",
      },
    });

  const apple =
    await prisma.brand.upsert({
      where: {
        slug: "apple",
      },

      update: {},

      create: {
        name: "Apple",
        slug: "apple",
        description:
          "Apple technology products.",
      },
    });

  const generic =
    await prisma.brand.upsert({
      where: {
        slug: "e-shop",
      },

      update: {},

      create: {
        name: "E-Shop",
        slug: "e-shop",
        description:
          "E-Shop everyday products.",
      },
    });

  console.log("✅ Brands created");

  // =========================================================
  // PRODUCT 1
  // =========================================================

  const phone =
    await prisma.product.upsert({
      where: {
        slug: "samsung-galaxy-a55",
      },

      update: {},

      create: {
        name: "Samsung Galaxy A55",
        slug: "samsung-galaxy-a55",

        description:
          "A modern Samsung smartphone with a high-quality display, reliable performance and long battery life.",

        sku: "SAM-A55-001",

        brandId: samsung.id,
        categoryId: electronics.id,

        price: "950000",
        costPrice: "780000",

        isFeatured: true,
        isActive: true,

        images: {
          create: [
            {
              imageUrl:
                "https://placehold.co/800x800?text=Samsung+Galaxy+A55",
              altText:
                "Samsung Galaxy A55",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
        },

        variants: {
          create: [
            {
              name: "Storage",
              value: "128GB",
              sku: "SAM-A55-128",
              stock: 15,
            },
            {
              name: "Storage",
              value: "256GB",
              sku: "SAM-A55-256",
              stock: 10,
            },
          ],
        },
      },
    });

  // =========================================================
  // PRODUCT 2
  // =========================================================

  const iphone =
    await prisma.product.upsert({
      where: {
        slug: "apple-iphone-15",
      },

      update: {},

      create: {
        name: "Apple iPhone 15",
        slug: "apple-iphone-15",

        description:
          "A powerful Apple smartphone designed for everyday performance, photography and entertainment.",

        sku: "APP-IP15-001",

        brandId: apple.id,
        categoryId: electronics.id,

        price: "1850000",
        costPrice: "1600000",

        isFeatured: true,
        isActive: true,

        images: {
          create: [
            {
              imageUrl:
                "https://placehold.co/800x800?text=iPhone+15",
              altText:
                "Apple iPhone 15",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
        },

        variants: {
          create: [
            {
              name: "Storage",
              value: "128GB",
              sku: "APP-IP15-128",
              stock: 8,
            },
            {
              name: "Storage",
              value: "256GB",
              sku: "APP-IP15-256",
              stock: 5,
            },
          ],
        },
      },
    });

  // =========================================================
  // PRODUCT 3
  // =========================================================

  const headphones =
    await prisma.product.upsert({
      where: {
        slug: "wireless-headphones",
      },

      update: {},

      create: {
        name: "Wireless Headphones",
        slug: "wireless-headphones",

        description:
          "Comfortable wireless headphones with clear sound and a long-lasting battery.",

        sku: "ESH-HEAD-001",

        brandId: generic.id,
        categoryId: electronics.id,

        price: "85000",
        costPrice: "55000",

        isFeatured: false,
        isActive: true,

        images: {
          create: [
            {
              imageUrl:
                "https://placehold.co/800x800?text=Wireless+Headphones",
              altText:
                "Wireless Headphones",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
        },

        variants: {
          create: [
            {
              name: "Color",
              value: "Black",
              sku: "ESH-HEAD-BLK",
              stock: 25,
            },
            {
              name: "Color",
              value: "White",
              sku: "ESH-HEAD-WHT",
              stock: 18,
            },
          ],
        },
      },
    });

  // =========================================================
  // PRODUCT 4
  // =========================================================

  const tshirt =
    await prisma.product.upsert({
      where: {
        slug: "classic-cotton-tshirt",
      },

      update: {},

      create: {
        name: "Classic Cotton T-Shirt",
        slug: "classic-cotton-tshirt",

        description:
          "A comfortable everyday cotton T-shirt suitable for casual wear.",

        sku: "ESH-TSHIRT-001",

        brandId: generic.id,
        categoryId: fashion.id,

        price: "35000",
        costPrice: "20000",

        isFeatured: false,
        isActive: true,

        images: {
          create: [
            {
              imageUrl:
                "https://placehold.co/800x800?text=Cotton+T-Shirt",
              altText:
                "Classic Cotton T-Shirt",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
        },

        variants: {
          create: [
            {
              name: "Size",
              value: "M",
              sku: "ESH-TSHIRT-M",
              stock: 20,
            },
            {
              name: "Size",
              value: "L",
              sku: "ESH-TSHIRT-L",
              stock: 15,
            },
            {
              name: "Size",
              value: "XL",
              sku: "ESH-TSHIRT-XL",
              stock: 10,
            },
          ],
        },
      },
    });

  // =========================================================
  // PRODUCT 5
  // =========================================================

  const lamp =
    await prisma.product.upsert({
      where: {
        slug: "modern-desk-lamp",
      },

      update: {},

      create: {
        name: "Modern Desk Lamp",
        slug: "modern-desk-lamp",

        description:
          "A simple modern desk lamp for studying, working and reading.",

        sku: "ESH-LAMP-001",

        brandId: generic.id,
        categoryId: home.id,

        price: "65000",
        costPrice: "40000",

        isFeatured: true,
        isActive: true,

        images: {
          create: [
            {
              imageUrl:
                "https://placehold.co/800x800?text=Desk+Lamp",
              altText:
                "Modern Desk Lamp",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
        },

        variants: {
          create: [
            {
              name: "Color",
              value: "Black",
              sku: "ESH-LAMP-BLK",
              stock: 12,
            },
            {
              name: "Color",
              value: "White",
              sku: "ESH-LAMP-WHT",
              stock: 9,
            },
          ],
        },
      },
    });

  console.log("✅ Products created");

  console.log(
    `📦 Seeded products: ${[
      phone,
      iphone,
      headphones,
      tshirt,
      lamp,
    ].length}`,
  );

  console.log("🎉 Database seeded successfully");

  console.log("\nAdmin login:");
  console.log("Email: admin@ecommerce.com");
  console.log("Password: Admin123!");

  // Prevent unused-variable warnings for the customer role.
  console.log(
    `Customer role ID: ${customerRole.id}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "❌ Seed failed:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });