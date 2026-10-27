import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, authController.me);
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;