import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import {
  validateRequest,
  validatePagination,
} from "../validation/middleware.js";
import {
  updateProfileSchema,
  userIdParamSchema,
} from "../validation/schemas/user.schema.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const userController = new UserController();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// Get current user profile
router.get("/profile", async (req, res) => {
  await userController.getProfile(req, res);
});

// Update current user profile
router.put(
  "/profile",
  validateRequest(updateProfileSchema, "body"),
  async (req, res) => {
    await userController.updateProfile(req, res);
  }
);

// Get all users with pagination
router.get("/", validatePagination(), async (req, res) => {
  await userController.getAllUsers(req, res);
});

// Get user by ID
router.get(
  "/:id",
  validateRequest(userIdParamSchema, "params"),
  async (req, res) => {
    await userController.getUserById(req, res);
  }
);

// Delete user (admin only)
router.delete(
  "/:id",
  validateRequest(userIdParamSchema, "params"),
  async (req, res) => {
    await userController.deleteUser(req, res);
  }
);

export default router;
