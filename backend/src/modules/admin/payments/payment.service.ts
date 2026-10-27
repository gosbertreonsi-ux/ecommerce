import prisma from "../../../config/prisma";

import type {
  PaymentStatus,
} from "@prisma/client";

import type {
  PaymentQueryInput,
  UpdatePaymentStatusInput,
} from "./payment.validation";

const paymentInclude = {
  order: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      items: {
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
  },
};

export async function getPayments(
  query: PaymentQueryInput,
) {
  return prisma.payment.findMany({
    where: {
      deletedAt: null,

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),

      ...(query.method
        ? {
            method: query.method,
          }
        : {}),
    },

    include: paymentInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPaymentById(
  id: number,
) {
  const payment =
    await prisma.payment.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: paymentInclude,
    });

  if (!payment) {
    throw new Error(
      "Payment not found",
    );
  }

  return payment;
}

const allowedTransitions: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  PENDING: [
    "SUCCESS",
    "FAILED",
  ],

  SUCCESS: [
    "REFUNDED",
  ],

  FAILED: [
    "PENDING",
  ],

  REFUNDED: [],
};

export async function updatePaymentStatus(
  id: number,
  data: UpdatePaymentStatusInput,
) {
  const payment =
    await prisma.payment.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        order: true,
      },
    });

  if (!payment) {
    throw new Error(
      "Payment not found",
    );
  }

  const currentStatus =
    payment.status;

  const newStatus =
    data.status;

  if (
    currentStatus ===
    newStatus
  ) {
    throw new Error(
      `Payment is already ${newStatus}`,
    );
  }

  const allowed =
    allowedTransitions[
      currentStatus
    ];

  if (
    !allowed.includes(
      newStatus,
    )
  ) {
    throw new Error(
      `Cannot change payment status from ${currentStatus} to ${newStatus}`,
    );
  }

  if (
    newStatus === "FAILED" &&
    payment.order.status ===
      "PAID"
  ) {
    throw new Error(
      "A successful order payment cannot be marked as FAILED",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.payment.update({
        where: {
          id,
        },

        data: {
          status: newStatus,
        },
      });

      if (
        newStatus === "SUCCESS"
      ) {
        await tx.order.update({
          where: {
            id: payment.orderId,
          },

          data: {
            status: "PAID",
          },
        });
      }

      if (
        newStatus === "REFUNDED"
      ) {
        await tx.order.update({
          where: {
            id: payment.orderId,
          },

          data: {
            status: "CANCELLED",
          },
        });
      }

      return tx.payment.findUnique({
        where: {
          id,
        },

        include: paymentInclude,
      });
    },
  );
}