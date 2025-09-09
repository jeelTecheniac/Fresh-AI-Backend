import { Router } from "express";
import { RoleController } from "../controllers/RoleController.js";
import { validateRequest } from "../validation/middleware.js";
import { createRoleSchema } from "../validation/schemas/role.schema.js";

const router = Router();
const roleController = new RoleController();

router.post(
  "/",
  validateRequest(createRoleSchema, "body"),
  async (req, res) => {
    await roleController.create(req, res);
  }
);

export default router;
