# Validation Module

This folder contains reusable Joi validation utilities for the project.

Structure:

```
src/validation/
├── middleware.ts          # Generic validation middlewares (request, multiple, pagination, auth headers)
├── index.ts               # Barrel exports
└── schemas/
    ├── common.schema.ts   # Reusable Joi patterns (email, password, uuid, etc.)
    └── user.schema.ts     # User-related schemas (register, login, update, params, pagination)
```

Usage in routes:

```ts
import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import {
  validateRequest,
  validatePagination,
} from "../validation/middleware.js";
import {
  registerUserSchema,
  loginSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "../validation/schemas/user.schema.js";

const router = Router();
const controller = new UserController();

router.post(
  "/register",
  validateRequest(registerUserSchema, "body"),
  controller.register.bind(controller)
);
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  controller.login.bind(controller)
);
router.put(
  "/profile",
  validateRequest(updateProfileSchema, "body"),
  controller.updateProfile.bind(controller)
);
router.get("/", validatePagination(), controller.getAllUsers.bind(controller));
router.get(
  "/:id",
  validateRequest(userIdParamSchema, "params"),
  controller.getUserById.bind(controller)
);
```
