import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { validateRequest } from "../validation/middleware.js";
import {
  registerUserSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetPasswordToken,
  resetPasswordSchema,
  registeAdminUserSchema,
} from "../validation/schemas/user.schema.js";
import { authMiddleware } from "@/middleware/auth.js";

const router = Router();
const userController = new UserController();

// User registration
router.post(
  "/create-super-admin-user",
  validateRequest(registerUserSchema, "body"),
  async (req, res) => {
    await userController.register(req, res);
  }
);

// Admin registration
router.post(
  "/create-admin-user",
  validateRequest(registeAdminUserSchema, "body"),
  authMiddleware,
  async (req, res) => {
    await userController.register(req, res);
  }
);

// User login
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  async (req, res) => {
    await userController.login(req, res);
  }
);

// Forgot password (handles both initial request and resend)
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema, "body"),
  async (req, res) => {
    await userController.forgotPassword(req, res);
  }
);
router.get(
  "/verify-reset-password-token",
  validateRequest(verifyResetPasswordToken, "query"),
  async (req, res) => {
    await userController.verifyResetPasswordToken(req, res);
  }
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema, "body"),
  async (req, res) => {
    await userController.resetPassword(req, res);
  }
);

export default router;
