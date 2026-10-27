import { Router } from "express";

import * as orderController from "./order.controller";

import {
authenticate,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
"/",
orderController.createOrder,
);

router.get(
"/",
orderController.getMyOrders,
);

router.get(
"/:id",
orderController.getOrderById,
);

export default router;
