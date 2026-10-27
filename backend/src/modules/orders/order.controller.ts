import {
Request,
Response,
NextFunction,
} from "express";

import * as orderService from "./order.service";

import {
createOrderSchema,
} from "./order.validation";

export const createOrder = async (
req: Request,
res: Response,
next: NextFunction,
) => {
try {
const data =
createOrderSchema.parse(
req.body,
);

const order =
  await orderService.createOrder(
    req.user!.id,
    data,
  );

res.status(201).json({
  success: true,

  message:
    "Order created successfully",

  data: order,
});

} catch (error) {
next(error);
}
};

export const getMyOrders = async (
req: Request,
res: Response,
next: NextFunction,
) => {
try {
const orders =
await orderService.getMyOrders(
req.user!.id,
);

res.status(200).json({
  success: true,

  data: orders,
});

} catch (error) {
next(error);
}
};

export const getOrderById = async (
req: Request,
res: Response,
next: NextFunction,
) => {
try {
const orderId =
Number(req.params.id);
if (
  !Number.isInteger(orderId) ||
  orderId <= 0
) {
  throw new Error(
    "Invalid order ID",
  );
}

const order =
  await orderService.getOrderById(
    req.user!.id,
    orderId,
  );

res.status(200).json({
  success: true,

  data: order,
});

} catch (error) {
next(error);
}
};
