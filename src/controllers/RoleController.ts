import { Response } from "express";
import { BaseController, AuthenticatedRequest } from "./BaseController.js";
import { RoleService, CreateRoleDto } from "../services/RoleService.js";

export class RoleController extends BaseController {
  private roleService: RoleService;

  constructor() {
    super();
    this.roleService = new RoleService();
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const role = await this.roleService.createRole(req.body);
        return role;
      },
      req,
      res,
      "Create role"
    );
  }
}
