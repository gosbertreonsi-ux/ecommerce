import prisma from "../../../config/prisma";

import type {
  CustomerQueryInput,
  UpdateCustomerStatusInput,
} from "./customer.validation";

export async function getCustomers(
  query: CustomerQueryInput,
) {
  const search =
    query.search?.trim();

  return prisma.user.findMany({
    where: {
      role: {
        name: "CUSTOMER",
      },

      deletedAt: null,

      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,

      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },

      orders: {
        where: {
          deletedAt: null,
        },

        select: {
          total: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomerById(
  id: number,
) {
  const customer =
    await prisma.user.findFirst({
      where: {
        id,

        role: {
          name: "CUSTOMER",
        },

        deletedAt: null,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,

        addresses: {
          where: {
            deletedAt: null,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        orders: {
          where: {
            deletedAt: null,
          },

          include: {
            payment: true,

            items: {
              where: {
                deletedAt: null,
              },

              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        reviews: {
          where: {
            deletedAt: null,
          },

          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

  if (!customer) {
    throw new Error(
      "Customer not found",
    );
  }

  return customer;
}

export async function updateCustomerStatus(
  id: number,
  data: UpdateCustomerStatusInput,
) {
  const customer =
    await prisma.user.findFirst({
      where: {
        id,

        role: {
          name: "CUSTOMER",
        },

        deletedAt: null,
      },
    });

  if (!customer) {
    throw new Error(
      "Customer not found",
    );
  }

  return prisma.user.update({
    where: {
      id,
    },

    data: {
      isActive:
        data.isActive,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      updatedAt: true,
    },
  });
}