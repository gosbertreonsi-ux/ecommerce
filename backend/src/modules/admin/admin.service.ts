import prisma from "../../config/prisma";

export const getDashboardStats =
  async () => {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingPayments,
      successfulPayments,
      failedPayments,
      revenueResult,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: {
            name: "CUSTOMER",
          },
          deletedAt: null,
        },
      }),

      prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "PENDING",
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "PAID",
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "PROCESSING",
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "SHIPPED",
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
          deletedAt: null,
        },
      }),

      prisma.order.count({
        where: {
          status: "CANCELLED",
          deletedAt: null,
        },
      }),

      prisma.payment.count({
        where: {
          status: "PENDING",
          deletedAt: null,
        },
      }),

      prisma.payment.count({
        where: {
          status: "SUCCESS",
          deletedAt: null,
        },
      }),

      prisma.payment.count({
        where: {
          status: "FAILED",
          deletedAt: null,
        },
      }),

      prisma.payment.aggregate({
        where: {
          status: "SUCCESS",
          deletedAt: null,
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.productVariant.findMany({
        where: {
          stock: {
            lte: 5,
          },
          product: {
            deletedAt: null,
            isActive: true,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          stock: "asc",
        },
      }),
    ]);

    return {
      overview: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue:
          revenueResult._sum.amount ?? 0,
      },

      orders: {
        pending: pendingOrders,
        paid: paidOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },

      payments: {
        pending: pendingPayments,
        successful: successfulPayments,
        failed: failedPayments,
      },

      inventory: {
        lowStockCount:
          lowStockProducts.length,

        lowStockProducts,
      },
    };
  };