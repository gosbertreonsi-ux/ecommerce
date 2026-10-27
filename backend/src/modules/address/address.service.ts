import prisma from "../../config/prisma";

export const getMyAddresses = async (
  userId: number,
) => {
  return prisma.address.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

export const createAddress = async (
  userId: number,
  data: {
    label: string;
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
    isDefault?: boolean;
  },
) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        isDefault: false,
      },
    });
  }

  return prisma.address.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const deleteAddress = async (
  userId: number,
  addressId: number,
) => {
  const address =
    await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
        deletedAt: null,
      },
    });

  if (!address) {
    throw new Error(
      "Address not found",
    );
  }

  await prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return {
    message: "Address deleted",
  };
};