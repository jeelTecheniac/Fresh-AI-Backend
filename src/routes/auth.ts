import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { validateRequest } from "../validation/middleware.js";
import {
  registerUserSchema,
  loginSchema,
  forgotPasswordSchema,
} from "../validation/schemas/user.schema.js";

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

// User login
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  async (req, res) => {
    await userController.login(req, res);
  }
);

// Forgot password
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema, "body"),
  async (req, res) => {
    await userController.forgotPassword(req, res);
  }
);

export default router;
