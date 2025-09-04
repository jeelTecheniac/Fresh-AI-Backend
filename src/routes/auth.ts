import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { validateRequest } from "../validation/middleware.js";
import {
  registerUserSchema,
  loginSchema,
} from "../validation/schemas/user.schema.js";

const router = Router();
const userController = new UserController();

// User registration
router.post(
  "/register",
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

export default router;
